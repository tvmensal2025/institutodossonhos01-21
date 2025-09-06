import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Max-Age': '86400',
};

// Tipos para melhor type safety
interface RequestPayload {
  documentId?: string;
  userId: string;
  examType?: string;
  imageUrls?: string[];
  tmpPaths?: string[];
  title?: string;
  idempotencyKey?: string;
}

interface DocumentData {
  id: string;
  user_id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Utilitário para retry com backoff exponencial
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou:`, error.message);
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Backoff exponencial: 1s, 2s, 4s...
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`🔄 Aguardando ${delay}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Validação de entrada robusta
function validateRequestPayload(payload: any): RequestPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload inválido: deve ser um objeto');
  }
  
  if (!payload.userId || typeof payload.userId !== 'string') {
    throw new Error('userId é obrigatório e deve ser uma string');
  }
  
  // Validações opcionais com fallbacks seguros
  const validated: RequestPayload = {
    documentId: payload.documentId || undefined,
    userId: payload.userId,
    examType: payload.examType || 'exame_laboratorial',
    imageUrls: Array.isArray(payload.imageUrls) ? payload.imageUrls : [],
    tmpPaths: Array.isArray(payload.tmpPaths) ? payload.tmpPaths : [],
    title: payload.title || 'Exame Médico',
    idempotencyKey: payload.idempotencyKey || `${Date.now()}-${Math.random().toString(36)}`
  };
  
  // Validar que pelo menos documentId ou tmpPaths está presente
  if (!validated.documentId && (!validated.tmpPaths || validated.tmpPaths.length === 0)) {
    throw new Error('Deve fornecer documentId OU tmpPaths para processar');
  }
  
  return validated;
}

