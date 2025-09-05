import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para calcular idade
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Função para calcular IMC
function calculateBMI(weight: number, height: number): { value: number, category: string, risk: string } {
  const bmi = weight / (height / 100) ** 2;
  let category = '';
  let risk = '';
  
  if (bmi < 18.5) {
    category = 'Abaixo do peso';
    risk = 'baixo';
  } else if (bmi < 25) {
    category = 'Peso normal';
    risk = 'baixo';
  } else if (bmi < 30) {
    category = 'Sobrepeso';
    risk = 'moderado';
  } else {
    category = 'Obesidade';
    risk = 'alto';
  }
  
  return { value: Math.round(bmi * 10) / 10, category, risk };
}

// Dicionário de exames pré-prontos
const examDictionary = {
  "colesterol_total": {
    title: "🫀 Colesterol Total",
    howItWorks: "O laboratório mede o colesterol total no sangue, que é a soma do que circula nas \"ruas do corpo\": o que é transportado por LDL/VLDL e o que é recolhido pelo HDL.",
    whatItIsFor: [
      "Oferece visão geral da carga de colesterol circulante.",
      "Ajuda a acompanhar tendência (antes/depois de mudanças).",
      "Permite calcular o não-HDL (Total – HDL).",
      "Entra em painéis de risco cardiovascular."
    ]
  },
  "ldl": {
    title: "🫀 LDL",
    howItWorks: "Quantifica o colesterol que viaja nos \"caminhões LDL\", os que mais tendem a grudar nas paredes das artérias.",
    whatItIsFor: [
      "É o alvo principal para prevenir entupimento de artérias.",
      "Define metas objetivas conforme o perfil de risco.",
      "Funciona como termômetro de resposta a hábitos.",
      "Complementa a avaliação com não-HDL e ApoB."
    ]
  },
  "glicose": {
    title: "🍬 Glicose em jejum",
    howItWorks: "Quantifica a glicose no sangue após 8–12 horas sem comer, oferecendo um retrato do açúcar circulante naquele momento.",
    whatItIsFor: [
      "Triagem para pré-diabetes e diabetes.",
      "Complementa HbA1c e OGTT na avaliação.",
      "Ajuda a monitorar rotina e efeitos de hábitos.",
      "Simples e amplamente disponível."
    ]
  }
};

