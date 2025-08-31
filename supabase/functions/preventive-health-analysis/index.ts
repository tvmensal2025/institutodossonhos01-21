import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { userId, analysisType = 'quinzenal' } = await req.json();

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🔮 Iniciando análise preventiva ${analysisType} para usuário ${userId}`);

    // Calcular período de análise
    const now = new Date();
    let startDate: Date;
    let periodDescription: string;

    if (analysisType === 'quinzenal') {
      startDate = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)); // 15 dias
      periodDescription = 'últimas 2 semanas';
    } else { // mensal
      startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 dias
      periodDescription = 'último mês';
    }

    // Buscar dados de saúde do período
    const [
      { data: profile },
      { data: measurements },
      { data: missions },
      { data: healthDiary },
      { data: insights },
      { data: physicalData }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('weight_measurements').select('*').eq('user_id', userId)
        .gte('measurement_date', startDate.toISOString().split('T')[0])
        .order('measurement_date', { ascending: true }),
      supabase.from('daily_mission_sessions').select('*').eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true }),
      supabase.from('health_diary').select('*').eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true }),
      supabase.from('weekly_chat_insights').select('*').eq('user_id', userId)
        .gte('week_start_date', startDate.toISOString().split('T')[0])
        .order('week_start_date', { ascending: true }),
      supabase.from('user_physical_data').select('*').eq('user_id', userId).single()
    ]);

    // Buscar configuração de IA para análise preventiva
    const { data: aiConfig } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('functionality', 'preventive_analysis')
      .single();

    // Preparar dados para análise
    const userName = profile?.full_name || 'Usuário';
    const latestWeight = measurements?.[measurements.length - 1];
    const firstWeight = measurements?.[0];
    const completedMissions = missions?.filter(m => m.is_completed).length || 0;
    const totalMissions = missions?.length || 0;
    const avgMood = healthDiary?.reduce((sum, entry) => sum + (entry.mood_rating || 5), 0) / (healthDiary?.length || 1);
    const avgEnergy = healthDiary?.reduce((sum, entry) => sum + (entry.energy_level || 5), 0) / (healthDiary?.length || 1);
    const exerciseDays = healthDiary?.filter(entry => (entry.exercise_minutes || 0) > 0).length || 0;
    const avgSleep = healthDiary?.reduce((sum, entry) => sum + (entry.sleep_hours || 7), 0) / (healthDiary?.length || 1);
    
    // Calcular tendências
    const weightTrend = latestWeight && firstWeight ? 
      ((latestWeight.peso_kg - firstWeight.peso_kg) / firstWeight.peso_kg * 100).toFixed(1) : null;
    
    const missionCompliance = totalMissions > 0 ? 
      ((completedMissions / totalMissions) * 100).toFixed(1) : '0';

    // Analisar riscos de saúde
    const healthRisks = [];
    const positivePoints = [];
    const urgentWarnings = [];

    // Análise de IMC
    if (latestWeight?.imc) {
      if (latestWeight.imc < 18.5) {
        healthRisks.push('IMC abaixo do normal - possível desnutrição');
        urgentWarnings.push('ATENÇÃO: Peso muito baixo pode causar deficiências nutricionais graves');
      } else if (latestWeight.imc > 30) {
        healthRisks.push('Obesidade - alto risco cardiovascular');
        urgentWarnings.push('ALERTA: Obesidade aumenta drasticamente o risco de diabetes, hipertensão e problemas cardíacos');
      } else if (latestWeight.imc > 25) {
        healthRisks.push('Sobrepeso - risco cardiovascular moderado');
      } else {
        positivePoints.push('IMC dentro da faixa saudável');
      }
    }

    // Análise de tendência de peso
    if (weightTrend) {
      const trend = parseFloat(weightTrend);
      if (Math.abs(trend) > 5) {
        if (trend > 0) {
          urgentWarnings.push(`ATENÇÃO: Ganho de peso de ${weightTrend}% em ${periodDescription} é preocupante`);
        } else {
          urgentWarnings.push(`ATENÇÃO: Perda de peso de ${Math.abs(trend)}% em ${periodDescription} pode ser excessiva`);
        }
      }
    }

    // Análise de atividade física
    if (exerciseDays < 3) {
      healthRisks.push('Sedentarismo - menos de 3 dias de exercício por semana');
      if (exerciseDays === 0) {
        urgentWarnings.push('CRÍTICO: Falta total de atividade física aumenta risco de doenças em 50%');
      }
    } else if (exerciseDays >= 5) {
      positivePoints.push('Excelente rotina de exercícios');
    }

    // Análise de sono
    if (avgSleep < 6) {
      healthRisks.push('Sono insuficiente crônico');
      urgentWarnings.push('ALERTA: Menos de 6h de sono aumenta risco de diabetes, depressão e morte prematura');
    } else if (avgSleep >= 7 && avgSleep <= 9) {
      positivePoints.push('Qualidade de sono adequada');
    }

    // Análise de humor
    if (avgMood < 3) {
      healthRisks.push('Humor constantemente baixo - possível depressão');
      urgentWarnings.push('ATENÇÃO: Humor persistentemente baixo pode indicar depressão clínica');
    }

    // Análise de energia
    if (avgEnergy < 3) {
      healthRisks.push('Fadiga crônica - possível problema de saúde');
    }

    // Análise de adesão às missões
    const compliance = parseFloat(missionCompliance);
    if (compliance < 30) {
      healthRisks.push('Baixa adesão ao programa de saúde');
      urgentWarnings.push('CRÍTICO: Baixa adesão às orientações compromete seriamente os resultados');
    } else if (compliance > 80) {
      positivePoints.push('Excelente comprometimento com o programa');
    }

    // Prompt para Dr. Vital com personalidade médica séria
    const drVitalPrompt = `Você é Dr. Vital - Médico Especialista em Medicina Preventiva do Instituto dos Sonhos.

