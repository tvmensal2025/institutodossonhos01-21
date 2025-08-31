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

    // Modelo premium: GPT-5 (análise avançada e precisa)
    const config = {
      service: 'openai' as const,
      model: 'gpt-5',
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

    const { imageData, storagePath, storagePaths, images, examType, userId, documentId: docId } = await req.json();
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
    
    if (!examTypeEffective) {
      throw new Error('examType é obrigatório');
    }
    
    console.log('📋 Dados recebidos:');
    console.log('- documentId:', documentId);
    console.log('- userId:', userIdEffective);
    console.log('- examType:', examTypeEffective);
    console.log('- images (array):', images?.length || 0, 'caminhos');
    console.log('- storagePaths:', storagePaths?.length || 0, 'imagens');
    
    // Verificar se documento existe e está em processamento
    if (documentId) {
      const { data: docCheck } = await supabase
        .from('medical_documents')
        .select('id, analysis_status, processing_started_at')
        .eq('id', documentId)
        .single();
      
      if (!docCheck) {
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

ANALOGIA DIDÁTICA - CORPO COMO CASA:
Use sempre a analogia do corpo como uma casa para explicar os resultados:
- Coração = Central elétrica da casa
- Fígado = Sistema de filtros e limpeza
- Rins = Sistema de esgoto
- Sangue = Tubulação de água
- Pulmões = Sistema de ventilação
- Cérebro = Central de comando
- Ossos = Estrutura da casa
- Músculos = Sistema de sustentação
- Sistema imunológico = Segurança da casa
- Metabolismo = Consumo de energia da casa

EXPLICAÇÕES DETALHADAS E ESPECÍFICAS:
- Explique O QUE cada exame mede especificamente
- Explique POR QUE é importante para a saúde
- Use analogias da casa de forma específica para cada exame
- Dê contexto sobre o que o valor significa na prática
- Inclua informações sobre o que pode causar alterações
- Sugira ações específicas que o paciente pode tomar
- Seja informativo mas mantenha linguagem acessível
- Evite explicações genéricas - seja específico para cada exame

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

    const toBase64 = async (blob: Blob, fallbackMime?: string) => {
      const arr = await blob.arrayBuffer();
      const mt = (blob.type && blob.type !== 'application/octet-stream') ? blob.type : (fallbackMime || 'image/jpeg');
      const bytes = new Uint8Array(arr);
      const chunkSize = 0x8000; // 32KB por chunk para evitar stack overflow
      let binary = '';
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);
      return { mime: mt, data: `data:${mt};base64,${base64}` };
    };

    // Resolver paths de imagens a partir do corpo ou do documento no banco
    let resolvedPaths: string[] | undefined = Array.isArray(images) && images.length > 0 ? images : (Array.isArray(storagePaths) && storagePaths.length > 0 ? storagePaths : undefined);

    if (!resolvedPaths && documentId) {
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
      }
    }

    // Limita número de imagens para payload confiável
    const MAX_IMAGES = 6; // alinhado com o relatório premium para reduzir latência

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
      
      const toDownload = resolvedPaths;
      let processed = 0;
      
      for (const p of toDownload) {
        console.log(`📥 Baixando imagem ${processed + 1}/${toDownload.length}: ${p}`);
        console.log(`⏱️ Iniciando download com timeout de 30s...`);
        
        let retryCount = 0;
        const maxRetries = 2;
        let success = false;
        
        while (retryCount <= maxRetries && !success) {
          try {
            console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries + 1} para: ${p}`);
            
            // Timeout de 30 segundos para cada download
            const downloadPromise = supabase.storage.from('medical-documents').download(p);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout no download da imagem')), 30000)
            );
            
            const { data: dl, error: dlErr } = await Promise.race([downloadPromise, timeoutPromise]) as any;
          
            if (dlErr) {
              console.error('❌ Erro ao baixar imagem:', p, dlErr);
              retryCount++;
              if (retryCount <= maxRetries) {
                console.log(`🔄 Tentando novamente em 2 segundos...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
              } else {
                console.warn('⚠️ Máximo de tentativas atingido, pulando imagem...');
                processed += 1;
                break;
              }
            }
            
            if (!dl) {
              console.error('❌ Download retornou dados vazios para:', p);
              retryCount++;
              if (retryCount <= maxRetries) {
                console.log(`🔄 Tentando novamente em 2 segundos...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
              } else {
                processed += 1;
                break;
              }
            }
            
            console.log(`🔄 Convertendo imagem para base64: ${p}`);
            const base64Image = await toBase64(dl as Blob, guessMimeFromPath(p));
            images.push(base64Image);
            processed += 1;
            success = true;
            
            // Progresso mais granular: 5% a 75% durante download
            const pct = Math.min(75, Math.round((processed / toDownload.length) * 70) + 5);
            
            console.log(`✅ Imagem ${processed}/${toDownload.length} processada. Progresso: ${pct}%`);
            
            await supabase
              .from('medical_documents')
              .update({ 
                images_processed: processed, 
                progress_pct: pct,
                processing_stage: `baixando_imagens (${processed}/${toDownload.length})`
              })
              .eq('id', documentId || '')
              .eq('user_id', userIdEffective || '');
              
          } catch (error) {
            console.error('❌ Erro crítico no download da imagem:', p, error);
            retryCount++;
            if (retryCount <= maxRetries) {
              console.log(`🔄 Tentando novamente em 2 segundos...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
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
      // Função para chamar OpenAI com fallback robusto
      const callOpenAI = async (model: string) => {
        const body = {
          model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              ...imagesLimited.map(img => ({
                type: 'image_url',
                image_url: { url: img.data, detail: 'high' }
              }))
            ]
          }],
          temperature: 0.2,
          max_completion_tokens: 4500
        } as any;
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json?.error?.message || 'OpenAI error');
        return json;
      };

      let usedModel = 'o4-mini-2025-04-16';
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
          usedModel = 'gpt-4.1-2025-04-14'; 
          aiResponse = await callOpenAI(usedModel); 
          console.log('✅ Fallback 1 funcionou');
        }
        catch (e2) {
          console.log('⚠️ Fallback para último modelo:', e2);
          usedModel = 'gpt-4o'; 
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
    const analysisText = typeof aiResponse === 'string' ? aiResponse : (aiResponse?.choices?.[0]?.message?.content || analysis);
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
            service_used: 'openai-o4-mini',
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