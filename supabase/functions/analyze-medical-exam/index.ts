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
    explicacao: `**Como funciona?**
O laboratório mede o colesterol total no sangue, que é a soma do que circula nas "ruas do corpo": o que é transportado por LDL/VLDL e o que é recolhido pelo HDL. É um retrato pontual do tráfego de colesterol e pode variar com alimentação, álcool, medicações e condições clínicas recentes.

**Para que serve**
• Oferece visão geral da carga de colesterol circulante.
• Ajuda a acompanhar tendência (antes/depois de mudanças).
• Permite calcular o não-HDL (Total – HDL), útil quando triglicerídeos estão altos.
• Entra em painéis de risco cardiovascular junto com as outras frações.`
  },
  
  'ldl': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao: `**Como funciona?**
Quantifica o colesterol que viaja nos "caminhões LDL", os que mais tendem a grudar nas paredes das artérias. Em alguns laudos, o LDL é medido diretamente; em outros, calculado a partir de Total, HDL e TG. Por refletir o período recente, responde a jejum/álcool, dieta e hormônios da tireoide.

**Para que serve**
• É o alvo principal para prevenir entupimento de artérias (aterosclerose).
• Define metas objetivas conforme o perfil de risco.
• Funciona como termômetro de resposta a hábitos e/ou tratamento.
• Complementa a avaliação com não-HDL e ApoB.`
  },
  
  'hdl': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao: `**Como funciona?**
Mede o colesterol no "caminhão de limpeza": partículas que retiram excesso de gordura dos tecidos e levam de volta ao fígado. Parte depende da genética, mas atividade física, peso e hábitos influenciam ao longo do tempo.

**Para que serve**
• Indica a capacidade de limpeza do sistema.
• Costuma se associar a menor risco cardiovascular.
• Ajuda a contextualizar Total e não-HDL.
• Não é um alvo terapêutico isolado (o foco permanece em LDL/não-HDL).`
  },
  
  'triglicerideos': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao: `**Como funciona?**
Dosam a "gordura de transporte" que sobe facilmente após açúcares, refeições ricas e álcool. Mesmo em jejum, os TG refletem como o corpo usa e guarda energia. Variam com resistência à insulina, gordura abdominal, medicações e tireoide.

**Para que serve**
• Mostram o impacto de carboidratos simples e álcool.
• Valores altos mantidos se associam a risco cardiovascular.
• Níveis muito altos elevam risco de pancreatite.
• Orientam foco adicional em não-HDL e ApoB.`
  },
  
  'vldl': {
    categoria: '🫀 Perfil Lipídico',
    icone: '🫀',
    explicacao: `**Como funciona?**
Avalia (muitas vezes estima) as partículas que o fígado fabrica para levar triglicerídeos aos tecidos. Caminha de perto com os TG e tende a subir/baixar junto com eles.

**Para que serve**
• Espelha o comportamento dos triglicerídeos.
• Completa o painel lipídico.
• Não é alvo direto de tratamento.`
  },
  
  // 🍬 GLICOSE & INSULINA
  'glicose': {
    categoria: '🍬 Glicose & Insulina',
    icone: '🍬',
    explicacao: `**Como funciona?**
Quantifica a glicose no sangue após 8–12 horas sem comer, oferecendo um retrato do açúcar circulante naquele momento. Pode oscilar com estresse, infecções, corticoides e quebra de jejum.

**Para que serve**
• Triagem para pré-diabetes e diabetes.
• Complementa HbA1c e OGTT na avaliação.
• Ajuda a monitorar rotina e efeitos de hábitos.
• Simples e amplamente disponível.`
  },
  
  'hba1c': {
    categoria: '🍬 Glicose & Insulina',
    icone: '🍬',
    explicacao: `**Como funciona?**
Mostra a porcentagem de hemoglobina que ficou "açucarada" ao longo de ~3 meses. Como as hemácias vivem semanas, a HbA1c funciona como média de longo prazo da glicose; pode sofrer interferência de anemias, hemoglobinopatias e transfusões.

**Para que serve**
• Avalia controle glicêmico crônico.
• Útil para acompanhar tratamento.
• Menos afetada por jejum que a glicose isolada.
• Entra em critérios diagnósticos quando indicado.`
  },
  
  'insulina': {
    categoria: '🍬 Glicose & Insulina',
    icone: '🍬',
    explicacao: `**Como funciona?**
Dosam a insulina em jejum e calculam o HOMA-IR (uma estimativa de resistência à insulina usando glicose+insulina). Refletem sinalização hormonal nas células e mudam com peso, sono, estresse, medicações e atividade física.

**Para que serve**
• Sinalizam resistência à insulina.
• Ajudam a entender síndrome metabólica e esteatose.
• Direcionam mudanças de estilo de vida.
• Podem orientar acompanhamento em conjunto com glicose/HbA1c.`
  },
  
  // 💧 FUNÇÃO RENAL
  'creatinina': {
    categoria: '💧 Função Renal',
    icone: '💧',
    explicacao: `**Como funciona?**
É um subproduto do músculo que os rins precisam filtrar. Quando a filtração diminui, a creatinina acumula no sangue. O valor também depende de massa muscular, hidratação e medicações, então é interpretado junto de outros parâmetros.

**Para que serve**
• Base para calcular a eTFG (força do filtro).
• Ajuda a monitorar função renal.
• Contribui para ajuste de doses de medicamentos.
• Contextualiza hidratação e massa muscular.`
  },
  
  'ureia': {
    categoria: '💧 Função Renal',
    icone: '💧',
    explicacao: `**Como funciona?**
Formada no fígado a partir da amônia (proteínas), a ureia é eliminada pelos rins. Costuma subir com pouca água, dieta proteica ou redução da filtração; isoladamente é menos específica que a creatinina.

**Para que serve**
• Complementa a avaliação de função e hidratação.
• Ajuda em ajuste de terapia (ex.: diuréticos).
• Útil em monitorização hospitalar e ambulatorial.
• Contextualiza sintomas (náusea, mal-estar).`
  },
  
  // 🫁 FÍGADO
  'ast': {
    categoria: '🫁 Fígado & Vias Biliares',
    icone: '🫁',
    explicacao: `**Como funciona?**
São enzimas dentro das células do fígado. Quando as células sofrem, parte delas "vaza" para o sangue e os valores sobem (gordura, álcool, vírus, remédios, esforço intenso).

**Para que serve**
• Sugerem sofrimento hepático.
• Ajudam a acompanhar evolução (melhora/piora).
• Direcionam investigações (imagens, outros exames).
• Auxiliam na segurança medicamentosa.`
  },
  
  'alt': {
    categoria: '🫁 Fígado & Vias Biliares',
    icone: '🫁',
    explicacao: `**Como funciona?**
São enzimas dentro das células do fígado. Quando as células sofrem, parte delas "vaza" para o sangue e os valores sobem (gordura, álcool, vírus, remédios, esforço intenso).

**Para que serve**
• Sugerem sofrimento hepático.
• Ajudam a acompanhar evolução (melhora/piora).
• Direcionam investigações (imagens, outros exames).
• Auxiliam na segurança medicamentosa.`
  },
  
  // 🧠 TIREOIDE
  'tsh': {
    categoria: '🧠 Tireoide',
    icone: '🧠',
    explicacao: `**Como funciona?**
O TSH é o comando da hipófise para a tireoide; T4/T3 são os hormônios que ajustam o ritmo do metabolismo. Ensaios imunoquímicos quantificam esses níveis e mostram se o "motor" está acelerado, lento ou equilibrado.

**Para que serve**
• Detecta hipo e hipertireoidismo.
• Acompanha ajustes de dose quando em uso de hormônio.
• Investiga sintomas como cansaço, perda/ganho de peso, palpitações.
• Integra check-ups e protocolos.`
  },
  
  't4_livre': {
    categoria: '🧠 Tireoide',
    icone: '🧠',
    explicacao: `**Como funciona?**
O TSH é o comando da hipófise para a tireoide; T4/T3 são os hormônios que ajustam o ritmo do metabolismo. Ensaios imunoquímicos quantificam esses níveis e mostram se o "motor" está acelerado, lento ou equilibrado.

**Para que serve**
• Detecta hipo e hipertireoidismo.
• Acompanha ajustes de dose quando em uso de hormônio.
• Investiga sintomas como cansaço, perda/ganho de peso, palpitações.
• Integra check-ups e protocolos.`
  },
  
  // 🩸 HEMATOLOGIA
  'hemoglobina': {
    categoria: '🩸 Hematologia & Nutrientes',
    icone: '🩸',
    explicacao: `**Como funciona?**
Usa contadores automatizados e, se necessário, microscopia para medir glóbulos vermelhos (oxigênio), brancos (defesa) e plaquetas (coagulação), além de índices como VCM e HCM.

**Para que serve**
• Investiga anemias.
• Ajuda a identificar infecções e inflamações.
• Avalia plaquetas (sangramento/coagulação).
• Base do check-up e do seguimento clínico.`
  },
  
  'ferritina': {
    categoria: '🩸 Hematologia & Nutrientes',
    icone: '🩸',
    explicacao: `**Como funciona?**
A ferritina indica estoque de ferro; a transferrina é o transporte; a saturação mostra quanto do transporte está ocupado; o ferro sérico é o que circula. Juntos, mapeiam estoque + trânsito + entrega.

**Para que serve**
• Diferenciam falta de ferro de outras anemias.
• Orientam reposição (dose/tempo).
• Sugerem causas (ingestão, perdas).
• Acompanham resposta ao tratamento.`
  },
  
  'vitamina_b12': {
    categoria: '🩸 Hematologia & Nutrientes',
    icone: '🩸',
    explicacao: `**Como funciona?**
Dosagens sanguíneas de vitaminas essenciais para formação de sangue e sistema nervoso. Podem variar com ingestão, absorção intestinal, álcool e medicações; às vezes pedem marcadores complementares.

**Para que serve**
• Avaliam anemias com glóbulos grandes (VCM↑).
• Ajudam a investigar formigamentos e queixas neurológicas (B12).
• Guiam suplementação e dieta.
• Monitoram resposta clínica/laboratorial.`
  },
  
  // 🌞 VITAMINAS
  'vitamina_d': {
    categoria: '🌞 Vitaminas',
    icone: '🌞',
    explicacao: `**Como funciona?**
Mede a forma de reserva da vitamina D, produzida na pele pelo sol e obtida por alimentos/suplementos. É o melhor indicador de estoque disponível para ossos e músculos.

**Para que serve**
• Avalia deficiência ou excesso.
• Direciona suplementação e reavaliação.
• Relaciona-se a saúde óssea e muscular.
• Complementa o eixo cálcio/PTH.`
  },
  
  // 🔥 INFLAMAÇÃO
  'pcr': {
    categoria: '🔥 Inflamação',
    icone: '🔥',
    explicacao: `**Como funciona?**
É uma proteína de fase aguda produzida pelo fígado. No método de alta sensibilidade, detecta inflamações discretas, úteis para entender risco cardiovascular e resposta a hábitos ao longo do tempo.

**Para que serve**
• Sinaliza inflamação de baixo grau.
• Contextualiza risco em conjunto com lipídios.
• Ajuda a monitorar estilo de vida.
• Apoia decisões em prevenção.`
  },
  
  'vhs': {
    categoria: '🔥 Inflamação',
    icone: '🔥',
    explicacao: `**Como funciona?**
Observa a velocidade com que as hemácias sedimentam num tubo padronizado. Proteínas inflamatórias alteram essa velocidade, tornando o VHS um sinal indireto de inflamação crônica.

**Para que serve**
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let documentId: string | undefined;
  let userIdEffective: string | null = null;
  
  // Inicializar Supabase (usar service role para ler configs com segurança)
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    // Modelo premium: GPT-4o (análise avançada e precisa)
    const config = {
      service: 'openai' as const,
      model: 'gpt-4o',
      max_tokens: 8000,
      temperature: 0.05,
      openai_key: OPENAI_API_KEY
    };

    console.log(`🔬 Análise médica usando: ${config.service} ${config.model} (${config.max_tokens} tokens, temp: ${config.temperature})`);
    
    if (config.service === 'gemini' && !GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY não configurada');
    }
    if (config.service === 'openai' && !OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { imageData, storagePath, storagePaths, images: inputImages, examType, userId, documentId: docId } = requestBody;
    userIdEffective = userId || null;
    documentId = docId;
    let examTypeEffective: string | null = examType || null;
    
    // Validações após definir as variáveis
    if (!documentId) {
      throw new Error('documentId é obrigatório');
    }
    
    if (!userIdEffective) {
      throw new Error('userId é obrigatório');
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

    // Prompt específico para Dr. Vital gerar dados estruturados com analogias didáticas
    let systemPrompt = `Você é o Dr. Vital, IA médica do Instituto dos Sonhos. Analise exames médicos a partir de IMAGENS e gere dados estruturados para um relatório médico preciso, clínico e DIDÁTICO.

REQUISITOS:
1) Extraia APENAS dados do exame: nome do paciente, médico, clínica, data, TODOS os valores laboratoriais.
2) Use referências AMERICANAS rigorosas para comparação.
3) Agrupe exames similares em categorias clínicas.
4) Seja preciso e objetivo - não invente dados.
5) Foque apenas nos dados laboratoriais apresentados.

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
          "us_reference": string|null
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
        const fileUrl: string | null = (docRow as any)?.file_url || null;
        const candidate: string[] = [];
        if (Array.isArray(metaPaths) && metaPaths.length) candidate.push(...metaPaths);
        if (fileUrl) candidate.push(fileUrl);
        if (candidate.length) resolvedPaths = candidate;
        console.log('🔍 Paths encontrados no banco:', {
          metaPaths: metaPaths.length,
          fileUrl: !!fileUrl,
          candidatos: candidate.length
        });
      }
    }

    // LIMITAÇÃO ULTRA-DRÁSTICA: APENAS 1 IMAGEM POR VEZ
    const MAX_IMAGES = 1; // Ultra-limitado para garantir funcionamento
    
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
      
      // LIMITAÇÃO ULTRA-DRÁSTICA: Apenas 1 imagem por vez
      const toDownload = resolvedPaths.slice(0, 1);
      if (resolvedPaths.length > 1) {
        console.log(`⚠️ LIMITAÇÃO ULTRA-DRÁSTICA: Processando apenas 1 de ${resolvedPaths.length} imagens`);
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
      await supabase
        .from('medical_documents')
        .update({ 
          processing_stage: 'analisando_com_ia', 
          progress_pct: 80 
        })
        .eq('id', documentId || '')
        .eq('user_id', userIdEffective || '');
      // Função otimizada para chamar OpenAI
      const callOpenAI = async (model: string) => {
        // OTIMIZAÇÃO: Reduzir detail das imagens para economizar tokens e tempo
        const imageDetail = imagesLimited.length > 6 ? 'low' : 'high';
        
        const body = {
          model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              ...imagesLimited.map(img => ({
                type: 'image_url',
                image_url: { url: img.data, detail: imageDetail }
              }))
            ]
          }],
          temperature: 0.2,
          max_completion_tokens: 3000, // OTIMIZAÇÃO: Reduzido de 4500 para 3000
          timeout: 45 // OTIMIZAÇÃO: Timeout explícito de 45s
        } as any;
        
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

      let usedModel = 'gpt-4o';
      let aiResponse: any;
      
      console.log('🤖 Chamando OpenAI com modelo:', usedModel);
      await supabase
        .from('medical_documents')
        .update({ 
          processing_stage: 'chamando_openai', 
          progress_pct: 85 
        })
        .eq('id', documentId || '')
        .eq('user_id', userIdEffective || '');
      
      try { 
        aiResponse = await callOpenAI(usedModel); 
        console.log('✅ OpenAI respondeu com sucesso');
      }
      catch (e) {
        console.log('⚠️ Fallback para modelo alternativo:', e);
        try { 
          usedModel = 'gpt-4o-mini'; 
          aiResponse = await callOpenAI(usedModel); 
          console.log('✅ Fallback 1 funcionou');
        }
        catch (e2) {
          console.log('⚠️ Fallback para último modelo disponível:', e2);
          usedModel = 'gpt-3.5-turbo'; 
          aiResponse = await callOpenAI(usedModel); 
          console.log('✅ Fallback 2 funcionou');
        }
      }

      const rawText = aiResponse.choices?.[0]?.message?.content || '';
      console.log('🔍 Conteúdo completo do modelo', usedModel, ':', rawText.substring(0, 1000) + '...');

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

      // Análise textual (antes do JSON)
      analysis = jsonStart > 0 ? rawText.substring(0, jsonStart).trim() : rawText;
      console.log('📝 Análise textual extraída:', analysis.substring(0, 500) + '...');

      console.log('✅ Análise gerada');
      
    } catch (error) {
      console.error('❌ Erro ao gerar análise com OpenAI:', error);
      analysis = 'Erro ao processar análise. Dados em processamento...';
    }

    // Dados estruturados
    const parsed = extracted || {};
    const patientName = (parsed.patient_name || parsed.patient || userContext.profile?.full_name || 'Paciente');
    const examDate = new Date().toLocaleDateString('pt-BR');
    
    // HTML Clínico Elegante do Dr. Vital
    const html = `<!doctype html>
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
          ${new Date().toLocaleDateString('pt-BR')}
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
      ${analysis}
      
      ${parsed?.sections && parsed.sections.length > 0 ? `
        <h2>Resultados dos Exames</h2>
        ${parsed.sections.map((section: any) => `
          <h3>${section.title}</h3>
          ${section.metrics ? section.metrics.map((metric: any) => `
            <p><strong>${metric.name}:</strong> ${metric.value} ${metric.unit || ''} 
            (${metric.status === 'normal' ? '✅ Normal' : metric.status === 'elevated' ? '⚠️ Alto' : '⚠️ Baixo'})
            ${metric.us_reference ? ` - Referência: ${metric.us_reference}` : ''}</p>
          `).join('') : ''}
        `).join('')}
      ` : ''}
      
      ${parsed?.important_findings && parsed.important_findings.length > 0 ? `
        <h2>Pontos Importantes</h2>
        <ul>
          ${parsed.important_findings.map((finding: string) => `<li>${finding}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${parsed?.conclusion ? `
        <h2>Conclusão</h2>
        <p>${parsed.conclusion}</p>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>⚠️ Aviso Importante:</strong> Este documento é educativo e não substitui consulta médica. Não faz diagnóstico nem prescrição. Consulte sempre um profissional de saúde para interpretação adequada dos resultados.</p>
      <p style="margin-top: 8px;">Relatório gerado por Dr. Vital - IA Médica do Instituto dos Sonhos</p>
      <p style="margin-top: 4px;">Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
    </div>
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
    const { error: analysisError } = await supabase
      .from('medical_exam_analyses')
      .insert({
        user_id: userIdEffective,
        exam_type: examTypeEffective || 'exame_laboratorial',
        analysis_result: analysisText.slice(0, 50000), // Limitar tamanho
        image_url: resolvedPaths?.[0] || null
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
      const { error: updErr } = await supabase
        .from('medical_documents')
        .update({
          analysis_status: 'ready',
          report_path: reportsPath,
          report_meta: {
            generated_at: new Date().toISOString(),
            service_used: 'openai-gpt-4o',
            image_count: imagesLimited.length,
            image_paths: resolvedPaths || (storagePath ? [storagePath] : []),
            exam_type: examTypeEffective
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
        console.log('✅ Documento atualizado com sucesso');
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