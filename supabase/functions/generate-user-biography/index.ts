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

    const { userId } = await req.json();
    if (!userId) {
      throw new Error('UserId é obrigatório');
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados completos do usuário
    const [
      { data: profile },
      { data: conversations },
      { data: measurements },
      { data: healthDiary },
      { data: missions },
      { data: existingBio }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('chat_conversations').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      supabase.from('weight_measurements').select('*').eq('user_id', userId).order('measurement_date', { ascending: false }).limit(10),
      supabase.from('health_diary').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(20),
      supabase.from('daily_mission_sessions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(30),
      supabase.from('user_ai_biography').select('*').eq('user_id', userId).single()
    ]);

    // Analisar conversas para extrair personalidade
    const conversationCount = conversations?.length || 0;
    const recentTopics = conversations?.slice(0, 10).map(c => c.user_message).join(' ') || '';
    
    // Calcular estatísticas de engajamento
    const avgMood = healthDiary?.length > 0 ? 
      healthDiary.reduce((sum, h) => sum + (h.mood_rating || 0), 0) / healthDiary.length : 0;
    
    const completedMissions = missions?.filter(m => m.is_completed).length || 0;
    const streakDays = missions?.[0]?.streak_days || 0;
    
    const weightTrend = measurements?.length >= 2 ? 
      (measurements[0].peso_kg - measurements[1].peso_kg) : 0;

    // Prompt para gerar biografia personalizada
    const biographyPrompt = `Você é Sof.ia, a assistente de saúde empática e carinhosa. Crie uma biografia personalizada de 2-3 frases para ${profile?.full_name || 'o usuário'}, baseada nos dados abaixo.

DADOS DO USUÁRIO:
- Nome: ${profile?.full_name || 'Usuário'}
- Idade: ${profile?.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 'Não informada'} anos
- Cidade: ${profile?.city || 'Não informada'}
- Conversas comigo: ${conversationCount}
- Humor médio: ${avgMood.toFixed(1)}/10
- Missões completadas: ${completedMissions}
- Sequência atual: ${streakDays} dias
- Tendência de peso: ${weightTrend > 0 ? '+' + weightTrend.toFixed(1) : weightTrend.toFixed(1)}kg

TEMAS RECENTES DAS CONVERSAS:
${recentTopics}

DIRETRIZES PARA A BIOGRAFIA:
- Seja carinhosa e empática, como uma amiga próxima
- Destaque características positivas e potenciais do usuário
- Mencione sutilmente o progresso ou jornada de saúde
- Use linguagem acolhedora e motivadora
- Máximo 3 frases
- Evite dados muito específicos de peso/medidas

${existingBio ? `BIOGRAFIA ANTERIOR (para evolução): "${existingBio.biography}"` : ''}

EXEMPLO DE TOM:
"Marina é uma pessoa determinada que busca constantemente seu bem-estar. Nas nossas conversas, percebo sua dedicação em manter hábitos saudáveis e sua curiosidade em aprender mais sobre si mesma. É inspirador ver como ela enfrenta cada desafio com coragem e gentileza."

Agora crie a biografia personalizada:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: biographyPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Google AI API error: ${data.error?.message || 'Erro desconhecido'}`);
    }

    const generatedBio = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Uma pessoa especial em sua jornada de autoconhecimento e bem-estar.';

    // Salvar ou atualizar biografia
    const { error: upsertError } = await supabase
      .from('user_ai_biography')
      .upsert({
        user_id: userId,
        biography: generatedBio.trim(),
        conversation_count: conversationCount,
        last_updated: new Date().toISOString(),
        personality_traits: {
          mood_avg: avgMood,
          engagement_level: streakDays > 7 ? 'high' : streakDays > 3 ? 'medium' : 'low',
          focus_areas: weightTrend < 0 ? ['weight_loss'] : ['health_maintenance']
        }
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Erro ao salvar biografia:', upsertError);
      throw new Error('Erro ao salvar biografia');
    }

    return new Response(JSON.stringify({
      success: true,
      biography: generatedBio.trim(),
      message: 'Biografia gerada com sucesso pela Sof.ia!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao gerar biografia:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});