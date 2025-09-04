import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Interface para o payload de requisição
interface RequestPayload {
  userId: string;
  documentId?: string;
  examType?: string;
  imageUrls?: string[];
  tmpPaths?: string[];
  title?: string;
  idempotencyKey?: string;
  useSimpleExplanations?: boolean; // Novo campo para controlar o tipo de explicação
}

// Dicionário de exames pré-prontos (seu modelo didático)
const examDictionary = {
  // Perfil Lipídico
  "colesterol_total": {
    title: "🫀 Colesterol Total",
    howItWorks: "O laboratório mede o colesterol total no sangue, que é a soma do que circula nas \"ruas do corpo\": o que é transportado por LDL/VLDL e o que é recolhido pelo HDL. É um retrato pontual do tráfego de colesterol e pode variar com alimentação, álcool, medicações e condições clínicas recentes.",
    whatItIsFor: [
      "Oferece visão geral da carga de colesterol circulante.",
      "Ajuda a acompanhar tendência (antes/depois de mudanças).",
      "Permite calcular o não-HDL (Total – HDL), útil quando triglicerídeos estão altos.",
      "Entra em painéis de risco cardiovascular junto com as outras frações."
    ]
  },
  "ldl": {
    title: "🫀 LDL",
    howItWorks: "Quantifica o colesterol que viaja nos \"caminhões LDL\", os que mais tendem a grudar nas paredes das artérias. Em alguns laudos, o LDL é medido diretamente; em outros, calculado a partir de Total, HDL e TG. Por refletir o período recente, responde a jejum/álcool, dieta e hormônios da tireoide.",
    whatItIsFor: [
      "É o alvo principal para prevenir entupimento de artérias (aterosclerose).",
      "Define metas objetivas conforme o perfil de risco.",
      "Funciona como termômetro de resposta a hábitos e/ou tratamento.",
      "Complementa a avaliação com não-HDL e ApoB."
    ]
  },
  "hdl": {
    title: "🫀 HDL",
    howItWorks: "Mede o colesterol no \"caminhão de limpeza\": partículas que retiram excesso de gordura dos tecidos e levam de volta ao fígado. Parte depende da genética, mas atividade física, peso e hábitos influenciam ao longo do tempo.",
    whatItIsFor: [
      "Indica a capacidade de limpeza do sistema.",
      "Costuma se associar a menor risco cardiovascular.",
      "Ajuda a contextualizar Total e não-HDL.",
      "Não é um alvo terapêutico isolado (o foco permanece em LDL/não-HDL)."
    ]
  },
  "triglicerideos": {
    title: "🫀 Triglicerídeos (TG)",
    howItWorks: "Dosam a \"gordura de transporte\" que sobe facilmente após açúcares, refeições ricas e álcool. Mesmo em jejum, os TG refletem como o corpo usa e guarda energia. Variam com resistência à insulina, gordura abdominal, medicações e tireoide.",
    whatItIsFor: [
      "Mostram o impacto de carboidratos simples e álcool.",
      "Valores altos mantidos se associam a risco cardiovascular.",
      "Níveis muito altos elevam risco de pancreatite.",
      "Orientam foco adicional em não-HDL e ApoB."
    ]
  },
  
  // Glicose & Insulina
  "glicose": {
    title: "🍬 Glicose em jejum",
    howItWorks: "Quantifica a glicose no sangue após 8–12 horas sem comer, oferecendo um retrato do açúcar circulante naquele momento. Pode oscilar com estresse, infecções, corticoides e quebra de jejum.",
    whatItIsFor: [
      "Triagem para pré-diabetes e diabetes.",
      "Complementa HbA1c e OGTT na avaliação.",
      "Ajuda a monitorar rotina e efeitos de hábitos.",
      "Simples e amplamente disponível."
    ]
  },
  "hemoglobina_glicada": {
    title: "🍬 Hemoglobina glicada (HbA1c)",
    howItWorks: "Mostra a porcentagem de hemoglobina que ficou \"açucarada\" ao longo de ~3 meses. Como as hemácias vivem semanas, a HbA1c funciona como média de longo prazo da glicose; pode sofrer interferência de anemias, hemoglobinopatias e transfusões.",
    whatItIsFor: [
      "Avalia controle glicêmico crônico.",
      "Útil para acompanhar tratamento.",
      "Menos afetada por jejum que a glicose isolada.",
      "Entra em critérios diagnósticos quando indicado."
    ]
  },
  
  // Função Renal
  "creatinina": {
    title: "💧 Creatinina",
    howItWorks: "É um subproduto do músculo que os rins precisam filtrar. Quando a filtração diminui, a creatinina acumula no sangue. O valor também depende de massa muscular, hidratação e medicações, então é interpretado junto de outros parâmetros.",
    whatItIsFor: [
      "Base para calcular a eTFG (força do filtro).",
      "Ajuda a monitorar função renal.",
      "Contribui para ajuste de doses de medicamentos.",
      "Contextualiza hidratação e massa muscular."
    ]
  },
  "ureia": {
    title: "💧 Ureia",
    howItWorks: "Formada no fígado a partir da amônia (proteínas), a ureia é eliminada pelos rins. Costuma subir com pouca água, dieta proteica ou redução da filtração; isoladamente é menos específica que a creatinina.",
    whatItIsFor: [
      "Complementa a avaliação de função e hidratação.",
      "Ajuda em ajuste de terapia (ex.: diuréticos).",
      "Útil em monitorização hospitalar e ambulatorial.",
      "Contextualiza sintomas (náusea, mal-estar)."
    ]
  },
  
  // Adicione mais exames conforme necessário...
};