// Criar documento com dados completos e validação
async function createDocument(
  supabase: any, 
  payload: RequestPayload
): Promise<string> {
  console.log('📝 Criando novo documento médico...');
  
  const documentData = {
    user_id: payload.userId,
    title: payload.title,
    type: payload.examType,
    status: 'normal',
    analysis_status: 'pending',
    processing_stage: 'criado',
    progress_pct: 0,
    idempotency_key: payload.idempotencyKey,
    report_meta: {
      created_at: new Date().toISOString(),
      tmp_paths: payload.tmpPaths,
      original_images_count: payload.imageUrls?.length || 0,
      source: 'finalize-medical-document'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('📋 Dados do documento a criar:', {
    user_id: documentData.user_id,
    title: documentData.title,
    type: documentData.type,
    tmp_paths_count: payload.tmpPaths?.length || 0,
    idempotency_key: documentData.idempotency_key
  });
  
  const { data: newDoc, error: createError } = await supabase
    .from('medical_documents')
    .insert(documentData)
    .select()
    .single();
    
  if (createError) {
    console.error('❌ Erro detalhado ao criar documento:', createError);
    throw new Error(`Falha ao criar documento: ${createError.message}`);
  }
  
  if (!newDoc?.id) {
    throw new Error('Documento criado mas ID não retornado');
  }
  
  console.log('✅ Documento criado com sucesso:', newDoc.id);
  return newDoc.id;
}

// Verificar documento existente
async function verifyDocument(
  supabase: any, 
  documentId: string, 
  userId: string
): Promise<void> {
  console.log('🔍 Verificando documento existente:', documentId);
  
  const { data: docCheck, error: docError } = await supabase
    .from('medical_documents')
    .select('id, user_id, status, analysis_status, title, type')
    .eq('id', documentId)
    .eq('user_id', userId) // Verificar ownership
    .single();
  
  if (docError) {
    console.error('❌ Erro ao verificar documento:', docError);
    throw new Error(`Documento não encontrado ou sem permissão: ${docError.message}`);
  }
  
  if (!docCheck) {
    throw new Error(`Documento ${documentId} não encontrado ou não pertence ao usuário`);
  }
  
  console.log('✅ Documento verificado:', {
    id: docCheck.id,
    status: docCheck.status,
    analysis_status: docCheck.analysis_status,
    title: docCheck.title,
    type: docCheck.type
  });
}

// Função para converter blob para base64 - OTIMIZADA PARA PERFORMANCE
async function toBase64(blob: Blob, fallbackMime?: string) {
  const arr = await blob.arrayBuffer();
  const mt = (blob.type && blob.type !== 'application/octet-stream') ? blob.type : (fallbackMime || 'image/jpeg');
  
  // Usar abordagem mais eficiente para blobs menores
  if (arr.byteLength < 1024 * 1024) { // < 1MB
    const bytes = new Uint8Array(arr);
    const binary = String.fromCharCode(...bytes);
    const base64 = btoa(binary);
    return { mime: mt, data: `data:${mt};base64,${base64}` };
  }
  
  // Para arquivos maiores, usar chunks menores
  const bytes = new Uint8Array(arr);
  const chunkSize = 0x4000; // 16KB por chunk (menor que antes)
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
    
    // Yield para evitar bloqueio de CPU a cada 10 chunks
    if (i % (chunkSize * 10) === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  const base64 = btoa(binary);
  return { mime: mt, data: `data:${mt};base64,${base64}` };
}

// Detectar tipo MIME do arquivo
function guessMimeFromPath(path: string): string {
  const ext = (path.split('.').pop() || '').toLowerCase();
  if (['jpg', 'jpeg', 'jfif'].includes(ext)) return 'image/jpeg';
  if (['png'].includes(ext)) return 'image/png';
  if (['pdf'].includes(ext)) return 'application/pdf';
  return 'image/jpeg';
}

// Análise médica integrada - TUDO EM UMA FUNÇÃO
async function analyzeAndProcessExam(
  supabase: any,
  payload: RequestPayload,
  documentId: string
): Promise<any> {
  console.log('🔬 Iniciando análise médica integrada...');
  
  // Buscar dados do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', payload.userId)
    .single();
  
  console.log('👤 Perfil do usuário carregado:', profile?.full_name || 'Sem nome');
  
  // Processar imagens dos tmpPaths
  let examImages: { mime: string; data: string }[] = [];
  
  if (payload.tmpPaths && payload.tmpPaths.length > 0) {
    console.log('📥 Processando', payload.tmpPaths.length, 'imagens...');
    
    // Limitar para evitar CPU timeout (máximo 10 imagens)
    const limitedPaths = payload.tmpPaths.slice(0, 10);
    if (payload.tmpPaths.length > 10) {
      console.log(`⚠️ LIMITAÇÃO: Processando apenas 10 imagens de ${payload.tmpPaths.length} enviadas`);
    }
    
    for (let i = 0; i < limitedPaths.length; i++) {
      const tmpPath = limitedPaths[i];
      
      try {
        console.log(`📥 Baixando ${i + 1}/${limitedPaths.length}:`, tmpPath);
        
        // Monitoramento de CPU/Memória ANTES do processamento
        try {
          const memUsage = Deno.memoryUsage();
          console.log(`🔍 Memória ANTES da imagem ${i + 1}: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
        } catch (e) {
          console.log(`🔍 Processando imagem ${i + 1}/${limitedPaths.length}`);
        }
        
        // Timeout mais agressivo para download
        const downloadPromise = supabase.storage
          .from('medical-documents')
          .download(tmpPath);
          
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Download timeout')), 15000) // 15s timeout
        );
        
        const { data: fileBlob, error: downloadError } = await Promise.race([
          downloadPromise,
          timeoutPromise
        ]) as any;
        
        if (downloadError || !fileBlob) {
          console.warn('⚠️ Erro ao baixar:', tmpPath, downloadError);
          continue;
        }
        
        // Timeout para conversão base64
        const conversionPromise = toBase64(fileBlob, guessMimeFromPath(tmpPath));
        const conversionTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Conversion timeout')), 10000) // 10s timeout
        );
        
        const base64Image = await Promise.race([
          conversionPromise,
          conversionTimeout
        ]) as any;
        
        examImages.push(base64Image);
        console.log(`✅ Imagem ${i + 1}/${limitedPaths.length} processada:`, tmpPath);
        
        // Monitoramento de CPU/Memória DEPOIS do processamento
        try {
          const memUsage = Deno.memoryUsage();
          console.log(`🔍 Memória DEPOIS da imagem ${i + 1}: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
        } catch (e) {
          console.log(`✅ Imagem ${i + 1} concluída`);
        }
        
        // Pequena pausa entre imagens para evitar sobrecarga
        if (i < limitedPaths.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
      } catch (error) {
        console.warn('⚠️ Erro ao processar imagem:', tmpPath, error);
        continue; // Continuar com próxima imagem
      }
    }
  }
  
  console.log('📊 Total de imagens processadas:', examImages.length);
  
  // Se não tem imagens, retornar análise básica
  if (examImages.length === 0) {
    console.log('📝 Gerando análise básica (sem imagens)');
    return generateBasicAnalysis(profile);
  }
  
  // Chamar OpenAI para análise das imagens
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!OPENAI_API_KEY) {
    console.warn('⚠️ OpenAI API Key não configurada, usando análise básica');
    return generateBasicAnalysis(profile);
  }
  
  try {
    console.log('🤖 Chamando OpenAI para análise...');
    
    const systemPrompt = `Você é o Dr. Vital, IA médica do Instituto dos Sonhos. Analise os exames médicos nas imagens e gere um relatório em português brasileiro.

Paciente: ${profile?.full_name || 'Paciente'}
Idade: ${profile?.age || 'Não informada'}
Gênero: ${profile?.gender || 'Não informado'}

Gere uma análise clara e didática dos resultados encontrados.`;
    
    // Usar qualidade adaptativa baseada no número de imagens
    const imageDetail = examImages.length > 4 ? 'low' : 'high';
    console.log(`🖼️ Processando ${examImages.length} imagens com qualidade: ${imageDetail}`);
    
    // Função para chamar a API com retry
    const callOpenAIWithRetry = async (retries = 2) => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          console.log(`🤖 Tentativa ${attempt + 1}/${retries + 1} de chamar OpenAI...`);
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [{
                role: 'user',
                content: [
                  { type: 'text', text: systemPrompt },
                  ...examImages.map(img => ({
                    type: 'image_url',
                    image_url: { url: img.data, detail: imageDetail }
                  }))
                ]
              }],
              max_completion_tokens: 8000 // Modelo premium com mais tokens
            }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
          }
          
          return response;
        } catch (error) {
          console.error(`❌ Tentativa ${attempt + 1} falhou:`, error);
          
          if (attempt === retries) {
            throw error; // Última tentativa, propagar erro
          }
          
          // Esperar antes de tentar novamente (backoff exponencial)
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
          console.log(`⏱️ Aguardando ${waitTime}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    };
    
    const openAIPromise = callOpenAIWithRetry();
    
    // Timeout para OpenAI (20 segundos)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('OpenAI timeout')), 20000)
    );
    
    const response = await Promise.race([openAIPromise, timeoutPromise]) as Response;
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const aiData = await response.json();
    const analysisText = aiData.choices[0]?.message?.content || 'Análise não disponível';
    
    console.log('✅ Análise OpenAI concluída');
    
    return {
      analysis: analysisText,
      imageCount: examImages.length,
      service: 'openai-gpt-4o'
    };
    
  } catch (error) {
    console.error('❌ Erro na análise OpenAI:', error);
    console.log('📝 Usando análise básica como fallback');
    return generateBasicAnalysis(profile);
  }
}

// Análise básica quando IA não está disponível
function generateBasicAnalysis(profile: any) {
  const patientName = profile?.full_name || 'Paciente';
  const date = new Date().toLocaleDateString('pt-BR');
  
  return {
    analysis: `# Relatório Médico - Dr. Vital\n\n## Paciente: ${patientName}\n\nDocumento médico recebido em ${date}. Análise em processamento.\n\n### Próximos Passos\n- Consultar médico especialista\n- Manter acompanhamento regular\n- Seguir orientações médicas`,
    imageCount: 0,
    service: 'fallback'
  };
}

// Gerar HTML do relatório médico
function generateHTMLReport(analysis: string, userId: string, documentId: string): string {
  const date = new Date().toLocaleDateString('pt-BR');
  const time = new Date().toLocaleTimeString('pt-BR');
  
  // Converter markdown básico para HTML
  const htmlContent = analysis
    .replace(/# (.*)/g, '<h1>$1</h1>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Médico Completo</title>
  <style>
    :root {
      --primary: #1e40af;
      --primary-light: #3b82f6;
      --primary-dark: #1e3a8a;
      --accent: #f59e0b;
      --text-dark: #1f2937;
      --text-medium: #4b5563;
      --text-light: #9ca3af;
      --bg-white: #ffffff;
      --bg-light: #f3f4f6;
      --bg-secondary: #f8fafc;
      --border-color: #e5e7eb;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --border-radius: 8px;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      --font-main: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-main);
      background-color: var(--bg-light);
      color: var(--text-dark);
      line-height: 1.5;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border-radius: 10px;
      padding: 24px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%;
      transform: translate(30%, -30%);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      z-index: 1;
    }

    .header-icon {
      background-color: white;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: var(--primary);
      box-shadow: var(--shadow-md);
    }

    .header-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .header-subtitle {
      font-size: 14px;
      opacity: 0.9;
    }

    .welcome-message {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .welcome-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .welcome-text {
      font-size: 15px;
      line-height: 1.6;
      color: var(--text-dark);
    }

    .info-bar {
      display: flex;
      background-color: var(--bg-white);
      border-radius: var(--border-radius);
      margin-bottom: 24px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .info-item {
      flex: 1;
      padding: 16px;
      text-align: center;
      border-right: 1px solid var(--border-color);
    }

    .info-item:last-child {
      border-right: none;
    }

    .info-label {
      font-size: 14px;
      color: var(--text-medium);
      margin-bottom: 4px;
    }

    .info-value {
      font-weight: 600;
      color: var(--text-dark);
    }

    .card {
      background-color: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
    }

    .section-title {
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
    }

    .section-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background-color: var(--primary-light);
      color: white;
      border-radius: 6px;
      margin-right: 10px;
      font-size: 14px;
    }

    .summary-text {
      color: var(--text-medium);
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .footer {
      text-align: center;
      padding: 24px 0;
      background-color: var(--primary-dark);
      color: white;
      border-radius: 10px;
      margin-top: 24px;
    }

    .footer-logo {
      font-size: 24px;
      margin-bottom: 12px;
    }

    .footer-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .footer-subtitle {
      font-size: 14px;
      opacity: 0.8;
      margin-bottom: 16px;
    }

    .footer-contact {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin: 16px 0;
      flex-wrap: wrap;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .contact-icon {
      font-size: 16px;
    }

    .footer-disclaimer {
      font-size: 12px;
      opacity: 0.8;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .content h1, .content h2, .content h3 {
      color: var(--primary);
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .content p {
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }

      .header {
        padding: 20px;
      }

      .info-bar {
        flex-direction: column;
      }

      .info-item {
        border-right: none;
        border-bottom: 1px solid var(--border-color);
      }

      .info-item:last-child {
        border-bottom: none;
      }

      .footer-contact {
        flex-direction: column;
        gap: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="header-content">
        <div class="header-icon">👨‍⚕️</div>
        <div>
          <h1 class="header-title">Relatório Médico Completo</h1>
          <p class="header-subtitle">Dr. Vital - IA Médica Avançada</p>
        </div>
      </div>
    </header>

    <div class="welcome-message">
      <div class="welcome-icon">👋</div>
      <div class="welcome-text">
        <strong>Olá! Sou o Dr. Vital, sua IA médica.</strong> Vou explicar seus exames de forma bem simples, como se estivesse conversando com um amigo. Não se preocupe com termos complicados - vou explicar tudo de forma clara e fácil de entender!
      </div>
    </div>

    <div class="info-bar">
      <div class="info-item">
        <div class="info-label">Data</div>
        <div class="info-value">${date}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Hora</div>
        <div class="info-value">${time}</div>
      </div>
      <div class="info-item">
        <div class="info-label">ID Exame</div>
        <div class="info-value">#${documentId.substring(0, 8)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div class="info-value">Processado</div>
      </div>
    </div>

    <section class="card">
      <h2 class="section-title">
        <span class="section-icon">📊</span>
        Análise Médica
      </h2>
      <div class="summary-text">
        ${htmlContent}
      </div>
    </section>
    
    <footer class="footer">
      <div class="footer-logo">🏥</div>
      <div class="footer-title">Instituto dos Sonhos</div>
      <div class="footer-subtitle">Análise Médica Inteligente</div>
      
      <div class="footer-contact">
        <div class="contact-item">
          <span class="contact-icon">📱</span>
          <span>WhatsApp: (11) 98900-0650</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">🌐</span>
          <span>www.institutodossonhos.com.br</span>
        </div>
      </div>
      
      <div class="footer-disclaimer">
        <strong>⚠️ IMPORTANTE:</strong> Este relatório é gerado automaticamente por IA e tem caráter educativo. 
        <strong>NÃO substitui a consulta com um profissional de saúde.</strong> 
        Consulte sempre um médico para interpretação clínica adequada e orientações personalizadas.
      </div>
    </footer>
  </div>
</body>
</html>`;
}

// Função principal da Edge Function
serve(async (req) => {
  // Tratar CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Variáveis para tracking
  let requestId: string;
  let documentId: string | undefined;
  let userId: string | undefined;
  
  try {
    // Gerar ID único para esta requisição
    requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🚀 === INICIANDO FINALIZE-MEDICAL-DOCUMENT ===');
    console.log('🆔 Request ID:', requestId);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('🌐 Method:', req.method);
    console.log('📍 URL:', req.url);
    
    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase não encontrada');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase inicializado');
    
    // Parsear e validar payload
    let rawPayload: any;
    try {
      rawPayload = await req.json();
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      throw new Error('JSON inválido no body da requisição');
    }
    
    console.log('📥 Payload bruto recebido:', Object.keys(rawPayload));
    
    const payload = validateRequestPayload(rawPayload);
    userId = payload.userId;
    
    console.log('✅ Payload validado:', {
      userId: payload.userId,
      examType: payload.examType,
      title: payload.title,
      hasDocumentId: !!payload.documentId,
      imageUrlsCount: payload.imageUrls?.length || 0,
      tmpPathsCount: payload.tmpPaths?.length || 0,
      idempotencyKey: payload.idempotencyKey
    });
    
    // Determinar ou criar documentId
    let actualDocumentId: string;
    
    if (payload.documentId) {
      // Verificar documento existente
      await verifyDocument(supabase, payload.documentId, payload.userId);
      actualDocumentId = payload.documentId;
      console.log('✅ Usando documento existente:', actualDocumentId);
    } else {
      // Criar novo documento
      actualDocumentId = await createDocument(supabase, payload);
      console.log('✅ Novo documento criado:', actualDocumentId);
    }
    
    documentId = actualDocumentId;
    
    // Atualizar status do documento para 'processando'
    console.log('🔄 Atualizando status do documento...');
    const { error: updateError } = await supabase
        .from('medical_documents')
      .update({
        status: 'normal',
        analysis_status: 'processing',
        processing_stage: 'iniciando_analise',
        progress_pct: 5,
          updated_at: new Date().toISOString()
        })
      .eq('id', actualDocumentId);
    
    if (updateError) {
      console.warn('⚠️ Erro ao atualizar status (não crítico):', updateError);
    } else {
      console.log('✅ Status do documento atualizado');
    }
    
    // Executar análise médica integrada
    const analysisResult = await analyzeAndProcessExam(supabase, payload, actualDocumentId);
    
    // Gerar HTML do relatório
    const htmlReport = generateHTMLReport(analysisResult.analysis, payload.userId, actualDocumentId);
    
    // Salvar relatório no storage
    console.log('💾 Salvando relatório HTML...');
    const reportPath = `${payload.userId}/${actualDocumentId}_report.html`;
    
    const { error: saveError } = await supabase.storage
      .from('medical-documents-reports')
      .upload(reportPath, new Blob([htmlReport], { type: 'text/html' }), { upsert: true });
    
    if (saveError) {
      console.warn('⚠️ Erro ao salvar relatório (não crítico):', saveError);
    } else {
      console.log('✅ Relatório salvo com sucesso');
    }
    
    // Atualizar documento como finalizado
    await supabase
      .from('medical_documents')
      .update({
        analysis_status: 'ready',
        status: 'normal',
        processing_stage: 'finalizado',
        progress_pct: 100,
        report_path: reportPath,
        report_content: analysisResult.analysis,
        report_meta: {
          generated_at: new Date().toISOString(),
          service_used: analysisResult.service,
          image_count: analysisResult.imageCount,
          tmp_paths: payload.tmpPaths
        },
        processing_completed_at: new Date().toISOString()
      })
      .eq('id', actualDocumentId);
    
    // 🎯 NOVA FUNCIONALIDADE: Gerar automaticamente o relatório didático
    console.log('🎓 Gerando relatório didático automaticamente...');
    let didacticReportGenerated = false;
    
    try {
      // Chamar a função smart-medical-exam internamente
      const didacticResponse = await fetch(`${supabaseUrl}/functions/v1/smart-medical-exam`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          documentId: actualDocumentId
        })
      });
      
      if (didacticResponse.ok) {
        const didacticData = await didacticResponse.json();
        console.log('✅ Relatório didático gerado automaticamente!');
        didacticReportGenerated = true;
      } else {
        console.warn('⚠️ Falha ao gerar relatório didático, continuando...');
      }
    } catch (didacticError) {
      console.warn('⚠️ Erro ao gerar relatório didático:', didacticError);
    }

    // Resposta final de sucesso
    const response = {
      success: true,
      message: didacticReportGenerated 
        ? 'Documento finalizado com relatório didático gerado automaticamente'
        : 'Documento finalizado e análise iniciada com sucesso',
      data: {
        documentId: actualDocumentId,
        requestId,
        analysisResult,
        didacticReportGenerated,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('🎉 === FINALIZE-MEDICAL-DOCUMENT CONCLUÍDO ===');
    console.log('✅ Sucesso para documento:', actualDocumentId);
    console.log('🆔 Request ID:', requestId);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('💥 === ERRO EM FINALIZE-MEDICAL-DOCUMENT ===');
    console.error('🆔 Request ID:', requestId || 'N/A');
    console.error('👤 User ID:', userId || 'N/A');
    console.error('📄 Document ID:', documentId || 'N/A');
    console.error('❌ Erro:', error);
    console.error('📝 Stack trace:', error.stack);
    
    // Tentar marcar documento como erro se possível
    if (documentId && userId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabase
          .from('medical_documents')
          .update({
            status: 'normal',
            analysis_status: 'error',
            processing_stage: 'erro_na_finalizacao',
            progress_pct: 0,
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId);
          
        console.log('🔄 Documento marcado como erro para reprocessamento');
      } catch (markError) {
        console.error('❌ Erro ao marcar documento como erro:', markError);
      }
    }
    
    // Resposta de erro estruturada
    const errorResponse = {
      success: false,
      error: 'Falha ao finalizar documento médico',
      details: error.message || 'Erro desconhecido',
      requestId: requestId || null,
      documentId: documentId || null,
      userId: userId || null,
      timestamp: new Date().toISOString(),
      retryable: true
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});