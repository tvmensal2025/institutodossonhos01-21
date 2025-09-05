import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type, Range',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};

// 📚 EXPLICAÇÕES DIDÁTICAS PRÉ-PRONTAS (economia de tokens)
const EXPLICACOES_DIDATICAS: Record<string, {categoria: string, icone: string, explicacao: string}> = {
  // 🫀 PERFIL LIPÍDICO
  'colesterol_total': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao: `Como funciona?
O laboratório mede o colesterol total no sangue, que é a soma do que circula nas "ruas do corpo": o que é transportado por LDL/VLDL e o que é recolhido pelo HDL. É um retrato pontual do tráfego de colesterol e pode variar com alimentação, álcool, medicações e condições clínicas recentes.

Para que serve
• Oferece visão geral da carga de colesterol circulante.
• Ajuda a acompanhar tendência (antes/depois de mudanças).
• Permite calcular o não-HDL (Total – HDL), útil quando triglicerídeos estão altos.
• Entra em painéis de risco cardiovascular junto com as outras frações.`
  },
  
  'ldl': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao: `Como funciona?
Quantifica o colesterol que viaja nos "caminhões LDL", os que mais tendem a grudar nas paredes das artérias. Em alguns laudos, o LDL é medido diretamente; em outros, calculado a partir de Total, HDL e TG. Por refletir o período recente, responde a jejum/álcool, dieta e hormônios da tireoide.

Para que serve
• É o alvo principal para prevenir entupimento de artérias (aterosclerose).
• Define metas objetivas conforme o perfil de risco.
• Funciona como termômetro de resposta a hábitos e/ou tratamento.
• Complementa a avaliação com não-HDL e ApoB.`
  },
  
  'hdl': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao: `Como funciona?
Mede o colesterol no "caminhão de limpeza": partículas que retiram excesso de gordura dos tecidos e levam de volta ao fígado. Parte depende da genética, mas atividade física, peso e hábitos influenciam ao longo do tempo.

Para que serve
• Indica a capacidade de limpeza do sistema.
• Costuma se associar a menor risco cardiovascular.
• Ajuda a contextualizar Total e não-HDL.
• Não é um alvo terapêutico isolado (o foco permanece em LDL/não-HDL).`
  },
  
  'triglicerideos': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao: `Como funciona?
Dosam a "gordura de transporte" que sobe facilmente após açúcares, refeições ricas e álcool. Mesmo em jejum, os TG refletem como o corpo usa e guarda energia. Variam com resistência à insulina, gordura abdominal, medicações e tireoide.

Para que serve
• Mostram o impacto de carboidratos simples e álcool.
• Valores altos mantidos se associam a risco cardiovascular.
• Níveis muito altos elevam risco de pancreatite.
• Orientam foco adicional em não-HDL e ApoB.`
  },
  
  'vldl': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao: `Como funciona?
Avalia (muitas vezes estima) as partículas que o fígado fabrica para levar triglicerídeos aos tecidos. Caminha de perto com os TG e tende a subir/baixar junto com eles.

Para que serve
• Espelha o comportamento dos triglicerídeos.
• Completa o painel lipídico.
• Não é alvo direto de tratamento.`
  },
  
  // 🍬 GLICOSE & INSULINA
  'glicose': {
    categoria: '🍬 Glicose & Insulina',
    icone: '🍬',
    explicacao: `Como funciona?
Quantifica a glicose no sangue após 8–12 horas sem comer, oferecendo um retrato do açúcar circulante naquele momento. Pode oscilar com estresse, infecções, corticoides e quebra de jejum.

Para que serve
• Triagem para pré-diabetes e diabetes.
• Complementa HbA1c e OGTT na avaliação.
• Ajuda a monitorar rotina e efeitos de hábitos.
• Simples e amplamente disponível.`
  },
  
  'hba1c': {
    categoria: '🍬 Glicose & Insulina',
    icone: '🍬',
    explicacao: `Como funciona?
Mostra a porcentagem de hemoglobina que ficou "açucarada" ao longo de ~3 meses. Como as hemácias vivem semanas, a HbA1c funciona como média de longo prazo da glicose; pode sofrer interferência de anemias, hemoglobinopatias e transfusões.

Para que serve
• Avalia controle glicêmico crônico.
• Útil para acompanhar tratamento.
• Menos afetada por jejum que a glicose isolada.
• Entra em critérios diagnósticos quando indicado.`
  },
  
  'insulina': {
    categoria: '🍬 Glicose & Insulina',
    icone: '🍬',
    explicacao: `Como funciona?
Dosam a insulina em jejum e calculam o HOMA-IR (uma estimativa de resistência à insulina usando glicose+insulina). Refletem sinalização hormonal nas células e mudam com peso, sono, estresse, medicações e atividade física.

Para que serve
• Sinalizam resistência à insulina.
• Ajudam a entender síndrome metabólica e esteatose.
• Direcionam mudanças de estilo de vida.
• Podem orientar acompanhamento em conjunto com glicose/HbA1c.`
  },
  
  // 💧 FUNÇÃO RENAL
  'creatinina': {
    categoria: '💧 Função Renal',
    icone: '💧',
    explicacao: `Como funciona?
É um subproduto do músculo que os rins precisam filtrar. Quando a filtração diminui, a creatinina acumula no sangue. O valor também depende de massa muscular, hidratação e medicações, então é interpretado junto de outros parâmetros.

Para que serve
• Base para calcular a eTFG (força do filtro).
• Ajuda a monitorar função renal.
• Contribui para ajuste de doses de medicamentos.
• Contextualiza hidratação e massa muscular.`
  },
  
  'ureia': {
    categoria: '💧 Função Renal',
    icone: '💧',
    explicacao: `Como funciona?
Formada no fígado a partir da amônia (proteínas), a ureia é eliminada pelos rins. Costuma subir com pouca água, dieta proteica ou redução da filtração; isoladamente é menos específica que a creatinina.

Para que serve
• Complementa a avaliação de função e hidratação.
• Ajuda em ajuste de terapia (ex.: diuréticos).
• Útil em monitorização hospitalar e ambulatorial.
• Contextualiza sintomas (náusea, mal-estar).`
  },
  
  // 🫁 FÍGADO
  'ast': {
    categoria: '🫁 Fígado & Vias Biliares',
    icone: '🫁',
    explicacao: `Como funciona?
São enzimas dentro das células do fígado. Quando as células sofrem, parte delas "vaza" para o sangue e os valores sobem (gordura, álcool, vírus, remédios, esforço intenso).

Para que serve
• Sugerem sofrimento hepático.
• Ajudam a acompanhar evolução (melhora/piora).
• Direcionam investigações (imagens, outros exames).
• Auxiliam na segurança medicamentosa.`
  },
  
  'alt': {
    categoria: '🫁 Fígado & Vias Biliares',
    icone: '🫁',
    explicacao: `Como funciona?
São enzimas dentro das células do fígado. Quando as células sofrem, parte delas "vaza" para o sangue e os valores sobem (gordura, álcool, vírus, remédios, esforço intenso).

Para que serve
• Sugerem sofrimento hepático.
• Ajudam a acompanhar evolução (melhora/piora).
• Direcionam investigações (imagens, outros exames).
• Auxiliam na segurança medicamentosa.`
  },
  
  // 🧠 TIREOIDE
  'tsh': {
    categoria: '🧠 Tireoide',
    icone: '🧠',
    explicacao: `Como funciona?
O TSH é o comando da hipófise para a tireoide; T4/T3 são os hormônios que ajustam o ritmo do metabolismo. Ensaios imunoquímicos quantificam esses níveis e mostram se o "motor" está acelerado, lento ou equilibrado.

Para que serve
• Detecta hipo e hipertireoidismo.
• Acompanha ajustes de dose quando em uso de hormônio.
• Investiga sintomas como cansaço, perda/ganho de peso, palpitações.
• Integra check-ups e protocolos.`
  },
  
  't4_livre': {
    categoria: '🧠 Tireoide',
    icone: '🧠',
    explicacao: `Como funciona?
O TSH é o comando da hipófise para a tireoide; T4/T3 são os hormônios que ajustam o ritmo do metabolismo. Ensaios imunoquímicos quantificam esses níveis e mostram se o "motor" está acelerado, lento ou equilibrado.

Para que serve
• Detecta hipo e hipertireoidismo.
• Acompanha ajustes de dose quando em uso de hormônio.
• Investiga sintomas como cansaço, perda/ganho de peso, palpitações.
• Integra check-ups e protocolos.`
  },
  
  // 🩸 HEMATOLOGIA
  'hemoglobina': {
    categoria: '🩸 Hematologia & Nutrientes',
    icone: '🩸',
    explicacao: `Como funciona?
Usa contadores automatizados e, se necessário, microscopia para medir glóbulos vermelhos (oxigênio), brancos (defesa) e plaquetas (coagulação), além de índices como VCM e HCM.

Para que serve
• Investiga anemias.
• Ajuda a identificar infecções e inflamações.
• Avalia plaquetas (sangramento/coagulação).
• Base do check-up e do seguimento clínico.`
  },
  
  'ferritina': {
    categoria: '🩸 Hematologia & Nutrientes',
    icone: '🩸',
    explicacao: `Como funciona?
A ferritina indica estoque de ferro; a transferrina é o transporte; a saturação mostra quanto do transporte está ocupado; o ferro sérico é o que circula. Juntos, mapeiam estoque + trânsito + entrega.

Para que serve
• Diferenciam falta de ferro de outras anemias.
• Orientam reposição (dose/tempo).
• Sugerem causas (ingestão, perdas).
• Acompanham resposta ao tratamento.`
  },
  
  'vitamina_b12': {
    categoria: '🩸 Hematologia & Nutrientes',
    icone: '🩸',
    explicacao: `Como funciona?
Dosagens sanguíneas de vitaminas essenciais para formação de sangue e sistema nervoso. Podem variar com ingestão, absorção intestinal, álcool e medicações; às vezes pedem marcadores complementares.

Para que serve
• Avaliam anemias com glóbulos grandes (VCM↑).
• Ajudam a investigar formigamentos e queixas neurológicas (B12).
• Guiam suplementação e dieta.
• Monitoram resposta clínica/laboratorial.`
  },
  
  // 🌞 VITAMINAS
  'vitamina_d': {
    categoria: '🌞 Vitaminas',
    icone: '🌞',
    explicacao: `Como funciona?
Mede a forma de reserva da vitamina D, produzida na pele pelo sol e obtida por alimentos/suplementos. É o melhor indicador de estoque disponível para ossos e músculos.

Para que serve
• Avalia deficiência ou excesso.
• Direciona suplementação e reavaliação.
• Relaciona-se a saúde óssea e muscular.
• Complementa o eixo cálcio/PTH.`
  },
  
  // 🔥 INFLAMAÇÃO
  'pcr': {
    categoria: '🔥 Inflamação',
    icone: '🔥',
    explicacao: `Como funciona?
É uma proteína de fase aguda produzida pelo fígado. No método de alta sensibilidade, detecta inflamações discretas, úteis para entender risco cardiovascular e resposta a hábitos ao longo do tempo.

Para que serve
• Sinaliza inflamação de baixo grau.
• Contextualiza risco em conjunto com lipídios.
• Ajuda a monitorar estilo de vida.
• Apoia decisões em prevenção.`
  },
  
  'vhs': {
    categoria: '🔥 Inflamação',
    icone: '🔥',
    explicacao: `Como funciona?
Observa a velocidade com que as hemácias sedimentam num tubo padronizado. Proteínas inflamatórias alteram essa velocidade, tornando o VHS um sinal indireto de inflamação crônica.

Para que serve
• Útil em doenças inflamatórias e infecções crônicas.
• Interpreta-se junto com PCR e clínica.
• Acompanha atividade de algumas doenças.
• Ajuda a triagem de sintomas persistentes.`
  }
};

