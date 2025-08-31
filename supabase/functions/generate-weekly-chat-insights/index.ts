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
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY não configurada');
    }

    const { userId, weekStartDate } = await req.json();

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calcular datas da semana
    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    console.log(`Gerando insights para usuário ${userId} da semana ${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}`);

    // Buscar dados emocionais da semana
    const { data: emotionalData, error: emotionalError } = await supabase
      .from('chat_emotional_analysis')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (emotionalError) {
      console.error('Erro ao buscar dados emocionais:', emotionalError);
      throw emotionalError;
    }

    // Buscar conversas da semana
    const { data: conversations, error: conversationError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (conversationError) {
      console.error('Erro ao buscar conversas:', conversationError);
      throw conversationError;
    }

    // Buscar dados complementares do usuário
    const [
      { data: profile },
      { data: measurements },
      { data: missions },
      { data: healthDiary }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('weight_measurements').select('*').eq('user_id', userId)
        .gte('measurement_date', startDate.toISOString().split('T')[0])
        .lte('measurement_date', endDate.toISOString().split('T')[0]),
      supabase.from('daily_mission_sessions').select('*').eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]),
      supabase.from('health_diary').select('*').eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
    ]);

    console.log(`Encontrados: ${emotionalData?.length || 0} análises emocionais, ${conversations?.length || 0} conversas`);

    // Calcular métricas agregadas
    const totalConversations = conversations?.length || 0;
    const averageSentiment = emotionalData?.length ? 
      emotionalData.reduce((sum, item) => sum + (item.sentiment_score || 0), 0) / emotionalData.length : 0;

    // Coletar todas as emoções
    const allEmotions = emotionalData?.flatMap(item => item.emotions_detected || []) || [];
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    const dominantEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([emotion]) => emotion);

    // Calcular médias de dores, stress e energia
    const painLevels = emotionalData?.filter(item => item.pain_level != null).map(item => item.pain_level) || [];
    const stressLevels = emotionalData?.filter(item => item.stress_level != null).map(item => item.stress_level) || [];
    const energyLevels = emotionalData?.filter(item => item.energy_level != null).map(item => item.energy_level) || [];

    const avgPain = painLevels.length ? painLevels.reduce((sum, val) => sum + val, 0) / painLevels.length : null;
    const avgStress = stressLevels.length ? stressLevels.reduce((sum, val) => sum + val, 0) / stressLevels.length : null;
    const avgEnergy = energyLevels.length ? energyLevels.reduce((sum, val) => sum + val, 0) / energyLevels.length : null;

    // Coletar tópicos e preocupações
    const allTopics = emotionalData?.flatMap(item => item.emotional_topics || []) || [];
    const allConcerns = emotionalData?.flatMap(item => item.concerns_mentioned || []) || [];
    const allAchievements = emotionalData?.flatMap(item => item.achievements_mentioned || []) || [];

    // Contar frequências
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});

    const mostDiscussedTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    // Preparar dados da semana para análise da IA
    const weeklyDataSummary = `
DADOS DA SEMANA (${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}):

USUÁRIO: ${profile?.full_name || 'Usuário'}, ${profile?.gender || 'N/A'}

CONVERSAS:
- Total: ${totalConversations} conversas
- Sentimento médio: ${averageSentiment.toFixed(2)} (-1 a 1)
- Emoções dominantes: ${dominantEmotions.join(', ') || 'Nenhuma detectada'}

SAÚDE FÍSICA:
- Dor média: ${avgPain ? `${avgPain.toFixed(1)}/10` : 'Não mencionada'}
- Stress médio: ${avgStress ? `${avgStress.toFixed(1)}/10` : 'Não mencionado'}
- Energia média: ${avgEnergy ? `${avgEnergy.toFixed(1)}/10` : 'Não mencionada'}

PESO: ${measurements?.length ? `${measurements.length} medições` : 'Sem medições'}
MISSÕES: ${missions?.filter(m => m.is_completed).length || 0} de ${missions?.length || 0} completadas

TÓPICOS PRINCIPAIS: ${mostDiscussedTopics.join(', ') || 'Nenhum específico'}
PREOCUPAÇÕES: ${allConcerns.slice(0, 5).join(', ') || 'Nenhuma mencionada'}
CONQUISTAS: ${allAchievements.slice(0, 5).join(', ') || 'Nenhuma mencionada'}

CONVERSAS RELEVANTES:
${conversations?.slice(-5).map(conv => `- Usuário: "${conv.user_message}" | Bot: "${conv.bot_response}"`).join('\n') || 'Nenhuma conversa'}
`;

    // Gerar análise com IA
    const aiAnalysisPrompt = `
Como Dr. Vita, analise estes dados da semana e forneça um relatório completo em JSON:

${weeklyDataSummary}

Retorne um JSON com:
{
  "emotional_summary": "Resumo emocional da semana em 2-3 frases",
  "main_concerns": ["principais preocupações identificadas"],
  "progress_noted": ["progressos e conquistas observados"],
  "recommendations": ["3-5 recomendações específicas"],
  "risk_factors": ["fatores de risco identificados"],
  "positive_patterns": ["padrões positivos observados"],
  "areas_for_improvement": ["áreas que precisam de atenção"],
  "weekly_highlights": ["destaques da semana"],
  "dr_vita_notes": "Notas pessoais do Dr. Vita para o feedback de sexta-feira"
}

Seja empático, preciso e focado na pessoa real por trás dos dados.
`;

    const analysisResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: aiAnalysisPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    const analysisData = await analysisResponse.json();
    const analysisText = analysisData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Extrair JSON da resposta
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    let aiAnalysis = {};
    if (jsonMatch) {
      try {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error('Erro ao parsear análise da IA:', error);
        aiAnalysis = { error: 'Falha na análise da IA' };
      }
    }

    // Salvar insights semanais
    const insightsData = {
      user_id: userId,
      week_start_date: startDate.toISOString().split('T')[0],
      total_conversations: totalConversations,
      average_sentiment: averageSentiment,
      dominant_emotions: dominantEmotions,
      average_pain_level: avgPain,
      average_stress_level: avgStress,
      average_energy_level: avgEnergy,
      most_discussed_topics: mostDiscussedTopics,
      main_concerns: allConcerns.slice(0, 10),
      progress_noted: allAchievements.slice(0, 10),
      recommendations: aiAnalysis.recommendations || [],
      emotional_summary: aiAnalysis.emotional_summary || 'Análise em andamento',
      ai_analysis: aiAnalysis
    };

    const { data: savedInsights, error: saveError } = await supabase
      .from('weekly_chat_insights')
      .upsert(insightsData)
      .select()
      .single();

    if (saveError) {
      console.error('Erro ao salvar insights:', saveError);
      throw saveError;
    }

    console.log('Insights semanais gerados e salvos com sucesso');

    return new Response(JSON.stringify({
      success: true,
      insights: savedInsights,
      data_summary: {
        conversations: totalConversations,
        emotional_analyses: emotionalData?.length || 0,
        average_sentiment: averageSentiment,
        dominant_emotions: dominantEmotions
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na geração de insights:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});