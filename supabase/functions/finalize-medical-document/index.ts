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
    
    // Limitar drasticamente para evitar CPU timeout (máximo 3 imagens)
    const limitedPaths = payload.tmpPaths.slice(0, 3);
    if (payload.tmpPaths.length > 3) {
      console.log(`⚠️ LIMITAÇÃO DRÁSTICA: Processando apenas 3 imagens de ${payload.tmpPaths.length} enviadas`);
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
          setTimeout(() => reject(new Error('Download timeout')), 5000) // 5s timeout
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
          setTimeout(() => reject(new Error('Conversion timeout')), 3000) // 3s timeout
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
    
    const openAIPromise = fetch('https://api.openai.com/v1/chat/completions', {
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
        temperature: 0.2,
        max_completion_tokens: 2500 // Reduzido para ser mais rápido
      }),
    });
    
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

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Relatório Médico - Instituto dos Sonhos</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1F2937;
      background: #F9FAFB;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
      color: white;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .content h1, .content h2, .content h3 {
      color: #1E40AF;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .content p {
      margin-bottom: 16px;
    }
    .footer {
      margin-top: 32px;
      padding: 16px;
      background: #F3F4F6;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Relatório Médico</h1>
      <p>Dr. Vital - IA Médica do Instituto dos Sonhos</p>
    </div>
    
    <div class="content">
      ${htmlContent}
    </div>
    
    <div class="footer">
      <p><strong>⚠️ Importante:</strong> Este documento é educativo e não substitui consulta médica.</p>
      <p>Gerado em ${date} às ${time} - ID: ${documentId}</p>
    </div>
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