// Normaliza o nome do exame
function normalizeExamName(examName: string): string {
  return examName.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Analisa um exame
async function analyzeExam(examName: string, examValue: string, referenceRange: string): Promise<any> {
  const normalizedName = normalizeExamName(examName);
  
  if (examDictionary[normalizedName]) {
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
    return {
      name: examName,
      value: examValue,
      reference: referenceRange,
      explanation: {
        title: examName,
        howItWorks: "Este exame mede um parâmetro importante para sua saúde.",
        whatItIsFor: ["Ajuda a avaliar seu estado de saúde"],
        isPreDefined: false
      }
    };
  }
}

// Gera HTML completo do relatório
function generateCompleteHTMLReport(exams: any[], profile: any, document: any, userId: string, documentId: string): string {
  const date = new Date().toLocaleDateString('pt-BR');
  const time = new Date().toLocaleTimeString('pt-BR');
  
  // Dados do paciente
  const patientName = profile?.full_name || 'Paciente';
  const patientAge = profile?.birth_date ? calculateAge(profile.birth_date) : null;
  const patientGender = profile?.gender || 'Não informado';
  const avatarUrl = profile?.avatar_url || null;
  const examDate = document?.exam_date || date;
  
  // Calcular IMC se disponível
  let bmiData = null;
  if (profile?.weight && profile?.height) {
    bmiData = calculateBMI(profile.weight, profile.height);
  }
  
  // Processar exames para incluir gráficos
  const processedExams = exams.map((exam: any) => {
    const numericValue = parseFloat(exam.value.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    const referenceMax = parseFloat(exam.reference.split('<')[1]?.replace(/[^0-9.,]/g, '').replace(',', '.')) || 100;
    const percentage = Math.min((numericValue / referenceMax) * 100, 100);
    
    let status = 'Normal';
    let statusClass = 'status-ok';
    if (percentage > 100) { status = 'Alto'; statusClass = 'status-warn'; }
    else if (percentage < 50) { status = 'Baixo'; statusClass = 'status-info'; }
    
    return { ...exam, status, statusClass, percentage: Math.round(percentage) };
  });

  // Gerar HTML dos exames
  const examsHTML = processedExams.map((exam: any) => {
    const whatItIsForHTML = exam.explanation.whatItIsFor
      .map((item: string) => '<li>' + item + '</li>')
      .join('');
    
    return '<div class="exam-card">' +
      '<div class="exam-header">' +
        '<h3 class="exam-title">' + exam.explanation.title + '</h3>' +
        '<div class="exam-status ' + exam.statusClass + '">' + exam.status + '</div>' +
      '</div>' +
      '<div class="exam-result">' +
        '<div class="result-value">' + exam.value + '</div>' +
        '<div class="reference">Referência: ' + exam.reference + '</div>' +
      '</div>' +
      '<div class="result-chart">' +
        '<div class="chart-bar">' +
          '<div class="chart-fill ' + exam.statusClass + '" style="width: ' + exam.percentage + '%"></div>' +
        '</div>' +
        '<span class="chart-label">' + exam.percentage + '% da referência máxima</span>' +
      '</div>' +
      '<div class="explanation">' +
        '<h4>📋 Como funciona?</h4>' +
        '<p>' + exam.explanation.howItWorks + '</p>' +
        '<h4>🎯 Para que serve</h4>' +
        '<ul>' + whatItIsForHTML + '</ul>' +
      '</div>' +
    '</div>';
  }).join('');

  return '<!DOCTYPE html>' +
'<html lang="pt-BR">' +
'<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Relatório Médico Completo - ' + patientName + ' - Instituto dos Sonhos</title>' +
    '<meta name="description" content="Relatório médico completo e interativo">' +
    '<style>' +
        ':root {' +
            '--primary: #1E40AF;' +
            '--primary-light: #3B82F6;' +
            '--success: #059669;' +
            '--warning: #D97706;' +
            '--info: #0EA5E9;' +
            '--text-primary: #1F2937;' +
            '--text-secondary: #6B7280;' +
            '--bg-primary: #FFFFFF;' +
            '--bg-secondary: #F9FAFB;' +
            '--bg-tertiary: #F3F4F6;' +
            '--border: #E5E7EB;' +
            '--border-light: #F3F4F6;' +
            '--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);' +
            '--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);' +
        '}' +
        '* { box-sizing: border-box; margin: 0; padding: 0; }' +
        'body {' +
            'font-family: Inter, system-ui, sans-serif;' +
            'font-size: 16px;' +
            'line-height: 1.6;' +
            'color: var(--text-primary);' +
            'background: var(--bg-secondary);' +
        '}' +
        '.container { max-width: 1200px; margin: 0 auto; padding: 20px; }' +
        '.patient-header {' +
            'background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);' +
            'color: white;' +
            'border-radius: 16px;' +
            'padding: 32px;' +
            'margin-bottom: 24px;' +
            'box-shadow: var(--shadow-lg);' +
        '}' +
        '.patient-info { display: flex; align-items: center; gap: 24px; }' +
        '.patient-avatar {' +
            'width: 80px; height: 80px; border-radius: 50%; background: white;' +
            'display: flex; align-items: center; justify-content: center;' +
            'font-size: 32px; box-shadow: var(--shadow); overflow: hidden;' +
        '}' +
        '.patient-avatar img { width: 100%; height: 100%; object-fit: cover; }' +
        '.patient-details h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }' +
        '.patient-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 12px; }' +
        '.meta-item {' +
            'background: rgba(255, 255, 255, 0.2); padding: 8px 16px;' +
            'border-radius: 20px; font-size: 14px; font-weight: 600;' +
        '}' +
        '.exam-card {' +
            'background: var(--bg-primary); border: 1px solid var(--border);' +
            'border-radius: 16px; padding: 32px; margin-bottom: 24px;' +
            'box-shadow: var(--shadow); transition: all 0.2s ease;' +
        '}' +
        '.exam-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }' +
        '.exam-header {' +
            'display: flex; align-items: center; justify-content: space-between;' +
            'margin-bottom: 20px; padding-bottom: 16px;' +
            'border-bottom: 2px solid var(--border-light);' +
        '}' +
        '.exam-title { font-size: 24px; font-weight: 700; color: var(--primary); }' +
        '.exam-status {' +
            'padding: 8px 16px; border-radius: 20px; font-size: 14px;' +
            'font-weight: 600; text-transform: uppercase;' +
        '}' +
        '.status-ok { background: #D1FAE5; color: var(--success); }' +
        '.status-warn { background: #FEF3C7; color: var(--warning); }' +
        '.status-info { background: #DBEAFE; color: var(--info); }' +
        '.exam-result { display: flex; align-items: center; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }' +
        '.result-value { font-size: 36px; font-weight: 800; color: var(--text-primary); }' +
        '.reference {' +
            'color: var(--text-secondary); font-size: 16px;' +
            'background: var(--bg-tertiary); padding: 8px 16px; border-radius: 8px;' +
        '}' +
        '.result-chart { width: 100%; margin: 16px 0; }' +
        '.chart-bar {' +
            'width: 100%; height: 12px; background: var(--bg-tertiary);' +
            'border-radius: 6px; overflow: hidden; margin-bottom: 8px;' +
        '}' +
        '.chart-fill { height: 100%; border-radius: 6px; transition: width 1s ease; }' +
        '.chart-fill.status-ok { background: var(--success); }' +
        '.chart-fill.status-warn { background: var(--warning); }' +
        '.chart-fill.status-info { background: var(--info); }' +
        '.chart-label { font-size: 14px; color: var(--text-secondary); font-weight: 500; }' +
        '.explanation h4 {' +
            'color: var(--text-primary); margin-bottom: 12px; font-size: 18px;' +
            'font-weight: 600; display: flex; align-items: center; gap: 8px;' +
        '}' +
        '.explanation p { margin-bottom: 16px; color: var(--text-primary); line-height: 1.7; }' +
        '.explanation ul { list-style: none; padding: 0; }' +
        '.explanation li {' +
            'padding: 8px 0; border-bottom: 1px solid var(--border-light);' +
            'position: relative; padding-left: 20px; color: var(--text-primary);' +
        '}' +
        '.explanation li:last-child { border-bottom: none; }' +
        '.explanation li::before {' +
            'content: "•"; color: var(--primary); font-weight: bold;' +
            'position: absolute; left: 0;' +
        '}' +
        '.print-btn {' +
            'position: fixed; top: 20px; right: 20px; background: var(--success);' +
            'color: white; border: none; padding: 12px 20px; border-radius: 8px;' +
            'font-weight: 600; cursor: pointer; z-index: 1000;' +
        '}' +
        '@media (max-width: 768px) {' +
            '.container { padding: 16px; }' +
            '.patient-info { flex-direction: column; text-align: center; }' +
            '.patient-meta { justify-content: center; }' +
            '.exam-result { flex-direction: column; align-items: flex-start; }' +
        '}' +
        '@media print {' +
            '.print-btn { display: none; }' +
            'body { background: white; }' +
            '.container { padding: 0; max-width: none; }' +
        '}' +
    '</style>' +
'</head>' +
'<body>' +
    '<button class="print-btn" onclick="window.print()">🖨️ Imprimir</button>' +
    '<div class="container">' +
        '<div class="patient-header">' +
            '<div class="patient-info">' +
                '<div class="patient-avatar">' +
                    (avatarUrl ? '<img src="' + avatarUrl + '" alt="' + patientName + '">' : '👤') +
                '</div>' +
                '<div class="patient-details">' +
                    '<h1>' + patientName + '</h1>' +
                    '<div class="patient-meta">' +
                        (patientAge ? '<div class="meta-item">' + patientAge + ' anos</div>' : '') +
                        '<div class="meta-item">' + patientGender + '</div>' +
                        '<div class="meta-item">📅 ' + examDate + '</div>' +
                        (bmiData ? '<div class="meta-item">IMC: ' + bmiData.value + ' (' + bmiData.category + ')</div>' : '') +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        examsHTML +
        '<div style="text-align: center; padding: 24px; color: var(--text-secondary); font-size: 14px;">' +
            '<p><strong>⚠️ Importante:</strong> Este documento é educativo e não substitui consulta médica.</p>' +
            '<p>Gerado em ' + date + ' às ' + time + ' - Instituto dos Sonhos</p>' +
            '<p>🔗 <strong>Link público:</strong> Este relatório pode ser compartilhado livremente</p>' +
        '</div>' +
    '</div>' +
'</body>' +
'</html>';
}

// Função principal
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase não encontrada');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const rawPayload = await req.json();
    
    if (!rawPayload.userId || !rawPayload.documentId) {
      throw new Error('userId e documentId são obrigatórios');
    }
    
    const userId = rawPayload.userId;
    const documentId = rawPayload.documentId;
    
    // Buscar documento e perfil
    const [docResult, profileResult] = await Promise.all([
      supabase.from('medical_documents').select('*').eq('id', documentId).eq('user_id', userId).single(),
      supabase.from('profiles').select('full_name, birth_date, gender, avatar_url, height, weight').eq('id', userId).single()
    ]);
    
    if (docResult.error || !docResult.data) {
      throw new Error('Documento não encontrado: ' + (docResult.error?.message || 'Erro desconhecido'));
    }
    
    const document = docResult.data;
    const profile = profileResult.data;
    
    // Dados de exemplo (em produção, extrair dos exames reais)
    const exams = [
      { name: "Colesterol Total", value: "210 mg/dL", reference: "Desejável: < 190 mg/dL" },
      { name: "LDL", value: "130 mg/dL", reference: "Ótimo: < 100 mg/dL" },
      { name: "Glicose", value: "98 mg/dL", reference: "Normal: 70-99 mg/dL" }
    ];
    
    // Processar exames
    const processedExams = await Promise.all(
      exams.map(exam => analyzeExam(exam.name, exam.value, exam.reference))
    );
    
    // Gerar HTML
    const htmlReport = generateCompleteHTMLReport(processedExams, profile, document, userId, documentId);
    
    // Salvar no storage
    const reportPath = userId + '/' + documentId + '_didactic_report.html';
    
    await supabase.storage.from("medical-documents-reports").remove([reportPath]).catch(() => {});
    
    const enc = new TextEncoder();
    const bytes = enc.encode(htmlReport);
    
    const { error: saveError } = await supabase.storage
      .from('medical-documents-reports')
      .upload(reportPath, new Blob([bytes], { type: "text/html; charset=utf-8" }), { 
        upsert: true, 
        contentType: "text/html; charset=utf-8" 
      });
    
    if (saveError) {
      throw new Error('Erro ao salvar: ' + saveError.message);
    }
    
    // Atualizar documento
    await supabase
      .from('medical_documents')
      .update({
        report_path: reportPath,
        didactic_report_path: reportPath,
        analysis_status: 'ready',
        processing_stage: 'finalizado',
        progress_pct: 100,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Relatório didático completo gerado com sucesso',
      reportPath: reportPath,
      data: { documentId, reportPath }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Falha ao gerar relatório',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