PERSONALIDADE: Médico experiente, direto, preocupado com a saúde real do paciente. Você fala a VERDADE sobre os riscos, mesmo que seja desconfortável. Você tem anos de experiência vendo as consequências de negligenciar a saúde.

DADOS DO PACIENTE (${periodDescription}):
- Nome: ${userName}
- IMC atual: ${latestWeight?.imc || 'Não informado'}
- Tendência de peso: ${weightTrend ? `${weightTrend}%` : 'Sem dados suficientes'}
- Exercício: ${exerciseDays} dias em ${periodDescription}
- Sono médio: ${avgSleep.toFixed(1)} horas/noite
- Humor médio: ${avgMood.toFixed(1)}/10
- Energia média: ${avgEnergy.toFixed(1)}/10
- Adesão ao programa: ${missionCompliance}%

RISCOS IDENTIFICADOS:
${healthRisks.map(risk => `- ${risk}`).join('\n')}

PONTOS POSITIVOS:
${positivePoints.map(point => `- ${point}`).join('\n')}

ALERTAS URGENTES:
${urgentWarnings.map(warning => `- ${warning}`).join('\n')}

INSTRUÇÕES CRÍTICAS:
1. Seja DIRETO sobre os riscos reais à saúde
2. Use dados científicos e estatísticas quando relevante
3. Se houver riscos graves, mencione as consequências reais (diabetes, infarto, AVC, etc.)
4. SEMPRE termine direcionando para Rafael ou Sirlene
5. Use tom médico profissional, mas humano
6. Se há urgências, deixe claro que são CRÍTICAS
7. Máximo 400 palavras

EXEMPLO DE TOM:
"Com base nos dados analisados, preciso ser franco: sua situação atual apresenta riscos que não podem ser ignorados..."

SEMPRE TERMINE COM:
"Recomendo URGENTEMENTE que agende uma consulta com Rafael ou Sirlene do Instituto dos Sonhos. Eles têm a expertise necessária para um plano personalizado que pode literalmente salvar sua vida."

Gere a análise preventiva completa agora:`;

    // Chamar OpenAI API
    const requestedModel = aiConfig?.model || 'gpt-4o'
    const effectiveModel = /o3/i.test(requestedModel) ? 'gpt-4o' : requestedModel

    // Monta payload com parâmetro de tokens compatível com modelos mais novos (o4/4.1)
    const max = aiConfig?.max_tokens ?? 3000
    const payload: any = {
      model: effectiveModel,
      messages: [
        { role: 'system', content: drVitalPrompt },
        {
          role: 'user',
          content: `Analise os dados de saúde de ${userName} para o período de ${periodDescription} e forneça uma análise preventiva completa.`
        }
      ],
      temperature: aiConfig?.temperature ?? 0.3
    }
    if (/(o4|4\.1)/i.test(effectiveModel)) {
      payload.max_completion_tokens = max
    } else {
      payload.max_tokens = max
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const drVitalAnalysis = openAIData.choices[0].message.content;

    // Calcular score de risco geral (0-100)
    let riskScore = 0;
    riskScore += healthRisks.length * 15;
    riskScore += urgentWarnings.length * 25;
    riskScore = Math.min(riskScore, 100);

    const riskLevel = riskScore > 75 ? 'CRÍTICO' : 
                     riskScore > 50 ? 'ALTO' : 
                     riskScore > 25 ? 'MODERADO' : 'BAIXO';

    // Salvar análise no banco
    const analysisData = {
      user_id: userId,
      analysis_type: analysisType,
      analysis_date: now.toISOString(),
      period_start: startDate.toISOString(),
      period_end: now.toISOString(),
      dr_vital_analysis: drVitalAnalysis,
      risk_score: riskScore,
      risk_level: riskLevel,
      health_risks: healthRisks,
      positive_points: positivePoints,
      urgent_warnings: urgentWarnings,
      metrics: {
        weight_trend: weightTrend,
        mission_compliance: missionCompliance,
        exercise_days: exerciseDays,
        avg_sleep: avgSleep,
        avg_mood: avgMood,
        avg_energy: avgEnergy,
        measurements_count: measurements?.length || 0
      }
    };

    const { data: savedAnalysis, error: saveError } = await supabase
      .from('preventive_health_analyses')
      .insert(analysisData)
      .select()
      .single();

    if (saveError) {
      console.error('Erro ao salvar análise:', saveError);
      throw saveError;
    }

    console.log(`✅ Análise preventiva ${analysisType} gerada para ${userName} - Risco: ${riskLevel}`);

    // Também salvar na tabela medical_exam_analyses para o histórico unificado
    const { error: historyError } = await supabase
      .from('medical_exam_analyses')
      .insert({
        user_id: userId,
        exam_type: `analise_preventiva_${analysisType}`,
        analysis_result: drVitalAnalysis.slice(0, 50000), // Limitar tamanho
        image_url: null
      });

    if (historyError) {
      console.error('❌ Erro ao salvar no histórico unificado:', historyError);
      // Não falha a operação, apenas loga o erro
    } else {
      console.log('✅ Análise preventiva salva no histórico unificado');
    }

    return new Response(JSON.stringify({
      success: true,
      analysis_id: savedAnalysis.id,
      user_name: userName,
      analysis_type: analysisType,
      risk_level: riskLevel,
      risk_score: riskScore,
      dr_vital_analysis: drVitalAnalysis,
      metrics: analysisData.metrics,
      health_risks: healthRisks,
      positive_points: positivePoints,
      urgent_warnings: urgentWarnings
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na análise preventiva:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});