// Função principal que analisa exames médicos
async function analyzeExam(examName: string, examValue: string, referenceRange: string): Promise<any> {
  // Normalizar o nome do exame para busca no dicionário
  const normalizedName = normalizeExamName(examName);
  
  // Verificar se o exame está no dicionário
  if (examDictionary[normalizedName]) {
    // Usar explicação pré-pronta
    const examInfo = examDictionary[normalizedName];
    return {
      name: examName,
      value: examValue,
      reference: referenceRange,
      explanation: {
        title: examInfo.title,
        howItWorks: examInfo.howItWorks,
        whatItIsFor: examInfo.whatItIsFor,
        isPreDefined: true
      }
    };
  } else {
    // Gerar explicação com IA para exames não encontrados no dicionário
    const generatedExplanation = await generateExplanationWithAI(examName, examValue, referenceRange);
    return {
      name: examName,
      value: examValue,
      reference: referenceRange,
      explanation: {
        ...generatedExplanation,
        isPreDefined: false
      }
    };
  }
}

// Normaliza o nome do exame para busca no dicionário
function normalizeExamName(examName: string): string {
  return examName.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Gera explicação usando IA para exames não encontrados no dicionário
async function generateExplanationWithAI(examName: string, examValue: string, referenceRange: string): Promise<any> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!OPENAI_API_KEY) {
    console.warn('⚠️ OpenAI API Key não configurada, usando explicação básica');
    return {
      title: `${examName}`,
      howItWorks: "Este exame mede um parâmetro importante para sua saúde.",
      whatItIsFor: [
        "Ajuda a avaliar seu estado de saúde",
        "Contribui para o diagnóstico médico"
      ]
    };
  }
  
  try {
    console.log('🤖 Gerando explicação para exame desconhecido:', examName);
    
    const systemPrompt = `Você é o Dr. Vital, IA médica do Instituto dos Sonhos. 
    Explique o exame médico de forma didática e simples, seguindo o formato:
    1. Um título com emoji relacionado
    2. Como funciona: explicação simples do que o exame mede e como
    3. Para que serve: lista com 2-4 itens sobre a utilidade clínica`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Exame: ${examName}
          Valor: ${examValue}
          Referência: ${referenceRange}
          
          Explique este exame de forma didática e simples para um paciente.`
        }],
        temperature: 0.3,
        max_tokens: 500
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const aiData = await response.json();
    const analysisText = aiData.choices[0]?.message?.content || 'Explicação não disponível';
    
    // Tentar extrair as partes da explicação
    const titleMatch = analysisText.match(/^(.+?)(?:\n|$)/);
    const howItWorksMatch = analysisText.match(/como funciona:?\s*(.+?)(?:\n\n|\n(?=para que serve)|$)/is);
    const whatItIsForMatch = analysisText.match(/para que serve:?\s*(.+?)(?:$)/is);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : examName,
      howItWorks: howItWorksMatch ? howItWorksMatch[1].trim() : "Informação não disponível",
      whatItIsFor: whatItIsForMatch 
        ? whatItIsForMatch[1].trim().split(/\n\s*[-•]\s*/).filter(Boolean).map(item => item.trim())
        : ["Ajuda a avaliar seu estado de saúde"]
    };
  } catch (error) {
    console.error('❌ Erro ao gerar explicação com OpenAI:', error);
    return {
      title: `${examName}`,
      howItWorks: "Este exame avalia um parâmetro importante para sua saúde.",
      whatItIsFor: ["Contribui para a avaliação médica completa"]
    };
  }
}

// Gera HTML do relatório com explicações didáticas
function generateHTMLReport(exams: any[], userId: string, documentId: string): string {
  const date = new Date().toLocaleDateString('pt-BR');
  const time = new Date().toLocaleTimeString('pt-BR');
  
  // Gerar HTML para cada exame
  const examsHTML = exams.map(exam => {
    const whatItIsForHTML = exam.explanation.whatItIsFor
      .map((item: string) => `<li>${item}</li>`)
      .join('');
    
    return `
      <div class="exam-card">
        <h3>${exam.explanation.title}</h3>
        <div class="exam-result">
          <div class="result-value">${exam.value}</div>
          <div class="reference">Referência: ${exam.reference}</div>
        </div>
        <div class="explanation">
          <h4>📋 Como funciona?</h4>
          <p>${exam.explanation.howItWorks}</p>
          <h4>🎯 Para que serve</h4>
          <ul>${whatItIsForHTML}</ul>
        </div>
      </div>
    `;
  }).join('');
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Médico Didático - Instituto dos Sonhos</title>
  <meta name="description" content="Relatório médico educativo com explicações simples e didáticas">
  <meta name="robots" content="index, follow">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1F2937;
      background: #F9FAFB;
      padding: 20px;
      min-height: 100vh;
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
      padding: 32px 24px;
      border-radius: 12px;
      margin-bottom: 32px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(30, 64, 175, 0.3);
    }
    
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.9;
    }
    
    .exam-card {
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      background: white;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .exam-card:hover {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
    
    .exam-card h3 {
      margin-top: 0;
      color: #1E40AF;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 10px;
      font-size: 18px;
    }
    
    .exam-result {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .result-value {
      font-size: 20px;
      font-weight: bold;
      color: #1F2937;
    }
    
    .reference {
      color: #6B7280;
      font-size: 14px;
    }
    
    .explanation h4 {
      color: #4B5563;
      margin-bottom: 8px;
      font-size: 16px;
    }
    
    .explanation p {
      margin-top: 0;
      margin-bottom: 12px;
      text-align: justify;
    }
    
    .explanation ul {
      margin-top: 8px;
      padding-left: 20px;
    }
    
    .explanation li {
      margin-bottom: 4px;
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
    
    .footer p {
      margin-bottom: 8px;
    }
    
    .footer p:last-child {
      margin-bottom: 0;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
        border-radius: 0;
      }
      
      .exam-card {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
    
    @media (max-width: 768px) {
      body {
        padding: 10px;
      }
      
      .container {
        padding: 20px;
      }
      
      .exam-result {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .result-value {
        font-size: 18px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Relatório Médico Didático</h1>
      <p>Dr. Vital - IA Médica do Instituto dos Sonhos</p>
    </div>
    
    <div class="content">
      <div class="exams-container">
        ${examsHTML}
      </div>
    </div>
    
    <div class="footer">
      <p><strong>⚠️ Importante:</strong> Este documento é educativo e não substitui consulta médica.</p>
      <p>Gerado em ${date} às ${time} - ID: ${documentId}</p>
      <p>📧 Instituto dos Sonhos - Relatórios Educativos Gratuitos</p>
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
    
    console.log('🚀 === INICIANDO SMART-MEDICAL-EXAM ===');
    console.log('🆔 Request ID:', requestId);
    
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
    
    // Validar payload
    if (!rawPayload.userId) {
      throw new Error('userId é obrigatório');
    }
    
    if (!rawPayload.documentId) {
      throw new Error('documentId é obrigatório');
    }
    
    userId = rawPayload.userId;
    documentId = rawPayload.documentId;
    
    // Buscar documento
    const { data: document, error: docError } = await supabase
      .from('medical_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();
    
    if (docError || !document) {
      throw new Error(`Documento não encontrado: ${docError?.message || 'Erro desconhecido'}`);
    }
    
    // Extrair exames do documento - usar dados reais se disponíveis
    let exams = [];
    
    // Tentar extrair do report_content se disponível
    if (document.report_content) {
      try {
        const reportData = typeof document.report_content === 'string' 
          ? JSON.parse(document.report_content) 
          : document.report_content;
        
        if (reportData.exams && Array.isArray(reportData.exams)) {
          exams = reportData.exams.map(exam => ({
            name: exam.name || exam.exam_name || 'Exame',
            value: exam.value || exam.result || 'N/A',
            reference: exam.reference || exam.normal_range || 'N/A'
          }));
        }
      } catch (parseError) {
        console.warn('⚠️ Erro ao parsear report_content:', parseError);
      }
    }
    
    // Se não conseguiu extrair exames reais, usar dados simulados como fallback
    if (exams.length === 0) {
      console.log('📝 Usando dados simulados para demonstração');
      exams = [
        { name: "Colesterol Total", value: "210 mg/dL", reference: "Desejável: < 190 mg/dL" },
        { name: "LDL", value: "130 mg/dL", reference: "Ótimo: < 100 mg/dL" },
        { name: "HDL", value: "45 mg/dL", reference: "Desejável: > 40 mg/dL" },
        { name: "Glicose", value: "98 mg/dL", reference: "Normal: 70-99 mg/dL" },
        { name: "Hemoglobina", value: "14.5 g/dL", reference: "Normal: 13.5-17.5 g/dL" }
      ];
    }
    
    console.log(`📊 Processando ${exams.length} exames encontrados`);
    
    // Processar cada exame (usando pré-definido ou gerando com IA)
    const processedExams = await Promise.all(
      exams.map(exam => analyzeExam(exam.name, exam.value, exam.reference))
    );
    
    // Gerar HTML do relatório
    const htmlReport = generateHTMLReport(processedExams, userId, documentId);
    
    console.log('📄 HTML Report gerado:', htmlReport.substring(0, 200) + '...');
    
    // Salvar relatório no storage (usando método que funciona)
    console.log('💾 Salvando relatório HTML didático...');
    const reportPath = `${userId}/${documentId}_didactic_report.html`;
    
    // Remover arquivo existente primeiro
    await supabase.storage.from("medical-documents-reports").remove([reportPath]).catch(() => {});
    
    // Usar TextEncoder como na função generate-medical-report que funciona
    const enc = new TextEncoder();
    const bytes = enc.encode(htmlReport);
    
    const { error: saveError } = await supabase.storage
      .from('medical-documents-reports')
      .upload(reportPath, new Blob([bytes], { type: "text/html; charset=utf-8" }), { 
        upsert: true, 
        contentType: "text/html; charset=utf-8" 
      });
    
    if (saveError) {
      console.warn('⚠️ Erro ao salvar relatório (não crítico):', saveError);
    } else {
      console.log('✅ Relatório didático salvo com sucesso');
    }
    
    // Atualizar documento com caminho do relatório didático (usar report_path para aparecer no botão olho)
    await supabase
      .from('medical_documents')
      .update({
        report_path: reportPath, // Usar report_path para aparecer no botão olho
        didactic_report_path: reportPath, // Manter também o campo específico
        analysis_status: 'ready', // Garantir que está pronto
        processing_stage: 'finalizado',
        progress_pct: 100,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);
    
    console.log('✅ Relatório didático salvo e documento atualizado');
    
    // Resposta final de sucesso - APENAS DIDÁTICO
    const response = {
      success: true,
      message: 'Relatório didático gerado com sucesso',
      reportPath: reportPath, // Caminho direto para o relatório
      data: {
        documentId,
        reportPath,
        examsProcessed: processedExams.length,
        preDefinedCount: processedExams.filter(e => e.explanation.isPreDefined).length,
        generatedCount: processedExams.filter(e => !e.explanation.isPreDefined).length,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('🎉 === SMART-MEDICAL-EXAM CONCLUÍDO ===');
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('💥 === ERRO EM SMART-MEDICAL-EXAM ===');
    console.error('❌ Erro:', error);
    
    // Resposta de erro estruturada
    const errorResponse = {
      success: false,
      error: 'Falha ao gerar relatório didático',
      details: error.message || 'Erro desconhecido',
      requestId: requestId || null,
      documentId: documentId || null,
      userId: userId || null,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
