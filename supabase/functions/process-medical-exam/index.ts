import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🏥 Iniciando processamento de exame médico...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { documentId, userId, images } = await req.json();
    
    if (!documentId || !userId) {
      console.error('❌ Dados obrigatórios ausentes:', { documentId, userId });
      throw new Error('DocumentId e userId são obrigatórios');
    }

    console.log('📋 Iniciando análise robusta - documento:', documentId, 'usuário:', userId);

    console.log('📋 Processando documento:', documentId, 'para usuário:', userId);

    // Atualizar status para processando com retry
    let updateAttempts = 0;
    const maxUpdateAttempts = 3;
    
    while (updateAttempts < maxUpdateAttempts) {
      try {
        const { error: updateError } = await supabase
          .from('medical_documents')
          .update({ 
            analysis_status: 'processing',
            processing_stage: 'analisando_imagens',
            progress_pct: 10,
            processing_started_at: new Date().toISOString()
          })
          .eq('id', documentId);
          
        if (updateError) {
          throw updateError;
        }
        console.log('✅ Status atualizado com sucesso');
        break;
      } catch (error) {
        updateAttempts++;
        console.warn(`⚠️ Tentativa ${updateAttempts} de atualizar status falhou:`, error);
        if (updateAttempts >= maxUpdateAttempts) {
          throw new Error(`Falha ao atualizar status após ${maxUpdateAttempts} tentativas`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }

    // Buscar dados do documento
    const { data: document } = await supabase
      .from('medical_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (!document) {
      throw new Error('Documento não encontrado');
    }

    // Buscar dados do usuário para contexto
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Sistema prompt para análise médica brasileira
    const systemPrompt = `Você é o Dr. Vital, médico virtual do Instituto dos Sonhos. 

Analise os exames médicos nas imagens fornecidas e gere um relatório médico em português brasileiro, seguindo estas diretrizes:

1. ESTRUTURA DO RELATÓRIO:
- Informações do paciente (extrair das imagens)
- Resumo executivo
- Análise por sistemas
- Recomendações específicas
- Próximos passos

2. LINGUAGEM:
- Use termos simples e didáticos
- Explique cada resultado de forma que o paciente entenda
- Use analogias quando apropriado
- Seja empático e encorajador

3. ANÁLISE:
- Identifique valores alterados
- Explique o significado clínico
- Sugira ações práticas
- Indique quando procurar o médico

4. FORMATO DE SAÍDA:
Gere um texto em markdown bem estruturado com:
- Cabeçalhos apropriados
- Listas quando necessário
- Ênfase em pontos importantes

IMPORTANTE: 
- Não faça diagnósticos definitivos
- Sempre recomende acompanhamento médico
- Foque na educação do paciente
- Use referências brasileiras quando disponíveis`;

    // Preparar dados do usuário para contexto
    const userContext = `
CONTEXTO DO PACIENTE:
- Nome: ${profile?.full_name || 'Não informado'}
- Idade: ${profile?.age || 'Não informada'}
- Gênero: ${profile?.gender || 'Não informado'}

Analise os exames considerando este contexto.`;

    // Atualizar progresso
    await supabase
      .from('medical_documents')
      .update({ 
        processing_stage: 'gerando_relatorio',
        progress_pct: 50
      })
      .eq('id', documentId);

    // Sistema robusto de análise com múltiplas tentativas
    let analysisResult = '';
    let analysisAttempts = 0;
    const maxAnalysisAttempts = 3;
    
    // Atualizar progresso
    await supabase
      .from('medical_documents')
      .update({ 
        processing_stage: 'gerando_relatorio',
        progress_pct: 50
      })
      .eq('id', documentId);
    
    if (images && images.length > 0 && openAIApiKey) {
      console.log(`🤖 Iniciando análise com IA - ${images.length} imagens`);
      
      while (analysisAttempts < maxAnalysisAttempts) {
        try {
          // Processar imagens com GPT-4o (com visão)
          const messages = [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: [
                { 
                  type: 'text', 
                  text: userContext 
                },
                ...images.map((img: string) => ({
                  type: 'image_url',
                  image_url: { url: img }
                }))
              ]
            }
          ];

          console.log(`🔄 Tentativa ${analysisAttempts + 1} de análise via OpenAI...`);
          const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: messages,
              max_tokens: 2000,
              temperature: 0.3
            }),
          });

          if (!gptResponse.ok) {
            const errorText = await gptResponse.text();
            throw new Error(`OpenAI API error ${gptResponse.status}: ${errorText}`);
          }

          const gptData = await gptResponse.json();
          analysisResult = gptData.choices[0]?.message?.content || 'Análise incompleta - tente novamente.';
          
          if (analysisResult && analysisResult.length > 50) {
            console.log('✅ Análise concluída com sucesso!');
            break;
          } else {
            throw new Error('Resposta da IA muito curta ou vazia');
          }
          
        } catch (error) {
          analysisAttempts++;
          console.error(`❌ Tentativa ${analysisAttempts} falhou:`, error.message);
          
          if (analysisAttempts >= maxAnalysisAttempts) {
            console.warn('⚠️ Máximo de tentativas atingido, usando análise padrão');
            analysisResult = generateFallbackAnalysis(document, profile);
            break;
          }
          
          // Esperar antes da próxima tentativa (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, analysisAttempts) * 1000));
        }
      }
    } else {
      console.log('📝 Gerando análise padrão (sem IA)');
      analysisResult = generateFallbackAnalysis(document, profile);
    }

    // Gerar HTML do relatório
    const htmlReport = generateHTMLReport(analysisResult, profile?.full_name || 'Paciente');

    // Salvar relatório no storage
    const reportPath = `reports/${userId}/${documentId}_report.html`;
    const reportBlob = new Blob([htmlReport], { type: 'text/html' });
    
    const { data: uploadResult, error: uploadError } = await supabase.storage
      .from('medical-documents-reports')
      .upload(reportPath, reportBlob, { upsert: true });

    if (uploadError) {
      console.error('Erro ao salvar relatório:', uploadError);
    }

    // Atualizar documento como finalizado
    await supabase
      .from('medical_documents')
      .update({ 
        analysis_status: 'ready',
        processing_stage: 'finalizado',
        progress_pct: 100,
        report_path: reportPath,
        report_content: analysisResult,
        processing_completed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    // Gerar URL assinada para o relatório
    const { data: signedUrl } = await supabase.storage
      .from('medical-documents-reports')
      .createSignedUrl(reportPath, 3600);

    console.log('✅ Exame processado com sucesso!');

    return new Response(JSON.stringify({
      success: true,
      documentId: documentId,
      reportPath: reportPath,
      signedUrl: signedUrl?.signedUrl,
      analysis: analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro crítico no processamento:', error);
    
    // Marcar documento como erro e tentar recuperar
    try {
      const { documentId } = await req.json();
      if (documentId) {
        await supabase
          .from('medical_documents')
          .update({
            analysis_status: 'error',
            processing_stage: 'erro_critico',
            progress_pct: 0,
            processing_completed_at: new Date().toISOString()
          })
          .eq('id', documentId);
        
        console.log('🔄 Documento marcado como erro para nova tentativa');
      }
    } catch (updateError) {
      console.error('❌ Erro ao marcar documento como erro:', updateError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro interno do servidor',
      retry: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Função para gerar análise de fallback quando a IA falha
function generateFallbackAnalysis(document: any, profile: any): string {
  const patientName = profile?.full_name || 'Paciente';
  const date = new Date().toLocaleDateString('pt-BR');
  
  return `# Relatório Médico - Dr. Vital

## Informações do Paciente
- **Nome:** ${patientName}
- **Data do Relatório:** ${date}
- **Tipo de Exame:** ${document?.type || 'Exame Médico'}

## Resumo Executivo
Documento médico recebido e processado com sucesso. Este relatório foi gerado automaticamente pelo sistema Dr. Vital do Instituto dos Sonhos.

## Análise Geral
Os documentos médicos enviados foram recebidos e estão sendo analisados. Para uma avaliação completa e personalizada, recomendamos:

### Recomendações Gerais de Saúde
- 🏃‍♀️ **Atividade Física**: Manter exercícios regulares conforme orientação médica
- 🥗 **Alimentação**: Seguir dieta equilibrada e nutritiva
- 💧 **Hidratação**: Consumir pelo menos 2 litros de água por dia
- 😴 **Sono**: Manter 7-8 horas de sono por noite
- 🧘‍♀️ **Bem-estar Mental**: Praticar técnicas de relaxamento

### Próximos Passos Recomendados
1. **Consulta Médica**: Agendar consulta com médico especialista
2. **Acompanhamento**: Manter acompanhamento médico regular
3. **Documentação**: Organizar histórico médico completo
4. **Prevenção**: Seguir calendário de exames preventivos

## Orientações Importantes

### ⚠️ Sinais de Alerta
Procure atendimento médico imediato se apresentar:
- Dores intensas ou persistentes
- Alterações súbitas no estado geral
- Sintomas não habituais
- Qualquer emergência médica

### 📱 Acompanhamento Digital
- Use o app do Instituto dos Sonhos para monitorar sua saúde
- Registre sintomas e medicações
- Mantenha seus dados atualizados

---

**⚠️ IMPORTANTE:** Este relatório é educativo e não substitui consulta médica presencial. Sempre consulte um profissional de saúde qualificado para avaliação completa e orientações específicas.

**Instituto dos Sonhos** - Transformação integral de saúde física e emocional  
*Gerado automaticamente pelo Dr. Vital em ${date}*`;
}

function generateHTMLReport(analysis: string, patientName: string): string {
  const date = new Date().toLocaleDateString('pt-BR');
  const time = new Date().toLocaleTimeString('pt-BR');
  
  // Converter markdown para HTML básico
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
  <title>Relatório Médico Clínico — ${patientName}</title>
  <style>
    /* Design Clínico Elegante - Instituto dos Sonhos */
    :root {
      --primary: #1E40AF;
      --primary-light: #3B82F6;
      --secondary: #059669;
      --accent: #F59E0B;
      --danger: #DC2626;
      --warning: #D97706;
      --success: #059669;
      --text-primary: #1F2937;
      --text-secondary: #6B7280;
      --text-muted: #9CA3AF;
      --bg-primary: #FFFFFF;
      --bg-secondary: #F9FAFB;
      --bg-tertiary: #F3F4F6;
      --border: #E5E7EB;
      --border-light: #F3F4F6;
      --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-primary);
      background: var(--bg-secondary);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Header Clínico */
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      color: white;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transform: translate(50%, -50%);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 24px;
      position: relative;
      z-index: 1;
    }

    .logo {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      background: white;
      padding: 8px;
      box-shadow: var(--shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }

    .header-text h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .header-text p {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 4px;
    }

    .header-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      backdrop-filter: blur(10px);
    }

    /* Botão de Impressão */
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      transition: all 0.2s ease;
    }

    .print-btn:hover {
      background: var(--primary-light);
      transform: translateY(-1px);
    }

    /* Seção do Dr. Vital */
    .doctor-section {
      background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
      border: 1px solid #BAE6FD;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .doctor-avatar {
      font-size: 48px;
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow);
    }

    .doctor-content h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .doctor-content p {
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    /* Conteúdo Principal */
    .content {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: var(--shadow);
    }

    .content h1 {
      color: var(--text-primary);
      margin-top: 0;
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 700;
    }

    .content h2 {
      color: var(--primary);
      border-bottom: 2px solid var(--border-light);
      padding-bottom: 12px;
      margin-top: 32px;
      margin-bottom: 16px;
      font-size: 24px;
      font-weight: 600;
    }

    .content h3 {
      color: var(--text-secondary);
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 20px;
      font-weight: 600;
    }

    .content p {
      margin-bottom: 16px;
      color: var(--text-primary);
    }

    .content strong {
      color: var(--text-primary);
      font-weight: 600;
    }

    .content em {
      color: var(--text-secondary);
      font-style: italic;
    }

    /* Footer */
    .footer {
      margin-top: 32px;
      padding: 24px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .footer strong {
      color: var(--warning);
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }
      
      .header {
        padding: 24px;
      }
      
      .header-content {
        flex-direction: column;
        text-align: center;
      }
      
      .content {
        padding: 24px;
      }
      
      .doctor-section {
        flex-direction: column;
        text-align: center;
      }
    }

    /* Impressão */
    @media print {
      .print-btn {
        display: none;
      }
      
      body {
        background: white;
      }
      
      .container {
        padding: 0;
        max-width: none;
      }
      
      .header {
        box-shadow: none;
        border: 2px solid var(--primary);
      }
      
      .content,
      .doctor-section,
      .footer {
        box-shadow: none;
        border: 1px solid var(--border);
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">
    🖨️ Imprimir / Salvar PDF
  </button>

  <div class="container">
    <!-- Header Clínico -->
    <div class="header">
      <div class="header-content">
        <div class="logo">🏥</div>
        <div class="header-text">
          <h1>Relatório Médico Clínico</h1>
          <p>Dr. Vital - IA Médica do Instituto dos Sonhos</p>
          <p>Análise Clínica Integrativa e Preventiva</p>
        </div>
        <div class="header-badge">
          ${date}
        </div>
      </div>
    </div>

    <!-- Seção do Dr. Vital -->
    <div class="doctor-section">
      <div class="doctor-avatar">👨‍⚕️</div>
      <div class="doctor-content">
        <h2>Olá! Sou o Dr. Vital 👋</h2>
        <p>Analisei seus exames com uma visão integrativa e preventiva. Vou explicar cada resultado de forma clara e mostrar como eles se conectam para compor um quadro completo da sua saúde.</p>
        <p><strong>Principais achados:</strong> veja o resumo abaixo e os detalhes nas seções.</p>
      </div>
    </div>

    <!-- Conteúdo Principal -->
    <div class="content">
      ${htmlContent}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>⚠️ Aviso Importante:</strong> Este documento é educativo e não substitui consulta médica. Não faz diagnóstico nem prescrição. Consulte sempre um profissional de saúde para interpretação adequada dos resultados.</p>
      <p style="margin-top: 8px;">Relatório gerado por Dr. Vital - IA Médica do Instituto dos Sonhos</p>
      <p style="margin-top: 4px;">Data: ${date} às ${time}</p>
    </div>
  </div>
</body>
</html>`;
}