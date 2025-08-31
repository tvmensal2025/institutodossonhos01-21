import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      throw new Error('userId é obrigatório (via JSON body em POST ou query param em GET)');
    }

    console.log('🔍 Verificando completude dos dados para usuário:', userId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar anamnese
    const { data: anamnesis } = await supabase
      .from('user_anamnesis')
      .select('id')
      .eq('user_id', userId)
      .single();

    // Verificar dados físicos
    const { data: physicalData } = await supabase
      .from('user_physical_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    // Verificar peso
    const { data: weightData } = await supabase
      .from('weight_measurements')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    // Verificar nutrição
    const { data: nutritionData } = await supabase
      .from('nutrition_tracking')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    // Verificar exercícios
    const { data: exerciseData } = await supabase
      .from('exercise_sessions')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    // Verificar metas
    const { data: goalsData } = await supabase
      .from('user_goals')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    // Verificar missões diárias
    const { data: missionsData } = await supabase
      .from('daily_mission_sessions')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    // Verificar humor
    const { data: moodData } = await supabase
      .from('mood_tracking')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    // Verificar perfil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    const completionStatus = {
      anamnesis: !!anamnesis,
      physicalData: !!physicalData,
      weight: !!weightData,
      nutrition: !!nutritionData,
      exercise: !!exerciseData,
      goals: !!goalsData,
      dailyMission: !!missionsData,
      mood: !!moodData,
      profile: !!profileData
    };

    const totalFields = Object.keys(completionStatus).length;
    const completedFields = Object.values(completionStatus).filter(Boolean).length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    const minimumDataMet = completionStatus.profile && completionStatus.physicalData;
    const canReceiveAnalysis = completionPercentage >= 70;
    const hasRequiredData = completionStatus.anamnesis && completionStatus.physicalData && completionStatus.profile;

    console.log('📊 Status de completude:', {
      completionStatus,
      completionPercentage,
      minimumDataMet,
      canReceiveAnalysis,
      hasRequiredData
    });

    return new Response(
      JSON.stringify({
        success: true,
        completionStatus,
        completionPercentage,
        minimumDataMet,
        canReceiveAnalysis,
        hasRequiredData,
        totalFields,
        completedFields
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Erro ao verificar completude dos dados:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Falha ao verificar completude dos dados', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});