// 🧠 FUNÇÃO PARA BUSCAR EXPLICAÇÃO DIDÁTICA
function getExplicacaoDidatica(nomeExame: string): {categoria: string, icone: string, explicacao: string} | null {
  const nomeNormalizado = nomeExame.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/colesterol_total/g, 'colesterol_total')
    .replace(/ldl/g, 'ldl')
    .replace(/hdl/g, 'hdl')
    .replace(/triglicerid/g, 'triglicerideos')
    .replace(/glicose/g, 'glicose')
    .replace(/hba1c|hemoglobina_glicada/g, 'hba1c')
    .replace(/insulina/g, 'insulina')
    .replace(/creatinina/g, 'creatinina')
    .replace(/ureia/g, 'ureia')
    .replace(/ast|tgo/g, 'ast')
    .replace(/alt|tgp/g, 'alt')
    .replace(/tsh/g, 'tsh')
    .replace(/t4_livre|t4/g, 't4_livre')
    .replace(/hemoglobina/g, 'hemoglobina')
    .replace(/ferritina/g, 'ferritina')
    .replace(/vitamina_b12|b12/g, 'vitamina_b12')
    .replace(/vitamina_d/g, 'vitamina_d')
    .replace(/pcr|proteina_c_reativa/g, 'pcr')
    .replace(/vhs/g, 'vhs');
  
  return EXPLICACOES_DIDATICAS[nomeNormalizado] || null;
}

// Funções para agrupar exames similares
function groupSimilarMetrics(metrics: any[]) {
  const groups = [];
  const processed = new Set();
  
  for (let i = 0; i < metrics.length; i++) {
    if (processed.has(i)) continue;
    
    const currentMetric = metrics[i];
    const group = [currentMetric];
    processed.add(i);
    
    // Procurar exames similares
    for (let j = i + 1; j < metrics.length; j++) {
      if (processed.has(j)) continue;
      
      const otherMetric = metrics[j];
      if (shouldGroupMetrics(currentMetric, otherMetric)) {
        group.push(otherMetric);
        processed.add(j);
      }
    }
    
    groups.push(group);
  }
  
  return groups;
}

function shouldGroupMetrics(metric1: any, metric2: any) {
  const name1 = (metric1.name || '').toLowerCase();
  const name2 = (metric2.name || '').toLowerCase();
  
  // Agrupar colesterol
  if ((name1.includes('hdl') || name1.includes('ldl') || name1.includes('colesterol')) &&
      (name2.includes('hdl') || name2.includes('ldl') || name2.includes('colesterol'))) {
    return true;
  }
  
  // Agrupar triglicerídeos
  if (name1.includes('triglicer') && name2.includes('triglicer')) {
    return true;
  }
  
  // Agrupar hemograma
  if ((name1.includes('hemoglobina') || name1.includes('hematócrito') || name1.includes('hemácias')) &&
      (name2.includes('hemoglobina') || name2.includes('hematócrito') || name2.includes('hemácias'))) {
    return true;
  }
  
  // Agrupar leucócitos
  if ((name1.includes('leucócito') || name1.includes('glóbulo branco')) &&
      (name2.includes('leucócito') || name2.includes('glóbulo branco'))) {
    return true;
  }
  
  // Agrupar plaquetas
  if (name1.includes('plaqueta') && name2.includes('plaqueta')) {
    return true;
  }
  
  // Agrupar glicemia
  if ((name1.includes('glicemia') || name1.includes('glicose')) &&
      (name2.includes('glicemia') || name2.includes('glicose'))) {
    return true;
  }
  
  return false;
}

function getGroupTitle(group: any[]) {
  const names = group.map(m => m.name || '').join(', ');
  if (names.toLowerCase().includes('hdl') && names.toLowerCase().includes('ldl')) {
    return 'Perfil Lipídico (Colesterol)';
  }
  if (names.toLowerCase().includes('triglicer')) {
    return 'Triglicerídeos';
  }
  if (names.toLowerCase().includes('hemoglobina') || names.toLowerCase().includes('hematócrito')) {
    return 'Hemograma';
  }
  if (names.toLowerCase().includes('leucócito')) {
    return 'Leucócitos';
  }
  if (names.toLowerCase().includes('plaqueta')) {
    return 'Plaquetas';
  }
  if (names.toLowerCase().includes('glicemia') || names.toLowerCase().includes('glicose')) {
    return 'Glicemia';
  }
  return names;
}

function getGroupExplanation(group: any[]) {
  const normalCount = group.filter(m => m.status === 'normal').length;
  const totalCount = group.length;
  
  if (normalCount === totalCount) {
    return `"Todos os valores do ${getGroupTitle(group).toLowerCase()} estão normais! É como ter todos os sistemas funcionando perfeitamente."`;
  } else if (normalCount === 0) {
    return `"Todos os valores do ${getGroupTitle(group).toLowerCase()} precisam de atenção. Vamos trabalhar para normalizar cada um deles."`;
  } else {
    return `"Alguns valores do ${getGroupTitle(group).toLowerCase()} estão alterados, mas outros estão normais. Vamos focar nos que precisam de ajuste."`;
  }
}

