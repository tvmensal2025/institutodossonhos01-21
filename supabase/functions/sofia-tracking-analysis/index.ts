import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Sofia analysis for user:', req.url);
    console.log('Collecting comprehensive tracking data...');

    let userId: string | null = null;
    
    // Suportar tanto GET quanto POST
    if (req.method === 'GET') {
      const url = new URL(req.url);
      userId = url.searchParams.get('userId');
    } else if (req.method === 'POST') {
      try {
        const body = await req.json();
        userId = body.userId;
      } catch (e) {
        // Se não conseguir parsear JSON, tentar query params
        const url = new URL(req.url);
        userId = url.searchParams.get('userId');
      }
    }

    if (!userId) {
      throw new Error('userId é obrigatório');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Coletar dados do usuário
    const { data: userData } = await supabase
      .from('user_physical_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: measurements } = await supabase
      .from('user_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    console.log('Performing Sofia AI analysis...');
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const analysisPrompt = `Analise os dados de saúde do usuário e forneça insights personalizados:

**Dados Físicos:**
${JSON.stringify(userData, null, 2)}

**Medições Recentes:**
${JSON.stringify(measurements?.slice(0, 5), null, 2)}

Como Sofia, nutricionista do Instituto dos Sonhos, forneça:
1. Análise do progresso
2. Recomendações específicas
3. Alertas de saúde se necessário
4. Sugestões de melhorias

Responda em português, de forma empática e profissional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Você é Sofia, uma nutricionista especializada e empática do Instituto dos Sonhos. Forneça análises detalhadas em formato JSON estruturado com insights, recommendations, anomalies, predictions, personalized_tips, e sofia_learning.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_completion_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const analysis = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          patterns: {
            sleep_patterns: "Análise de padrões de sono",
            water_patterns: "Análise de padrões de hidratação", 
            mood_patterns: "Análise de padrões de humor",
            exercise_patterns: "Análise de padrões de exercício",
            weight_patterns: "Análise de padrões de peso",
            food_patterns: "Análise de padrões alimentares"
          },
          insights: analysis?.split('\n') || [],
          recommendations: analysis?.split('\n') || [],
          anomalies: [],
          predictions: {
            weight_trend: "Estável",
            energy_forecast: "Boa",
            goal_likelihood: "Alta"
          },
          personalized_tips: analysis?.split('\n') || [],
          sofia_learning: analysis || "Análise processada com sucesso"
        },
        userData,
        measurementCount: measurements?.length || 0,
        generatedAt: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in Sofia tracking analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});