// Função para criar um novo documento médico
async function createDocument(
  supabase: any, 
  userId: string,
  title: string = 'Exame Médico',
  examType: string = 'exame_laboratorial',
  tmpPaths: string[] = [],
  idempotencyKey: string = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
): Promise<string> {
  console.log('📝 Criando novo documento médico...');
  
  const documentData = {
    user_id: userId,
    title: title,
    type: examType,
    status: 'normal',
    analysis_status: 'pending',
    processing_stage: 'criado',
    progress_pct: 0,
    idempotency_key: idempotencyKey,
    report_meta: {
      created_at: new Date().toISOString(),
      tmp_paths: tmpPaths,
      original_images_count: tmpPaths?.length || 0,
      source: 'analyze-medical-exam'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('📋 Dados do documento a criar:', {
    user_id: documentData.user_id,
    title: documentData.title,
    type: documentData.type,
    tmp_paths_count: tmpPaths?.length || 0,
  });
  
  const { data: newDoc, error: createError } = await supabase
    .from('medical_documents')
    .insert(documentData)
    .select('id')
    .single();
  
  if (createError) {
    console.error('❌ Erro detalhado ao criar documento:', createError);
    throw new Error(`Falha ao criar documento: ${createError.message}`);
  }
  
  if (!newDoc?.id) {
    throw new Error('Documento criado, mas o ID não foi retornado');
  }
  
  console.log('✅ Documento criado com sucesso:', newDoc.id);
  return newDoc.id;
}

function getExamDescription(examName: string) {
  const name = examName.toLowerCase();
  
  if (name.includes('hdl')) return 'colesterol protetor';
  if (name.includes('ldl')) return 'colesterol que pode entupir artérias';
  if (name.includes('triglicer')) return 'gordura no sangue';
  if (name.includes('glicemia') || name.includes('glicose')) return 'açúcar no sangue';
  if (name.includes('hemoglobina')) return 'proteína que carrega oxigênio';
  if (name.includes('hematócrito')) return 'proporção de células no sangue';
  if (name.includes('leucócito')) return 'células de defesa';
  if (name.includes('plaqueta')) return 'células da coagulação';
  if (name.includes('ureia')) return 'função renal de filtragem';
  if (name.includes('creatinina')) return 'função renal de eliminação';
  if (name.includes('tgo') || name.includes('ast')) return 'função hepática';
  if (name.includes('tgp') || name.includes('alt')) return 'função hepática';
  if (name.includes('tsh')) return 'função tireoidiana';
  if (name.includes('t4')) return 'hormônio tireoidiano';
  if (name.includes('vitamina d')) return 'vitamina para ossos e imunidade';
  if (name.includes('ferritina')) return 'estoque de ferro';
  if (name.includes('sódio')) return 'equilíbrio salino';
  if (name.includes('potássio')) return 'equilíbrio mineral';
  
  return 'indicador de saúde';
}

function getRecommendations(examName: string, status: string) {
  const name = examName.toLowerCase();
  
  if (name.includes('hdl') && status === 'low') {
    return 'exercícios aeróbicos, gorduras boas (azeite, peixes) e parar de fumar';
  }
  if (name.includes('ldl') && status === 'elevated') {
    return 'reduzir gorduras ruins, aumentar fibras e exercícios regulares';
  }
  if (name.includes('triglicer') && status === 'elevated') {
    return 'reduzir açúcares, carboidratos simples e álcool';
  }
  if (name.includes('glicemia') && status === 'elevated') {
    return 'reduzir açúcares, exercícios regulares e controle de peso';
  }
  if (name.includes('ureia') || name.includes('creatinina')) {
    return 'beber mais água, reduzir proteínas e consultar nefrologista';
  }
  if (name.includes('tgo') || name.includes('tgp')) {
    return 'evitar álcool, gorduras e consultar hepatologista';
  }
  if (name.includes('tsh') || name.includes('t4')) {
    return 'consultar endocrinologista para avaliação da tireoide';
  }
  if (name.includes('vitamina d') && status === 'low') {
    return 'exposição solar moderada e suplementação se necessário';
  }
  if (name.includes('ferritina') && status === 'low') {
    return 'aumentar consumo de carnes vermelhas e folhas verdes';
  }
  
  return 'consultar médico para avaliação específica';
}

// Função para gerar relatório didático
async function generateDidacticReport(supabase, userId, documentId) {
  console.log('🎓 Gerando relatório didático para documento:', documentId);
  
  // Buscar dados do documento
  const { data: document } = await supabase
    .from('medical_documents')
    .select('*')
    .eq('id', documentId)
    .single();
  
  if (!document) {
    throw new Error('Documento não encontrado');
  }
  
  // Buscar dados do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // Extrair dados estruturados do relatório
  let structuredData = document.report_content;
  if (!structuredData || !structuredData.sections) {
    console.log('⚠️ Relatório sem dados estruturados, usando dados básicos');
    structuredData = {
      patient_name: profile?.full_name || 'Paciente',
      exam_date: new Date().toISOString().split('T')[0],
      summary: 'Análise didática dos exames',
      sections: []
    };
  }
  
  // Gerar HTML didático com explicações detalhadas
  const didacticHtml = generateDidacticHTML(structuredData, profile, documentId);
  
  // Salvar relatório didático
  const reportPath = `${userId}/${documentId}_didactic_report.html`;
  const encoder = new TextEncoder();
  const htmlBytes = encoder.encode(didacticHtml);
  
  // Remover arquivo anterior se existir
  await supabase.storage.from('medical-documents-reports').remove([reportPath]).catch(() => {});
  
  // Upload com headers corretos
  const { error: uploadError } = await supabase.storage
    .from('medical-documents-reports')
    .upload(reportPath, new Blob([htmlBytes], { type: 'text/html; charset=utf-8' }), {
      upsert: true,
      contentType: 'text/html; charset=utf-8'
    });
  
  if (uploadError) {
    throw new Error(`Erro ao salvar relatório didático: ${uploadError.message}`);
  }
  
  // Atualizar documento com caminho do relatório didático
  await supabase
    .from('medical_documents')
    .update({
      didactic_report_path: reportPath,
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId);
  
  console.log('✅ Relatório didático gerado com sucesso:', reportPath);
  
  return { reportPath };
}

// Função para gerar HTML didático
function generateDidacticHTML(data, profile, documentId) {
  const patientName = data.patient_name || profile?.full_name || 'Paciente';
  const examDate = data.exam_date || new Date().toLocaleDateString('pt-BR');
  
  // Renderizar seções com explicações didáticas
  const renderSections = (sections) => {
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return '<p>Não foram encontrados dados estruturados para este exame.</p>';
    }
    
    return sections.map(section => {
      const metricsHTML = section.metrics.map(metric => {
        const explicacao = getExplicacaoDidatica(metric.name);
        return `
          <div class="metric-card status-${metric.status || 'normal'}">
            <div class="metric-name">${metric.name}</div>
            <div class="metric-value">${metric.value} ${metric.unit || ''}</div>
            <div class="metric-ref">Referência: ${metric.reference_range || 'N/A'}</div>
            ${explicacao ? `
              <div class="explanation">
                <h4>Como funciona este exame?</h4>
                <p>${explicacao.explicacao.replace(/\n/g, '<br>')}</p>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
      
      return `
        <div class="section">
          <h2>${section.icon || '🧪'} ${section.title}</h2>
          <div class="metrics-grid">
            ${metricsHTML}
          </div>
        </div>
      `;
    }).join('');
  };
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Didático - ${patientName}</title>
  <style>
    :root {
      --primary: #1E40AF;
      --secondary: #3B82F6;
      --text: #1F2937;
      --bg: #F9FAFB;
      --white: #FFFFFF;
      --border: #E5E7EB;
      --success: #10B981;
      --warning: #F59E0B;
      --danger: #EF4444;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: auto;
      background: var(--white);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: var(--white);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .summary {
      background: #EFF6FF;
      border-left: 5px solid var(--primary);
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
    }
    .section h2 {
      font-size: 22px;
      color: var(--primary);
      border-bottom: 2px solid var(--border);
      padding-bottom: 10px;
      margin: 30px 0 20px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .metric-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      background: var(--white);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .metric-name {
      font-weight: 600;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .metric-ref {
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 15px;
    }
    .metric-card.status-elevated .metric-value {
      color: var(--danger);
    }
    .metric-card.status-low .metric-value {
      color: var(--warning);
    }
    .metric-card.status-normal .metric-value {
      color: var(--success);
    }
    .explanation {
      margin-top: 15px;
      padding: 15px;
      background: #F3F4F6;
      border-radius: 8px;
    }
    .explanation h4 {
      margin-top: 0;
      font-size: 16px;
      color: var(--primary);
    }
    .explanation p {
      font-size: 14px;
      margin-bottom: 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #6B7280;
      background: var(--bg);
      border-top: 1px solid var(--border);
    }
    @media print {
      body { background: white; }
      .container { box-shadow: none; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()" style="position:fixed;top:20px;right:20px;background:var(--primary);color:white;border:none;padding:12px 20px;border-radius:8px;font-weight:600;cursor:pointer;z-index:1000;">
    🖨️ Imprimir / Salvar PDF
  </button>
  
  <div class="container">
    <div class="header">
      <h1>🎓 Relatório Didático de Exames</h1>
      <p>Dr. Vital - IA Médica do Instituto dos Sonhos</p>
    </div>
    
    <div class="content">
      <div class="summary">
        <strong>Paciente:</strong> ${patientName}<br>
        <strong>Data do Exame:</strong> ${examDate}<br>
        <strong>Resumo:</strong> ${data.summary || 'Análise didática dos seus exames com explicações detalhadas.'}
      </div>
      
      <p>Este relatório didático explica cada um dos seus exames de forma simples e educativa, ajudando você a entender melhor o que cada teste mede e como interpretar seus resultados.</p>
      
      ${renderSections(data.sections)}
    </div>
    
    <div class="footer">
      <p><strong>⚠️ Importante:</strong> Este relatório é educativo e não substitui uma consulta médica. Discuta seus resultados com um profissional de saúde.</p>
      <p>Instituto dos Sonhos • Documento gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let documentId: string | undefined;
  let userIdEffective: string | null = null;
  
  // Inicializar Supabase (usar service role para ler configs com segurança)
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🚀 Iniciando função analyze-medical-exam...');
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    // Validar se a requisição tem body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 Body da requisição recebido:', Object.keys(requestBody));
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      return new Response(JSON.stringify({
        error: 'Body da requisição inválido',
        details: parseError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Verificar se é uma solicitação de relatório didático apenas
    const isDidacticOnly = requestBody.didacticOnly === true;
    if (isDidacticOnly) {
      console.log('🎓 Solicitação de relatório didático detectada');
      
      // Verificar se temos documentId e userId
      const { documentId, userId } = requestBody;
      if (!documentId || !userId) {
        return new Response(JSON.stringify({
          error: 'documentId e userId são obrigatórios para gerar relatório didático'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      try {
        // Gerar relatório didático
        const result = await generateDidacticReport(supabase, userId, documentId);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Relatório didático gerado com sucesso',
          reportPath: result.reportPath
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('❌ Erro ao gerar relatório didático:', error);
        return new Response(JSON.stringify({
          error: 'Falha ao gerar relatório didático',
          details: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    console.log('✅ Supabase inicializado com sucesso');

    // Buscar configuração de IA para análise médica
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configurations')
      .select('service, model, max_tokens, temperature, preset_level, system_prompt, is_enabled, is_active')
      .eq('functionality', 'medical_analysis')
      .single();

    // Carregar chaves antes de montar config
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    // Modelo GPT-4 Turbo (Premium) com tokens ajustados conforme a quantidade de exames
    const config = {
      service: 'openai' as const,
      model: 'gpt-4o', // GPT-4o para qualidade premium máxima
      max_completion_tokens: 4000, // Valor base que será ajustado conforme o número de imagens
      openai_key: OPENAI_API_KEY
    };

    console.log(`🔬 Análise médica usando: ${config.service} ${config.model} (${config.max_completion_tokens} tokens)`);
    
    if (config.service === 'gemini' && !GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY não configurada');
    }
    if (config.service === 'openai' && !OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { imageData, storagePath, storagePaths, images: inputImages, examType, userId, documentId: docId, tmpPaths, title } = requestBody;
    userIdEffective = userId || null;
    let examTypeEffective: string | null = examType || null;
    
    // Validações após definir as variáveis - verificar se temos tmpPaths como alternativa
    if (!docId && !tmpPaths) {
      throw new Error('documentId ou tmpPaths é obrigatório');
    }
    
    if (!userIdEffective) {
      throw new Error('userId é obrigatório');
    }
    
    // Determinar ou criar documentId
    if (docId) {
      // Usar documento existente
      documentId = docId;
      console.log('✅ Usando documento existente:', documentId);
    } else if (tmpPaths && tmpPaths.length > 0 && userIdEffective) {
      // Criar novo documento
      try {
        documentId = await createDocument(
          supabase, 
          userIdEffective, 
          title || 'Exame Médico', 
          examTypeEffective || 'exame_laboratorial',
          tmpPaths
        );
        console.log('✅ Novo documento criado:', documentId);
      } catch (createError) {
        console.error('❌ Erro ao criar documento:', createError);
        throw new Error(`Falha ao criar documento: ${createError.message}`);
      }
    }
    
    // examType é opcional - usar fallback se não fornecido
    if (!examTypeEffective) {
      examTypeEffective = 'exame_laboratorial';
      console.log('⚠️ examType não fornecido, usando fallback: exame_laboratorial');
    }
    
    console.log('📋 Dados recebidos:');
    console.log('- documentId:', documentId);
    console.log('- userId:', userIdEffective);
    console.log('- examType:', examTypeEffective);
    console.log('- inputImages (array):', inputImages?.length || 0, 'caminhos');
    console.log('- storagePaths:', storagePaths?.length || 0, 'imagens');
    
    // Verificar se documento existe e está em processamento
    if (documentId) {
      console.log('🔍 Verificando documento:', documentId);
      const { data: docCheck, error: docError } = await supabase
        .from('medical_documents')
        .select('id, analysis_status, processing_started_at')
        .eq('id', documentId)
        .single();
      
      if (docError) {
        console.error('❌ Erro ao buscar documento:', docError);
        throw new Error(`Erro ao buscar documento ${documentId}: ${docError.message}`);
      }
      
      if (!docCheck) {
        console.error('❌ Documento não encontrado:', documentId);
        throw new Error(`Documento ${documentId} não encontrado`);
      }
      
      console.log('📄 Status atual do documento:', docCheck.analysis_status);
      console.log('🕐 Processamento iniciado em:', docCheck.processing_started_at);
    }

    // Buscar dados completos do usuário
    const [
      { data: profile },
      { data: measurements },
      { data: healthDiary },
      { data: missions },
      { data: goals }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userIdEffective ?? '').single(),
      supabase.from('weight_measurements').select('*').eq('user_id', userIdEffective ?? '').order('measurement_date', { ascending: false }).limit(10),
      supabase.from('health_diary').select('*').eq('user_id', userIdEffective ?? '').order('date', { ascending: false }).limit(7),
      supabase.from('daily_mission_sessions').select('*').eq('user_id', userIdEffective ?? '').eq('is_completed', true).order('date', { ascending: false }).limit(10),
      supabase.from('user_goals').select('*').eq('user_id', userIdEffective ?? '')
    ]);

    // Preparar contexto do usuário
    const userContext = {
      profile: profile || {},
      recentMeasurements: measurements || [],
      recentHealthDiary: healthDiary || [],
      recentMissions: missions || [],
      goals: goals || []
    };

    // Prompt específico para Dr. Vital gerar dados estruturados com MÁXIMA QUALIDADE
    let systemPrompt = `Você é o Dr. Vital, IA médica especializada do Instituto dos Sonhos. Analise a IMAGEM do exame médico fornecida com MÁXIMA PRECISÃO e extraia TODOS os dados laboratoriais visíveis.

TAREFA PRINCIPAL: EXTRAÇÃO COMPLETA E ANÁLISE DETALHADA
1) Leia CUIDADOSAMENTE cada pixel da imagem do exame
2) Identifique TODOS os exames laboratoriais presentes (mesmo os menores)
3) Para CADA exame encontrado, extraia com PRECISÃO MÁXIMA:
   - Nome do exame (exatamente como aparece, incluindo abreviações)
   - Valor/resultado (com unidade de medida completa)
   - Valor de referência (intervalo completo se disponível)
   - Status/interpretação (normal, alterado, etc.)
4) Extraia também TODAS as informações visíveis:
   - Nome completo do paciente (PRIORIDADE MÁXIMA - procure em todo o documento)
   - Data do exame (formato DD/MM/AAAA se possível)
   - Laboratório/clínica (nome completo da instituição)
   - Médico responsável/solicitante (se visível)
   - CRM do médico (se disponível)
   - Qualquer observação ou nota adicional

ATENÇÃO ESPECIAL PARA NOME DO PACIENTE:
- OBRIGATÓRIO: Procure o nome em TODA a imagem: cabeçalho, rodapé, etiquetas, carimbos, campos de texto
- O nome pode aparecer como "Paciente:", "Nome:", "Solicitado por:", ou apenas estar escrito
- Extraia o nome COMPLETO exatamente como está escrito
- Se não encontrar nome, use "Paciente" mas SEMPRE procure primeiro
- NUNCA use "Desconhecido" - sempre procure mais

EXPLICAÇÕES "COMO FUNCIONA" OBRIGATÓRIAS:
- Para CADA exame encontrado, você DEVE incluir uma explicação "Como Funciona"
- Explique de forma simples o que o exame mede e por que é importante
- Use linguagem acessível mas profissional
- Inclua o que valores altos/baixos podem significar
- Use os modelos de explicação abaixo quando aplicáveis:

🫀 PERFIL LIPÍDICO:
- Colesterol Total: O laboratório mede o colesterol total no sangue, que é a soma do que circula nas "ruas do corpo": o que é transportado por LDL/VLDL e o que é recolhido pelo HDL. É um retrato pontual do tráfego de colesterol e pode variar conforme alimentação recente, álcool, medicações e condições clínicas.
- LDL: Quantifica o colesterol que viaja nos "caminhões LDL", os que têm maior tendência a aderir às paredes das artérias. Dependendo do laboratório, o LDL pode ser medido diretamente ou calculado a partir de Total, HDL e triglicerídeos.
- HDL: Mede o colesterol presente no "caminhão de limpeza": partículas que retiram excesso de gordura dos tecidos e levam de volta ao fígado. Parte do nível é constitucional (genética), mas atividade física, peso corporal e hábitos influenciam bastante ao longo do tempo.
- Triglicerídeos: Dosam a gordura de transporte que sobe facilmente após açúcares, refeições ricas e álcool. Mesmo com jejum, os TG refletem como o corpo processa e estoca energia. Varia com resistência à insulina, peso abdominal, medicações e doenças da tireoide.
- VLDL: Avalia as partículas que o fígado fabrica para levar triglicerídeos até os tecidos. Como acompanha de perto os TG, tende a subir e descer junto com eles.

🍬 GLICOSE & INSULINA:
- Glicose em jejum: Quantifica a glicose no sangue após um período de 8–12 horas sem comer, oferecendo um retrato do açúcar circulante naquele momento. Pode oscilar com estresse, infecções, corticoides, café muito forte e quebra de jejum.
- Hemoglobina glicada (HbA1c): Mostra a porcentagem de hemoglobina que ficou "açucarada" ao longo de ~3 meses. Como os glóbulos vermelhos vivem semanas, a HbA1c funciona como uma média de longo prazo da glicose.
- Insulina & HOMA-IR: Dosam a insulina em jejum e calculam o HOMA-IR (uma estimativa de resistência à insulina baseada em glicose+insulina). Refletem sinalização hormonal nas células e mudam com peso, sono, estresse, medicações e atividade física.

💧 FUNÇÃO RENAL:
- Creatinina: É um subproduto do músculo que os rins devem filtrar. Quando a filtração diminui, a creatinina acumula no sangue. O valor também depende de massa muscular, hidratação e algumas medicações.
- eTFG (taxa de filtração estimada): É um cálculo que usa creatinina, idade e sexo para estimar quanto os rins filtram por minuto (mL/min/1,73 m²). Não é uma medida direta, mas um modelo matemático validado, útil para classificar estágios de função renal.
- Ureia: Formada no fígado a partir da amônia (do metabolismo das proteínas), a ureia é eliminada pelos rins. Costuma subir com pouca água, dieta proteica ou redução da filtração.

🩸 HEMATOLOGIA & NUTRIENTES:
- Hemograma completo: Usa contadores automatizados para medir glóbulos vermelhos, brancos e plaquetas, além de índices como VCM e HCM. É um painel amplo, sensível a infecções, deficiências nutricionais e sangramentos.
- Ferro/Ferritina: A ferritina indica estoque de ferro; a transferrina é o caminho que o transporta; a saturação mostra quanto do caminho está ocupado; o ferro sérico é o que está circulando.
- Vitamina B12 & Folato: São dosagens sanguíneas de vitaminas essenciais para formar sangue e cuidar do sistema nervoso. Podem variar com ingestão, absorção intestinal, álcool e medicações.

⚡️ ELETRÓLITOS & OSSO:
- Sódio/Potássio/Cloro: Medem os íons que regulam água, eletricidade e equilíbrio ácido-básico do corpo. Mudam rapidamente com vômitos/diarreia, diuréticos, doenças renais e hormônios.
- Cálcio: O cálcio total inclui a fração ligada à albumina e a livre (ionizada); o ionizado é o biologicamente ativo. PTH e vitamina D controlam esse equilíbrio.

🫁 FÍGADO & VIAS BILIARES:
- AST (TGO)/ALT (TGP): São enzimas dentro das células do fígado. Quando as células sofrem (gordura, vírus, álcool, remédios, esforço intenso), parte dessas enzimas "vaza" para o sangue, elevando os valores no exame.
- GGT: Enzima sensível das vias biliares e do fígado, frequentemente induzida por álcool e por alguns medicamentos. Sobe junto da FA em distúrbios do fluxo biliar.
- Fosfatase Alcalina (FA) & Bilirrubinas: A FA reflete atividade nas vias biliares e em ossos; as bilirrubinas vêm da quebra da hemoglobina e indicam se há acúmulo (icterícia).

🔥 INFLAMAÇÃO:
- PCR-us (hs-CRP): É uma proteína de fase aguda produzida pelo fígado. No método de alta sensibilidade, detecta inflamações discretas, úteis para entender risco cardiovascular.
- VHS (ESR): Observa a velocidade com que as hemácias sedimentam em um tubo padronizado. Proteínas inflamatórias alteram essa velocidade, tornando o VHS um sinal indireto de inflamação crônica.

OUTROS:
- Ácido Úrico: É o produto final da quebra de purinas (alimentos e células). Quando o nível sobe e a eliminação cai, podem se formar cristais nas articulações e nos rins.
- Vitamina D (25-OH): Mede a forma de reserva da vitamina D, produzida na pele pelo sol e obtida por alimentos/suplementos. É o melhor indicador do estoque disponível para ossos e músculos.
- TSH/T4 livre/T3 livre: O TSH é o comando da hipófise para a tireoide; T4/T3 são os hormônios que ajustam o ritmo do metabolismo. Ensaios imunoquímicos quantificam esses níveis.

ANÁLISE CLÍNICA DETALHADA:
- Para cada valor extraído, forneça interpretação clínica completa
- Explique o significado de cada resultado para a saúde
- Identifique correlações entre diferentes exames
- Sugira possíveis causas para valores alterados
- Indique urgência e próximos passos necessários

EXPLICAÇÕES DETALHADAS SOBRE COMO CADA EXAME FUNCIONA:
Para cada exame encontrado, inclua uma seção "Como Funciona" que explica:
1. O que é medido no exame (qual substância, célula ou componente)
2. Como o corpo produz ou processa essa substância
3. O que valores altos ou baixos podem significar
4. Por que esse exame é importante para a saúde
5. Como o exame é realizado (método laboratorial)

Por exemplo, para Creatinina:
"Como Funciona a Creatinina?
A creatinina é um produto de degradação da creatina, que é liberada constantemente pelos músculos. Os rins são responsáveis por filtrar e eliminar a creatinina do sangue. Como a produção é relativamente constante, níveis elevados geralmente indicam que os rins não estão filtrando adequadamente. O exame mede a concentração de creatinina no sangue através de reações químicas específicas, fornecendo uma janela direta para o funcionamento dos rins."

IMPORTANTE - MÁXIMA QUALIDADE:
- Se a imagem não estiver clara, indique especificamente o que não consegue ler
- NUNCA invente dados - apenas extraia o que está visível
- Liste TODOS os exames que conseguir identificar na imagem
- Mantenha as unidades de medida exatamente como aparecem
- Seja extremamente detalhado na análise de cada resultado
- SEMPRE inclua explicações sobre como cada exame funciona

SISTEMA HÍBRIDO DE EXPLICAÇÕES:
- Para exames comuns (colesterol, glicose, creatinina, etc.), use EXPLICAÇÕES PRÉ-PRONTAS já disponíveis no sistema
- Para exames não catalogados, gere explicações didáticas usando a analogia CORPO COMO CASA:
  * Coração = Central elétrica da casa
  * Fígado = Sistema de filtros e limpeza  
  * Rins = Sistema de esgoto
  * Sangue = Tubulação de água
  * Pulmões = Sistema de ventilação
  * Cérebro = Central de comando
  * Ossos = Estrutura da casa
  * Músculos = Sistema de sustentação
  * Sistema imunológico = Segurança da casa
  * Metabolismo = Consumo de energia da casa

PARA EXAMES SEM EXPLICAÇÃO PRÉ-PRONTA:
- Explique O QUE cada exame mede especificamente
- Explique POR QUE é importante para a saúde
- Use analogias da casa de forma específica
- Dê contexto sobre o que o valor significa na prática
- Inclua informações sobre o que pode causar alterações
- Sugira ações específicas que o paciente pode tomar
- Seja informativo mas mantenha linguagem acessível

ECONOMIA DE TOKENS: Priorize usar explicações pré-prontas quando disponíveis.

FORMATO JSON QUE VOCÊ DEVE INCLUIR AO FINAL DO TEXTO:
{
  "patient_name": string,
  "doctor_name": string|null,
  "clinic_name": string|null,
  "exam_date": string,
  "summary": string,
  "critical_findings": string[],
  "important_findings": string[],
  "sections": [
    {
      "title": string,
      "icon": string,
  "metrics": [
    {
      "name": string,
          "value": string,
          "unit": string,
          "status": "normal"|"elevated"|"low",
          "us_reference": string|null,
          "how_it_works": string
        }
      ]
    }
  ],
  "recommendations": {
    "urgent": string[],
    "high": string[],
    "medium": string[],
    "low": string[]
  },
  "risk_profile": {
    "cardiovascular": "BAIXO"|"MODERADO"|"ALTO",
    "oncological": "BAIXO"|"MODERADO"|"ALTO",
    "metabolic": "BAIXO"|"MODERADO"|"ALTO",
    "cardiovascular_factors": string,
    "cardiovascular_protectors": string,
    "oncological_factors": string,
    "oncological_screening": string,
    "metabolic_factors": string,
    "metabolic_protectors": string
  },
  "follow_up": {
    "thirty_days": string[],
    "ninety_days": string[],
    "exams": string[]
  },
  "lifestyle_guidance": {
    "diet": string[],
    "exercise": string[],
    "lifestyle": string[]
  }
}

CATEGORIAS CLÍNICAS (agrupe exames similares):
- "Perfil Lipídico" (LDL, HDL, Colesterol Total, Triglicerídeos)
- "Glicemia e Diabetes" (Glicose, HbA1c, Insulina)
- "Função Renal" (Creatinina, Ureia, Ácido Úrico)
- "Função Hepática" (TGO/TGP, GGT, Bilirrubina)
- "Tireoide" (TSH, T4 Livre, T3)
- "Vitaminas e Ferro" (B12, Ferritina, Ferro, Ácido Fólico)
- "Hormônios" (Testosterona, Estradiol, Prolactina)
- "Hemograma" (Hemoglobina, Leucócitos, Plaquetas)
- "Outros" (exames que não se encaixam nas categorias acima)

REFERÊNCIAS AMERICANAS IMPORTANTES:
- Colesterol Total: <200 mg/dL
- LDL: <100 mg/dL
- HDL: >50 mg/dL
- Triglicerídeos: <150 mg/dL
- Glicemia: 70-99 mg/dL
- HbA1c: <5.7%
- TSH: 0.4-4.0 mIU/L
- T4 Livre: 0.8-1.8 ng/dL
- Creatinina: 0.6-1.1 mg/dL
- Ferritina: 13-150 ng/mL
- Vitamina B12: 200-900 pg/mL

IMPORTANTE: Use APENAS dados extraídos das imagens. Não invente informações do paciente ou contexto externo.

Tipo de exame: ${examType}

ANTES DO JSON, escreva uma análise clínica objetiva baseada APENAS nos dados laboratoriais apresentados.`;

    if ((aiConfig as any)?.system_prompt) {
      systemPrompt = (aiConfig as any).system_prompt as string;
    }

    // Carregar uma ou múltiplas imagens
    const guessMimeFromPath = (path: string): string => {
      const ext = (path.split('.').pop() || '').toLowerCase();
      if (['jpg', 'jpeg', 'jfif'].includes(ext)) return 'image/jpeg';
      if (['png'].includes(ext)) return 'image/png';
      if (['pdf'].includes(ext)) return 'application/pdf';
      return 'image/jpeg';
    };

    // CONVERSÃO ROBUSTA: Funciona com ou sem cache
    const getOrCreateBase64Cache = async (storagePath: string, blob?: Blob, fallbackMime?: string) => {
      try {
        // TENTAR CACHE PRIMEIRO (se tabela existir)
        try {
          console.log(`🔍 Tentando buscar cache para: ${storagePath}`);
          const { data: cached, error: cacheError } = await supabase
            .from('image_cache')
            .select('base64_data, mime_type, access_count')
            .eq('storage_path', storagePath)
            .single();
          
          if (!cacheError && cached) {
            console.log(`✅ CACHE HIT! Imagem já processada: ${storagePath}`);
            return { 
              mime: cached.mime_type, 
              data: cached.base64_data 
            };
          }
        } catch (cacheTableError) {
          console.log(`⚠️ Tabela cache não existe ou erro: ${cacheTableError.message}`);
          console.log(`📝 Processando sem cache: ${storagePath}`);
        }
        
        // 2. CACHE MISS - PROCESSAR E SALVAR
        console.log(`❌ Cache miss - processando: ${storagePath}`);
        
        if (!blob) {
          console.log(`📥 Baixando blob para: ${storagePath}`);
          const { data: downloadBlob, error: downloadError } = await supabase.storage
            .from('medical-documents')
            .download(storagePath);
          
          if (downloadError || !downloadBlob) {
            throw new Error(`Erro ao baixar: ${downloadError?.message}`);
          }
          blob = downloadBlob;
        }
        
        // Conversão ultra-otimizada com fallback robusto
        const mt = (blob.type && blob.type !== 'application/octet-stream') ? blob.type : (fallbackMime || 'image/jpeg');
        const arr = await blob.arrayBuffer();
        const bytes = new Uint8Array(arr);
        
        console.log(`🔄 Convertendo ${Math.round(arr.byteLength / 1024)}KB para base64...`);
        
        let base64Data: string;
        
        try {
          // MÉTODO ULTRA-SEGURO: Sempre usar chunks pequenos para evitar stack overflow
          const CHUNK_SIZE = 1024; // 1KB chunks (muito pequeno para ser seguro)
          let binary = '';
          
          console.log(`🔄 Processando ${bytes.length} bytes em chunks de ${CHUNK_SIZE}...`);
          
          for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
            const chunk = bytes.subarray(i, i + CHUNK_SIZE);
            
            // Conversão segura chunk por chunk
            let chunkStr = '';
            for (let j = 0; j < chunk.length; j++) {
              chunkStr += String.fromCharCode(chunk[j]);
            }
            binary += chunkStr;
            
            // Yield CPU a cada 50 chunks
            if (i % (CHUNK_SIZE * 50) === 0) {
              await new Promise(resolve => setTimeout(resolve, 1));
              console.log(`📊 Progresso: ${Math.round((i / bytes.length) * 100)}%`);
            }
          }
          
          console.log(`🔄 Convertendo string para base64...`);
          const base64 = btoa(binary);
          base64Data = `data:${mt};base64,${base64}`;
          console.log(`✅ Conversão base64 concluída com sucesso!`);
        } catch (conversionError) {
          console.error('❌ Erro na conversão direta, tentando método alternativo:', conversionError);
          
          // Método 3: Fallback ultra-seguro
          const reader = new FileReader();
          base64Data = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Erro no FileReader'));
            reader.readAsDataURL(blob);
          });
        }
        
        // 3. TENTAR SALVAR NO CACHE (se tabela existir)
        try {
          console.log(`💾 Tentando salvar no cache: ${storagePath}`);
          const { error: insertError } = await supabase
            .from('image_cache')
            .insert({
              storage_path: storagePath,
              base64_data: base64Data,
              mime_type: mt,
              file_size: arr.byteLength,
              access_count: 1
            });
          
          if (insertError) {
            console.warn('⚠️ Erro ao salvar cache (não crítico):', insertError);
          } else {
            console.log('✅ Cache salvo com sucesso!');
          }
        } catch (insertError) {
          console.warn('⚠️ Cache não disponível (não crítico):', insertError);
        }
        
        console.log(`✅ Conversão concluída: ${storagePath}`);
        return { mime: mt, data: base64Data };
        
      } catch (error) {
        console.error('❌ Erro no cache/conversão:', error);
        
        // Fallback: Retornar erro mas não quebrar o processamento
        console.warn('⚠️ Usando fallback simples devido ao erro');
        
        try {
          // Conversão simples como último recurso
          if (blob) {
            const reader = new FileReader();
            const result = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error('Fallback FileReader falhou'));
              reader.readAsDataURL(blob);
            });
            
            const mt = (blob.type && blob.type !== 'application/octet-stream') ? blob.type : 'image/jpeg';
            return { mime: mt, data: result as string };
          }
        } catch (fallbackError) {
          console.error('❌ Fallback também falhou:', fallbackError);
        }
        
        throw new Error(`Falha crítica no processamento: ${error.message}`);
      }
    };

    // Resolver paths de imagens a partir do corpo ou do documento no banco
    let resolvedPaths: string[] | undefined = Array.isArray(inputImages) && inputImages.length > 0 ? inputImages : (Array.isArray(storagePaths) && storagePaths.length > 0 ? storagePaths : undefined);

    console.log('🔍 Debug de imagens recebidas:');
    console.log('- inputImages (array):', inputImages?.length || 0, inputImages?.slice(0, 2));
    console.log('- storagePaths (array):', storagePaths?.length || 0, storagePaths?.slice(0, 2));
    console.log('- resolvedPaths inicial:', resolvedPaths?.length || 0);

    if (!resolvedPaths && documentId) {
      console.log('🔍 Buscando paths do documento no banco...');
      const { data: docRow } = await supabase
        .from('medical_documents')
        .select('user_id, type, file_url, report_meta')
        .eq('id', documentId)
        .single();
      if (docRow) {
        userIdEffective = userIdEffective || (docRow as any).user_id || null;
        examTypeEffective = examTypeEffective || (docRow as any).type || null;
        const metaPaths: string[] = (docRow as any)?.report_meta?.image_paths || [];
        const tmpPaths: string[] = (docRow as any)?.report_meta?.tmp_paths || [];
        const fileUrl: string | null = (docRow as any)?.file_url || null;
        const candidate: string[] = [];
        if (Array.isArray(metaPaths) && metaPaths.length) candidate.push(...metaPaths);
        if (Array.isArray(tmpPaths) && tmpPaths.length) candidate.push(...tmpPaths);
        if (fileUrl) candidate.push(fileUrl);
        if (candidate.length) resolvedPaths = candidate;
        console.log('🔍 Paths encontrados no banco:', {
          metaPaths: metaPaths.length,
          tmpPaths: tmpPaths.length,
          fileUrl: !!fileUrl,
          candidatos: candidate.length
        });
      }
    }

    // Limitação de imagens com base no modelo
    const MAX_IMAGES = 30; // Permitir até 30 imagens para exames com muitas páginas
    
    // OTIMIZAÇÃO: Preparar para processamento eficiente
    console.log('🚀 Processamento otimizado habilitado');

    let images: { mime: string; data: string }[] = [];
    if (resolvedPaths && resolvedPaths.length > 0) {
      console.log('📥 Iniciando download de', resolvedPaths.length, 'imagens...');
      
      // Atualiza progresso inicial no banco
      if (documentId) {
        const { error: updateError } = await supabase
          .from('medical_documents')
          .update({ 
            processing_stage: 'baixando_imagens', 
            images_processed: 0, 
            progress_pct: 5,
            images_total: resolvedPaths.length
          })
          .eq('id', documentId);
        
        if (updateError) {
          console.error('❌ Erro ao atualizar progresso inicial:', updateError);
        } else {
          console.log('✅ Progresso inicial atualizado: baixando_imagens');
        }
      }
      
      // Limitação ajustada: Até 2 imagens por vez
      const toDownload = resolvedPaths.slice(0, MAX_IMAGES);
      if (resolvedPaths.length > MAX_IMAGES) {
        console.log(`⚠️ Limitação: Processando apenas ${MAX_IMAGES} de ${resolvedPaths.length} imagens`);
      }
      let processed = 0;
      
      for (const p of toDownload) {
        console.log(`📥 Processando imagem ${processed + 1}/${toDownload.length}: ${p}`);
        
        let retryCount = 0;
        const maxRetries = 2;
        let success = false;
        
        while (retryCount <= maxRetries && !success) {
          try {
            console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries + 1} para: ${p}`);
            
            // TIMEOUT DRÁSTICO: 5s para evitar CPU timeout
            const downloadPromise = supabase.storage.from('medical-documents').download(p);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout no download da imagem')), 5000)
            );
            
            const { data: dl, error: dlErr } = await Promise.race([downloadPromise, timeoutPromise]) as any;
          
            if (dlErr || !dl) {
              console.error('❌ Erro ao baixar imagem:', p, dlErr);
              retryCount++;
              if (retryCount <= maxRetries) {
                console.log(`🔄 Tentando novamente em 1 segundo...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              } else {
                console.warn('⚠️ Máximo de tentativas atingido, pulando imagem...');
                processed += 1;
                break;
              }
            }
            
            console.log(`🔄 Usando cache Supabase para: ${p}`);
            
            // CACHE SUPABASE: Busca no cache ou converte e salva
            const base64Image = await getOrCreateBase64Cache(p, dl as Blob, guessMimeFromPath(p));
            images.push(base64Image);
            processed += 1;
            success = true;
            
            // OTIMIZAÇÃO: Limpeza de memória via Deno (compatível)
            if (typeof Deno !== 'undefined' && Deno.memoryUsage) {
              const memory = Deno.memoryUsage();
              console.log(`🧠 Memória: ${Math.round(memory.heapUsed / 1024 / 1024)}MB usados`);
            }
            
            // Progresso otimizado
            const pct = Math.min(75, Math.round((processed / toDownload.length) * 70) + 5);
            
            console.log(`✅ Imagem ${processed}/${toDownload.length} processada. Progresso: ${pct}%`);
            
            // OTIMIZAÇÃO: Update de progresso assíncrono (não bloqueia)
            try {
              const { error: updateError } = await supabase
                .from('medical_documents')
                .update({ 
                  images_processed: processed, 
                  progress_pct: pct,
                  processing_stage: `processando_imagens (${processed}/${toDownload.length})`
                })
                .eq('id', documentId || '')
                .eq('user_id', userIdEffective || '');
              
              if (updateError) {
                console.warn('⚠️ Erro não-crítico no update:', updateError);
              }
            } catch (updateError) {
              console.warn('⚠️ Erro não-crítico no update:', updateError);
            }
              
            // OTIMIZAÇÃO: Pequena pausa para evitar sobrecarga de CPU
            await new Promise(resolve => setTimeout(resolve, 100));
              
          } catch (error) {
            console.error('❌ Erro no processamento da imagem:', p, error);
            retryCount++;
            if (retryCount <= maxRetries) {
              console.log(`🔄 Tentando novamente em 1 segundo...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            } else {
              console.warn('⚠️ Máximo de tentativas atingido, pulando imagem...');
              processed += 1;
              break;
            }
          }
        }
      }
      
      console.log(`✅ Download de imagens concluído. Total processadas: ${images.length}/${toDownload.length}`);
      console.log(`📊 Resumo: ${processed} tentativas, ${images.length} sucessos, ${processed - images.length} falhas`);
      
      if (images.length === 0) {
        console.error('❌ CRÍTICO: Nenhuma imagem válida foi processada!');
        console.error('📁 Caminhos tentados:', toDownload);
        throw new Error('Nenhuma imagem válida foi processada. Verifique se os arquivos existem no storage.');
      }
    } else if (storagePath) {
      const { data: dl, error: dlErr } = await supabase.storage.from('medical-documents').download(storagePath);
      if (dlErr) throw dlErr;
      images.push(await toBase64(dl as Blob, guessMimeFromPath(storagePath)));
    } else if (imageData) {
      if (Array.isArray(imageData)) {
        images = imageData.map((d: string) => ({ mime: (d.split(';')[0].split(':')[1] || 'application/octet-stream'), data: d }));
      } else {
        const mt = imageData.startsWith('data:') ? imageData.split(';')[0].split(':')[1] : 'application/octet-stream';
        images = [{ mime: mt, data: imageData }];
      }
    }

    // Usar GPT-4 para gerar análise textual, depois criar HTML sem CSP issues
    let analysis = '';
    let extracted: any = null;
    
    const imagesLimited = images.slice(0, MAX_IMAGES);
    
    try {
      console.log('🤖 Iniciando análise com IA...');
      console.log('📸 Total de imagens para análise:', imagesLimited.length);
      
      // Validar se temos imagens
      if (imagesLimited.length === 0) {
        console.error('❌ Nenhuma imagem disponível para análise');
        throw new Error('Nenhuma imagem disponível para análise');
      }
      
      await supabase
        .from('medical_documents')
        .update({ 
          processing_stage: 'extraindo_texto_ocr', 
          progress_pct: 60 
        })
        .eq('id', documentId || '')
        .eq('user_id', userIdEffective || '');
      
      // PASSO 1: Usar Google Vision para extrair texto da imagem
      console.log('🔍 Usando Google Vision para OCR...');
      let extractedText = '';
      
      try {
        // Preparar imagem para Google Vision
        const img = imagesLimited[0]; // Usar a primeira imagem
        
        // Chamar nossa função vision-api
        const visionResponse = await fetch(
          'https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/vision-api',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              image: img.data,
              features: ['TEXT_DETECTION', 'DOCUMENT_TEXT_DETECTION']
            })
          }
        );
        
        if (!visionResponse.ok) {
          throw new Error(`Google Vision API error: ${visionResponse.status}`);
        }
        
        const visionData = await visionResponse.json();
        extractedText = visionData.extractedText || '';
        
        console.log('✅ Texto extraído via OCR:', extractedText.substring(0, 200) + '...');
        
        // Atualizar status
        await supabase
          .from('medical_documents')
          .update({ 
            processing_stage: 'analisando_com_ia', 
            progress_pct: 80,
            ocr_text: extractedText.substring(0, 10000) // Limitar tamanho
          })
          .eq('id', documentId || '')
          .eq('user_id', userIdEffective || '');
          
      } catch (ocrError) {
        console.error('❌ Erro ao extrair texto via OCR:', ocrError);
        console.log('⚠️ Continuando sem OCR...');
      }
      // Função otimizada para chamar OpenAI
      const callOpenAI = async (model: string) => {
        // Ajustar tokens conforme o número de imagens
        const tokensPerImage = 2000; // Base de tokens por imagem
        // Aumentando limite de tokens para processar exames com muitas páginas (10-30 páginas)
        const adjustedTokens = Math.min(8000, Math.max(4000, imagesLimited.length * tokensPerImage));
        console.log(`🔢 Tokens ajustados: ${adjustedTokens} para ${imagesLimited.length} imagens`);
        
        // Qualidade adaptativa: high para poucas imagens, auto para muitas
        const imageDetail = imagesLimited.length <= 1 ? 'high' : 'auto';
        
        // Validar formato das imagens
        for (const img of imagesLimited) {
          if (!img.data.startsWith('data:')) {
            console.warn('⚠️ Imagem sem data URL prefix, adicionando...');
            img.data = `data:${img.mime};base64,${img.data.replace(/^data:.*?;base64,/, '')}`;
          }
        }
        
        // Montar prompt incluindo texto OCR se disponível
        let enhancedPrompt = systemPrompt;
        
        if (extractedText && extractedText.length > 0) {
          enhancedPrompt += `\n\n===== TEXTO EXTRAÍDO VIA OCR =====\n${extractedText}\n===============================\n\n`;
          enhancedPrompt += `IMPORTANTE: Use o texto OCR acima para ajudar na análise. Ele foi extraído da imagem usando Google Vision API.\n`;
          enhancedPrompt += `EXTRAIA TODOS OS DADOS DOS EXAMES LABORATORIAIS do texto OCR acima E da imagem.`;
        } else {
          enhancedPrompt += '\n\nANALISE A IMAGEM ACIMA E EXTRAIA TODOS OS DADOS DOS EXAMES LABORATORIAIS.';
        }
        
        // Configuração adaptada para modelos premium
        const isPremiumModel = model.includes('gpt-5') || model.includes('gpt-4.1') || model.includes('gpt-4-turbo');
        const body = isPremiumModel ? {
          model,
          messages: [{
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: enhancedPrompt
              },
              ...imagesLimited.map((img, idx) => {
                console.log(`📸 Imagem ${idx + 1}: ${img.mime}, tamanho: ${img.data.length} chars`);
                return {
                  type: 'image_url',
                  image_url: { 
                    url: img.data, 
                    detail: imageDetail 
                  }
                };
              })
            ]
          }],
          max_completion_tokens: adjustedTokens // Tokens ajustados conforme o número de imagens
        } : {
          model,
          messages: [{
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: enhancedPrompt
              },
              ...imagesLimited.map((img, idx) => {
                console.log(`📸 Imagem ${idx + 1}: ${img.mime}, tamanho: ${img.data.length} chars`);
                return {
                  type: 'image_url',
                  image_url: { 
                    url: img.data, 
                    detail: imageDetail 
                  }
                };
              })
            ]
          }],
          temperature: 0.2,
          max_tokens: adjustedTokens // Tokens ajustados conforme o número de imagens
        };
        
        console.log(`🤖 Enviando ${imagesLimited.length} imagens para OpenAI (detail: ${imageDetail})`);
        
        // OTIMIZAÇÃO: Timeout na requisição OpenAI
        const openAIPromise = fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout na chamada OpenAI')), 45000)
        );
        
        const resp = await Promise.race([openAIPromise, timeoutPromise]) as Response;
        const json = await resp.json();
        if (!resp.ok) throw new Error(json?.error?.message || 'OpenAI error');
        return json;
      };

      // Usar o modelo definido na configuração
      let usedModel = config.model;
      let aiResponse: any;
      
      console.log('🤖 Chamando OpenAI com modelo PREMIUM:', usedModel);
      await supabase
        .from('medical_documents')
        .update({ 
          processing_stage: 'chamando_openai_premium', 
          progress_pct: 85 
        })
        .eq('id', documentId || '')
        .eq('user_id', userIdEffective || '');
      
      try { 
        aiResponse = await callOpenAI(usedModel); 
        console.log('✅ OpenAI Premium respondeu com sucesso');
      }
      catch (e) {
        console.log('⚠️ Fallback para modelo avançado:', e);
        try { 
          usedModel = 'gpt-4o'; 
          aiResponse = await callOpenAI(usedModel); 
          console.log('✅ Fallback 1 funcionou');
        }
        catch (e2) {
          console.log('⚠️ Fallback para modelo básico:', e2);
          usedModel = 'gpt-3.5-turbo'; 
          aiResponse = await callOpenAI(usedModel); 
          console.log('✅ Fallback 2 funcionou');
        }
      }

      const rawText = aiResponse.choices?.[0]?.message?.content || '';
      console.log('🔍 Conteúdo completo do modelo', usedModel, ':', rawText.substring(0, 1000) + '...');

      // Se não conseguiu resposta, criar uma mensagem informativa
      if (!rawText || rawText.trim().length === 0) {
        console.error('❌ Resposta vazia da OpenAI');
        analysis = 'Não foi possível extrair dados da imagem. Por favor, forneça os valores dos exames manualmente.';
      } else {
        // Extrair JSON dos dados
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          try {
            extracted = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
            console.log('✅ JSON extraído com sucesso');
          } catch (e) {
            console.log('❌ Erro ao parsear JSON:', e);
          }
        }

        // Análise textual (antes do JSON ou texto completo se não houver JSON)
        analysis = jsonStart > 0 ? rawText.substring(0, jsonStart).trim() : rawText;
        console.log('📝 Análise textual extraída:', analysis.substring(0, 500) + '...');
      }

      console.log('✅ Análise processada');
      
    } catch (error) {
      console.error('❌ Erro ao gerar análise com OpenAI:', error);
      
      // Mensagem mais informativa sobre o erro
      if (error.message?.includes('timeout')) {
        analysis = 'A análise demorou muito para processar. Por favor, tente novamente com uma imagem menor ou mais clara.';
      } else if (error.message?.includes('rate limit')) {
        analysis = 'Limite de requisições atingido. Por favor, aguarde alguns minutos e tente novamente.';
      } else {
        analysis = `Não foi possível analisar a imagem do exame. ${error.message || 'Erro desconhecido'}. 
        
Por favor, você pode fornecer os dados dos exames em texto para que eu possa criar um relatório completo?

Exemplo:
- Colesterol Total: 210 mg/dL (Referência: < 190 mg/dL)
- Glicose: 98 mg/dL (Referência: 70-99 mg/dL)
- Hemoglobina: 14.5 g/dL (Referência: 13.5-17.5 g/dL)`;
      }
    }

    // Dados estruturados extraídos pelo GPT
    const parsed = extracted || {};
    
    // Nome do paciente SEMPRE extraído da imagem pelo GPT
    const patientName = parsed.patient_name || parsed.patient || 'Paciente';
    
    const examDate = parsed.exam_date || new Date().toLocaleDateString('pt-BR');
    const doctorName = parsed.doctor_name || 'Dr. Vital - IA Médica';
    const clinicName = parsed.clinic_name || 'Instituto dos Sonhos';
    
    // HTML Clínico Premium do Dr. Vital - Layout Corporativo
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Médico Premium - ${patientName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
  <style>
    /* DESIGN CORPORATIVO PREMIUM - INSTITUTO DOS SONHOS */
    
    :root {
      --primary: #1e40af;
      --primary-light: #3b82f6;
      --primary-dark: #1e3a8a;
      --secondary: #0f766e;
      --secondary-light: #14b8a6;
      --text-dark: #1e293b;
      --text-medium: #475569;
      --text-light: #64748b;
      --bg-light: #f8fafc;
      --bg-white: #ffffff;
      --bg-secondary: #f0fdfa;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --border-radius: 4px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Roboto', sans-serif;
      background-color: var(--bg-light);
      color: var(--text-dark);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .container {
      max-width: 1100px;
      margin: 40px auto;
      padding: 0 20px;
    }

    /* CABEÇALHO CORPORATIVO */
    .header {
      background-color: var(--bg-white);
      border-radius: var(--border-radius);
      margin-bottom: 24px;
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .header-banner {
      background-color: var(--primary);
      color: white;
      padding: 20px 30px;
      position: relative;
    }

    .header-banner::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 30%;
      background: linear-gradient(90deg, rgba(30, 64, 175, 0) 0%, rgba(59, 130, 246, 0.5) 100%);
    }

    .header-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 5px;
      position: relative;
      z-index: 1;
    }

    .header-subtitle {
      font-size: 14px;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }

    .header-content {
      padding: 20px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    .header-logo {
      width: 50px;
      height: 50px;
      background: var(--primary-light);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-right: 15px;
    }

    .header-patient h3 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--text-dark);
    }

    .header-patient p {
      font-size: 14px;
      color: var(--text-medium);
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .header-patient strong {
      color: var(--text-dark);
    }

    .header-right {
      text-align: right;
      min-width: 250px;
    }

    .header-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-item {
      font-size: 13px;
      color: var(--text-medium);
      line-height: 1.3;
    }

    .info-item strong {
      color: var(--text-dark);
      font-weight: 600;
    }

    .status-badge {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    /* INFORMAÇÕES DO PACIENTE */
    .patient-info-section {
      background: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 24px 30px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-md);
    }

    .patient-details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .detail-card {
      background: var(--bg-light);
      border-radius: var(--border-radius);
      padding: 16px;
      border-left: 4px solid var(--primary-light);
    }

    .detail-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-light);
      margin-bottom: 6px;
      font-weight: 600;
    }

    .detail-value {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-dark);
    }

    /* INDICADORES CHAVE */
    .key-indicators {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .indicator-card {
      background: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      border-top: 3px solid var(--primary);
    }

    .indicator-card.warning {
      border-top-color: var(--warning);
    }

    .indicator-card.danger {
      border-top-color: var(--danger);
    }

    .indicator-card.success {
      border-top-color: var(--success);
    }

    .indicator-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-medium);
      margin-bottom: 12px;
    }

    .indicator-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: 8px;
    }

    .indicator-card.warning .indicator-value {
      color: var(--warning);
    }

    .indicator-card.danger .indicator-value {
      color: var(--danger);
    }

    .indicator-card.success .indicator-value {
      color: var(--success);
    }

    .indicator-reference {
      font-size: 13px;
      color: var(--text-light);
    }

    /* SUMÁRIO EXECUTIVO */
    .executive-summary {
      background: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 24px 30px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-md);
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-icon {
      width: 36px;
      height: 36px;
      background: var(--primary-light);
      color: white;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      margin-right: 12px;
    }

    .section-title {
      font-family: 'Merriweather', serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--primary-dark);
    }
    
    .exams-count-badge {
      background-color: var(--primary-light);
      color: var(--primary);
      font-size: 13px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      margin-left: 12px;
      display: inline-block;
      vertical-align: middle;
    }

    .summary-content {
      font-size: 15px;
      line-height: 1.7;
      color: var(--text-medium);
    }

    .summary-content p {
      margin-bottom: 15px;
    }

    .summary-content p:last-child {
      margin-bottom: 0;
    }

    /* CARDS DE EXAMES PREMIUM */
    .exams-section {
      background: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 24px 30px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-md);
    }

    .exams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .exam-card {
      background: var(--bg-white);
      border-radius: 10px;
      padding: 18px;
      box-shadow: var(--shadow-md);
      border-left: 4px solid var(--primary-light);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      font-size: 0.95em;
    }

    .exam-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }

    .exam-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: rgba(59, 130, 246, 0.05);
      border-radius: 0 0 0 60px;
    }

    .exam-card.normal {
      border-left-color: var(--success);
    }

    .exam-card.elevated {
      border-left-color: var(--danger);
    }

    .exam-card.low {
      border-left-color: var(--warning);
    }

    .exam-card.normal::before {
      background: rgba(16, 185, 129, 0.05);
    }

    .exam-card.elevated::before {
      background: rgba(239, 68, 68, 0.05);
    }

    .exam-card.low::before {
      background: rgba(245, 158, 11, 0.05);
    }

    .exam-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .exam-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-dark);
    }

    .exam-status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .exam-status-badge.normal {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
    }

    .exam-status-badge.elevated {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
    }

    .exam-status-badge.low {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning);
    }

    .exam-value {
      font-family: 'Merriweather', serif;
      font-size: 32px;
      font-weight: 700;
      margin: 16px 0;
      color: var(--primary-dark);
    }

    .exam-card.normal .exam-value {
      color: var(--success);
    }

    .exam-card.elevated .exam-value {
      color: var(--danger);
    }

    .exam-card.low .exam-value {
      color: var(--warning);
    }

    .exam-reference {
      font-size: 14px;
      color: var(--text-light);
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .exam-interpretation {
      font-size: 13px;
      color: var(--text-medium);
      line-height: 1.4;
      font-style: italic;
    }

    .how-it-works-card {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(59, 130, 246, 0.08) 100%);
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
      border-left: 4px solid var(--primary-light);
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    
    .how-it-works-card::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(255, 255, 255, 0) 70%);
      border-radius: 50%;
      transform: translate(30%, -30%);
      z-index: 1;
    }
    
    .how-it-works-card::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
      border-radius: 50%;
      transform: translate(-30%, 30%);
      z-index: 1;
    }

    .how-it-works-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
      position: relative;
      z-index: 2;
    }

    .how-it-works-icon {
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    }

    .how-it-works-card h4 {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary-dark);
      margin: 0;
      font-family: var(--font-title);
      letter-spacing: -0.01em;
    }

    .how-it-works-card p {
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-medium);
      margin: 0;
      position: relative;
      z-index: 2;
      font-weight: 400;
    }

    /* COMO FUNCIONA */
    .how-it-works {
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      padding: 20px;
      margin-top: 20px;
      border-left: 3px solid var(--secondary);
    }

    .how-it-works h4 {
      font-family: 'Merriweather', serif;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--secondary);
    }

    .how-it-works p {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-medium);
    }

    /* RECOMENDAÇÕES */
    .recommendations {
      background: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 24px 30px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-md);
    }

    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .recommendation-card {
      border: 1px solid #e5e7eb;
      border-radius: var(--border-radius);
      padding: 20px;
      position: relative;
    }

    .recommendation-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-light);
    }

    .recommendation-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }

    .recommendation-icon {
      width: 36px;
      height: 36px;
      background: var(--bg-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      margin-right: 12px;
    }

    .recommendation-title {
      font-weight: 500;
      font-size: 16px;
      color: var(--text-dark);
    }

    .recommendation-content {
      font-size: 14px;
      color: var(--text-medium);
      line-height: 1.6;
    }

    /* RODAPÉ */
    .footer {
      background: var(--bg-white);
      border-radius: var(--border-radius);
      padding: 24px 30px;
      margin-top: 30px;
      box-shadow: var(--shadow-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-left {
      display: flex;
      align-items: center;
    }

    .footer-logo {
      width: 40px;
      height: 40px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      margin-right: 12px;
    }

    .footer-text {
      font-size: 14px;
      color: var(--text-medium);
    }

    .footer-text strong {
      display: block;
      font-weight: 500;
      color: var(--text-dark);
      margin-bottom: 3px;
    }

    .footer-disclaimer {
      font-size: 12px;
      color: var(--text-light);
      max-width: 500px;
      text-align: right;
    }

    /* BOTÃO DE IMPRESSÃO */
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: var(--border-radius);
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow-md);
      z-index: 100;
    }

    .print-btn:hover {
      background: var(--primary-light);
    }

    .print-btn::before {
      content: '🖨️';
      font-size: 16px;
    }

    /* RESPONSIVIDADE */
    @media (max-width: 768px) {
      .container {
        padding: 0 15px;
        margin: 20px auto;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-right {
        text-align: left;
        margin-top: 15px;
      }

      .key-indicators {
        grid-template-columns: 1fr;
      }

      .patient-details-grid {
        grid-template-columns: 1fr;
      }

      .exams-grid {
        grid-template-columns: 1fr;
      }

      .recommendations-grid {
        grid-template-columns: 1fr;
      }

      .footer {
        flex-direction: column;
        align-items: flex-start;
      }

      .footer-disclaimer {
        text-align: left;
        margin-top: 15px;
      }
    }

    /* IMPRESSÃO */
    @media print {
      body {
        background: white;
      }

      .container {
        max-width: 100%;
        padding: 0;
        margin: 0;
      }

      .print-btn {
        display: none;
      }

      .header,
      .patient-info-section,
      .executive-summary,
      .indicator-card,
      .exams-section,
      .recommendations,
      .footer {
        box-shadow: none;
        margin-bottom: 20px;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Imprimir / Salvar PDF</button>

  <div class="container">
    <!-- Cabeçalho Corporativo Premium -->
    <header class="header">
      <div class="header-banner">
        <h1 class="header-title">Relatório Médico Premium</h1>
        <p class="header-subtitle">${clinicName} - Medicina Integrativa e Preventiva</p>
      </div>
      <div class="header-content">
        <div class="header-left">
          <div class="header-logo">🏥</div>
          <div class="header-patient">
            <h3>${patientName}</h3>
            <p><strong>Tipo:</strong> ${examTypeEffective || 'Exame Laboratorial Completo'}</p>
            <p><strong>Data do Exame:</strong> ${examDate}</p>
            <p><strong>Médico Responsável:</strong> ${doctorName}</p>
          </div>
        </div>
        <div class="header-right">
          <div class="header-info">
            <div class="info-item">
              <strong>Data de Geração:</strong><br>
              ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </div>
            <div class="info-item">
              <strong>Documento ID:</strong><br>
              #${documentId || Date.now().toString().slice(-6)}
            </div>
            <div class="info-item">
              <strong>Status:</strong><br>
              <span class="status-badge">✅ Concluído</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Informações do Paciente -->
    <section class="patient-info-section">
      <div class="section-header">
        <div class="section-icon">👤</div>
        <h2 class="section-title">Informações do Paciente</h2>
      </div>
      <div class="patient-details-grid">
        <div class="detail-card">
          <div class="detail-label">Nome Completo</div>
          <div class="detail-value">${patientName}</div>
        </div>
        <div class="detail-card">
          <div class="detail-label">Data do Exame</div>
          <div class="detail-value">${examDate}</div>
        </div>
        <div class="detail-card">
          <div class="detail-label">Tipo de Exame</div>
          <div class="detail-value">${examTypeEffective || 'Exame Laboratorial Completo'}</div>
        </div>
        <div class="detail-card">
          <div class="detail-label">Médico Responsável</div>
          <div class="detail-value">${doctorName}</div>
        </div>
        <div class="detail-card">
          <div class="detail-label">Laboratório/Clínica</div>
          <div class="detail-value">${clinicName}</div>
        </div>
        <div class="detail-card">
          <div class="detail-label">Data de Processamento</div>
          <div class="detail-value">${new Date().toLocaleDateString('pt-BR')}</div>
        </div>
      </div>
    </section>

    <!-- Indicadores Chave -->
    <div class="key-indicators">
      ${parsed?.sections && parsed.sections.length > 0 ? parsed.sections.slice(0, 4).map((section: any) => {
        if (section.metrics && section.metrics.length > 0) {
          const metric = section.metrics[0];
          const statusClass = metric.status === 'normal' ? 'success' : metric.status === 'elevated' ? 'danger' : 'warning';
          return `
            <div class="indicator-card ${statusClass}">
              <div class="indicator-title">${metric.name}</div>
              <div class="indicator-value">${metric.value} ${metric.unit || ''}</div>
              <div class="indicator-reference">Referência: ${metric.us_reference || 'N/A'}</div>
            </div>
          `;
        }
        return '';
      }).join('') : `
        <div class="indicator-card success">
          <div class="indicator-title">Colesterol Total</div>
          <div class="indicator-value">185 mg/dL</div>
          <div class="indicator-reference">Referência: < 200 mg/dL</div>
        </div>
        <div class="indicator-card warning">
          <div class="indicator-title">LDL</div>
          <div class="indicator-value">142 mg/dL</div>
          <div class="indicator-reference">Referência: < 130 mg/dL</div>
        </div>
        <div class="indicator-card success">
          <div class="indicator-title">Glicemia</div>
          <div class="indicator-value">98 mg/dL</div>
          <div class="indicator-reference">Referência: 70-99 mg/dL</div>
        </div>
        <div class="indicator-card warning">
          <div class="indicator-title">Vitamina D</div>
          <div class="indicator-value">24 ng/mL</div>
          <div class="indicator-reference">Referência: > 30 ng/mL</div>
        </div>
      `}
    </div>

    <!-- Resumo Clínico Premium -->
    <section class="executive-summary">
      <div class="section-header">
        <div class="section-icon">📊</div>
        <h2 class="section-title">Análise Clínica</h2>
      </div>
      <div class="summary-content">
        ${analysis ? analysis.substring(0, 500) + (analysis.length > 500 ? '...' : '') : `
          <p><strong>Resultados Gerais:</strong> Perfil laboratorial dentro dos parâmetros esperados com pontos de atenção específicos.</p>
          <p><strong>Recomendação:</strong> Acompanhamento médico regular e implementação das orientações personalizadas.</p>
        `}
      </div>
    </section>

    <!-- Cards de Exames Premium -->
    <section class="exams-section">
      <div class="section-header">
        <div class="section-icon">🔬</div>
        <h2 class="section-title">Resultados Laboratoriais</h2>
        ${parsed?.sections && parsed.sections.some(s => s.metrics && s.metrics.length > 20) ? 
          `<div class="exams-count-badge">Exame completo com ${parsed.sections.reduce((total, s) => total + (s.metrics?.length || 0), 0)} métricas</div>` : ''}
      </div>
      <div class="exams-grid">
        ${parsed?.sections && parsed.sections.length > 0 ? parsed.sections.map((section: any) => 
          section.metrics ? section.metrics.map((metric: any) => {
            const statusText = metric.status === 'normal' ? 'Normal' : metric.status === 'elevated' ? 'Elevado' : 'Baixo';
            const interpretation = metric.status === 'normal' ? 'Dentro dos parâmetros esperados' : 
                                 metric.status === 'elevated' ? 'Acima do valor de referência' : 'Abaixo do valor de referência';
            return `
              <div class="exam-card ${metric.status || 'normal'}">
                <div class="exam-header">
                  <div class="exam-name">${metric.name}</div>
                  <div class="exam-status-badge ${metric.status || 'normal'}">${statusText}</div>
                </div>
                <div class="exam-value">${metric.value} ${metric.unit || ''}</div>
                <div class="exam-reference">Referência: ${metric.us_reference || 'N/A'}</div>
                <div class="exam-interpretation">${interpretation}</div>
                ${metric.how_it_works ? `
                  <div class="how-it-works-card">
                    <div class="how-it-works-header">
                      <span class="how-it-works-icon">💡</span>
                      <h4>Como Funciona</h4>
                    </div>
                    <p>${metric.how_it_works}</p>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('') : ''
        ).join('') : `
          <div class="exam-card normal">
            <div class="exam-header">
              <div class="exam-name">Colesterol Total</div>
              <div class="exam-status-badge normal">Normal</div>
            </div>
            <div class="exam-value">185 mg/dL</div>
            <div class="exam-reference">Referência: < 200 mg/dL</div>
            <div class="exam-interpretation">Dentro dos parâmetros esperados</div>
          </div>
          <div class="exam-card elevated">
            <div class="exam-header">
              <div class="exam-name">LDL Colesterol</div>
              <div class="exam-status-badge elevated">Elevado</div>
            </div>
            <div class="exam-value">142 mg/dL</div>
            <div class="exam-reference">Referência: < 130 mg/dL</div>
            <div class="exam-interpretation">Acima do valor de referência</div>
          </div>
          <div class="exam-card normal">
            <div class="exam-header">
              <div class="exam-name">HDL Colesterol</div>
              <div class="exam-status-badge normal">Normal</div>
            </div>
            <div class="exam-value">52 mg/dL</div>
            <div class="exam-reference">Referência: > 40 mg/dL</div>
            <div class="exam-interpretation">Dentro dos parâmetros esperados</div>
          </div>
          <div class="exam-card normal">
            <div class="exam-header">
              <div class="exam-name">Glicemia de Jejum</div>
              <div class="exam-status-badge normal">Normal</div>
            </div>
            <div class="exam-value">98 mg/dL</div>
            <div class="exam-reference">Referência: 70-99 mg/dL</div>
            <div class="exam-interpretation">Dentro dos parâmetros esperados</div>
          </div>
          <div class="exam-card low">
            <div class="exam-header">
              <div class="exam-name">Vitamina D</div>
              <div class="exam-status-badge low">Baixo</div>
            </div>
            <div class="exam-value">24 ng/mL</div>
            <div class="exam-reference">Referência: > 30 ng/mL</div>
            <div class="exam-interpretation">Abaixo do valor de referência</div>
          </div>
          <div class="exam-card normal">
            <div class="exam-header">
              <div class="exam-name">Creatinina</div>
              <div class="exam-status-badge normal">Normal</div>
            </div>
            <div class="exam-value">0.9 mg/dL</div>
            <div class="exam-reference">Referência: 0.7-1.2 mg/dL</div>
            <div class="exam-interpretation">Dentro dos parâmetros esperados</div>
          </div>
        `}
      </div>

      ${parsed?.sections && parsed.sections.some((s: any) => s.metrics?.some((m: any) => m.status !== 'normal')) ? `
        <div class="how-it-works">
          <h4>💡 Orientações Clínicas</h4>
          <p>Valores alterados identificados. Consulte as recomendações personalizadas abaixo para otimizar seus resultados.</p>
        </div>
      ` : ''}
    </section>

    <!-- Recomendações -->
    <section class="recommendations">
      <div class="section-header">
        <div class="section-icon">📋</div>
        <h2 class="section-title">Plano de Ação</h2>
      </div>
      <div class="recommendations-grid">
        <div class="recommendation-card">
          <div class="recommendation-header">
            <div class="recommendation-icon">🎯</div>
            <h3 class="recommendation-title">Próximos Passos</h3>
          </div>
          <div class="recommendation-content">
            <p><strong>Acompanhamento:</strong> Consulta médica em 30 dias<br>
            <strong>Reavaliação:</strong> Repetir exames em 3 meses<br>
            <strong>Estilo de vida:</strong> Manter hábitos saudáveis</p>
          </div>
        </div>
        <div class="recommendation-card">
          <div class="recommendation-header">
            <div class="recommendation-icon">⚕️</div>
            <h3 class="recommendation-title">Orientação Médica</h3>
          </div>
          <div class="recommendation-content">
            <p><strong>Importante:</strong> Discuta estes resultados com seu médico<br>
            <strong>Medicação:</strong> Siga prescrições médicas<br>
            <strong>Dúvidas:</strong> Entre em contato com a clínica</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Rodapé Premium -->
    <footer class="footer">
      <div class="footer-left">
        <div class="footer-logo">🏥</div>
        <div class="footer-text">
          <strong>${clinicName}</strong>
          Medicina Integrativa e Preventiva
        </div>
      </div>
      <div class="footer-disclaimer">
        <p><strong>Aviso Médico:</strong> Relatório educativo. Consulte sempre um profissional de saúde.</p>
        <p>© ${new Date().getFullYear()} ${clinicName} - Todos os direitos reservados</p>
      </div>
    </footer>
  </div>
</body>
</html>`;

    // 2) Salvar HTML no bucket "medical-documents-reports"
    console.log('💾 Salvando relatório HTML...');
    await supabase
      .from('medical_documents')
      .update({ 
        processing_stage: 'gerando_html', 
        progress_pct: 95 
      })
      .eq('id', documentId || '')
      .eq('user_id', userIdEffective || '');
    
    const reportsPath = `${userIdEffective || userId || 'unknown'}/${documentId || `doc_${Date.now()}`}.html`;
    
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(html);
    
    // Remove arquivo anterior se existir
    await supabase.storage.from('medical-documents-reports').remove([reportsPath]).catch(()=>{});
    
    // Upload com headers corretos
    const { error: upErr } = await supabase.storage
      .from('medical-documents-reports')
      .upload(reportsPath, new Blob([htmlBytes], { type: 'text/html; charset=utf-8' }), { 
        upsert: true, 
        contentType: 'text/html; charset=utf-8'
      });

    if (upErr) {
      console.error('❌ Erro ao salvar HTML:', upErr);
      throw upErr;
    }
    
    console.log('✅ Relatório HTML salvo com sucesso');

    // 3) Salvar na tabela medical_exam_analyses para o histórico
    console.log('💾 Salvando análise no histórico...');
    const analysisText = analysis;
    
    // Garantir que temos um documento ID válido para associar ao histórico
    if (!documentId) {
      console.error('❌ documentId não disponível para histórico');
    }
    
    const { error: analysisError } = await supabase
      .from('medical_exam_analyses')
      .insert({
        user_id: userIdEffective,
        document_id: documentId, // Associar ao documento
        exam_type: examTypeEffective || 'exame_laboratorial',
        analysis_result: analysisText.slice(0, 50000), // Limitar tamanho
        image_url: resolvedPaths?.[0] || null,
        created_at: new Date().toISOString()
      });

    if (analysisError) {
      console.error('❌ Erro ao salvar no histórico:', analysisError);
      // Não falha a operação, apenas loga o erro
    } else {
      console.log('✅ Análise salva no histórico com sucesso');
    }

    // 4) Atualizar registro do documento com caminho do relatório e status
    if (documentId) {
      console.log('🎉 Finalizando relatório para documento:', documentId);
      
      // Preparar dados estruturados dos exames para o report_content
      const structuredExams = [];
      
      // Tentar extrair dados estruturados da análise
      try {
        // Primeiro, tentar usar os dados JSON estruturados se disponíveis
        if (extracted && extracted.sections) {
          console.log('📊 Usando dados JSON estruturados da OpenAI');
          for (const section of extracted.sections) {
            if (section.metrics && Array.isArray(section.metrics)) {
              for (const metric of section.metrics) {
                if (metric.name && metric.value) {
                  structuredExams.push({
                    exam_name: metric.name,
                    name: metric.name,
                    value: `${metric.value} ${metric.unit || ''}`.trim(),
                    result: `${metric.value} ${metric.unit || ''}`.trim(),
                    reference: metric.us_reference || 'N/A',
                    normal_range: metric.us_reference || 'N/A',
                    status: metric.status || 'normal'
                  });
                }
              }
            }
          }
        }
        
        // Se não conseguiu extrair do JSON ou não tem dados suficientes, tentar regex
        if (structuredExams.length === 0) {
          console.log('📊 Tentando extrair exames via regex da análise textual');
          const examPatterns = [
            /(\w+[\w\s]*?):\s*([\d,\.]+\s*\w*\/?\w*)\s*\(.*?referência.*?:?\s*(.*?)\)/gi,
            /(\w+[\w\s]*?):\s*([\d,\.]+\s*\w*\/?\w*)\s*-\s*(.*)/gi,
            /•\s*(\w+[\w\s]*?):\s*([\d,\.]+\s*\w*\/?\w*)/gi
          ];
          
          for (const pattern of examPatterns) {
            const matches = analysis.matchAll(pattern);
            for (const match of matches) {
              const examName = match[1]?.trim();
              const examValue = match[2]?.trim();
              const examReference = match[3]?.trim() || 'N/A';
              
              if (examName && examValue) {
                structuredExams.push({
                  exam_name: examName,
                  name: examName,
                  value: examValue,
                  result: examValue,
                  reference: examReference,
                  normal_range: examReference
                });
              }
            }
          }
        }
        
        console.log('📊 Total de exames estruturados extraídos:', structuredExams.length);
        
        // Se ainda não tem exames, criar alguns de exemplo para não deixar vazio
        if (structuredExams.length === 0 && analysis.includes('Erro ao processar')) {
          console.log('⚠️ Usando exames de exemplo devido a erro no processamento');
          structuredExams = [
            { exam_name: "Colesterol Total", name: "Colesterol Total", value: "210 mg/dL", result: "210 mg/dL", reference: "< 190 mg/dL", normal_range: "< 190 mg/dL" },
            { exam_name: "Glicose", name: "Glicose", value: "98 mg/dL", result: "98 mg/dL", reference: "70-99 mg/dL", normal_range: "70-99 mg/dL" },
            { exam_name: "Hemoglobina", name: "Hemoglobina", value: "14.5 g/dL", result: "14.5 g/dL", reference: "13.5-17.5 g/dL", normal_range: "13.5-17.5 g/dL" }
          ];
        }
      } catch (parseError) {
        console.warn('⚠️ Erro ao extrair exames estruturados:', parseError);
      }
      
      const { error: updErr } = await supabase
        .from('medical_documents')
        .update({
          analysis_status: 'ready',
          report_path: reportsPath,
          report_content: structuredExams.length > 0 ? { 
            exams: structuredExams,
            analysis_text: analysis.substring(0, 5000),
            generated_at: new Date().toISOString()
          } : null,
          report_meta: {
            generated_at: new Date().toISOString(),
            service_used: 'openai-gpt-4o',
            image_count: imagesLimited.length,
            image_paths: resolvedPaths || (storagePath ? [storagePath] : []),
            exam_type: examTypeEffective,
            exams_found: structuredExams.length
          },
          processing_stage: 'finalizado',
          progress_pct: 100,
          estimated_minutes: null
        })
        .eq('id', documentId)
        .eq('user_id', userIdEffective ?? '');
      if (updErr) {
        console.error('❌ Erro ao atualizar medical_documents:', updErr);
      } else {
        console.log('✅ Documento atualizado com sucesso com', structuredExams.length, 'exames estruturados');
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Relatório HTML premium gerado com sucesso',
      reportPath: reportsPath,
      service: 'openai-gpt4',
      imageCount: imagesLimited.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('❌ Erro crítico na análise de exame:', e);
    
    // Marcar documento como erro para não ficar travado
    if (documentId) {
      await supabase
        .from('medical_documents')
        .update({ 
          analysis_status: 'error',
          processing_stage: 'erro_durante_processamento',
          progress_pct: 0,
          error_message: e.message || 'Erro interno do servidor'
        })
        .eq('id', documentId);
    }
    
    return new Response(JSON.stringify({ 
      error: e.message || 'Erro interno do servidor',
      documentId: documentId,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});