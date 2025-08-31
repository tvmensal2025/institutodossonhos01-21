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
    const { userId, weekStartDate } = await req.json();
    
    console.log('🩺 Dr. Vital iniciando análise semanal...');
    console.log('👤 Usuário:', userId);
    console.log('📅 Semana:', weekStartDate);

    // Configurar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Configurar OpenAI
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    console.log('🔑 OpenAI:', OPENAI_API_KEY ? '✅ Configurada' : '❌ Não encontrada');

    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    console.log('📊 Coletando dados da semana:', weekStartStr, 'até', weekEndStr);

    // 🔍 Buscar dados do usuário e da semana
    let reportData = {
      user: null,
      weight: { measurements: [], trend: 'stable', change: 0 },
      water: { daily: [], average: 0, consistency: 0 },
      sleep: { daily: [], average: 0, quality: 0 },
      mood: { daily: [], average: 0, energy: 0, stress: 0 },
      exercise: { sessions: [], totalMinutes: 0, days: 0 },
      missions: { completed: 0, streak: 0, points: 0 },
      healthScore: 0
    };

    try {
      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profile) {
        reportData.user = profile;
        console.log('👤 Perfil encontrado:', profile.full_name);
      }

      // Buscar medições de peso da semana
      const { data: weightData } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', userId)
        .gte('measurement_date', weekStartStr)
        .lte('measurement_date', weekEndStr)
        .order('measurement_date', { ascending: true });
      
      if (weightData && weightData.length > 0) {
        reportData.weight.measurements = weightData;
        if (weightData.length > 1) {
          const firstWeight = weightData[0].peso_kg;
          const lastWeight = weightData[weightData.length - 1].peso_kg;
          reportData.weight.change = lastWeight - firstWeight;
          reportData.weight.trend = reportData.weight.change > 0.2 ? 'increasing' : 
                                   reportData.weight.change < -0.2 ? 'decreasing' : 'stable';
        }
        console.log('⚖️ Peso:', weightData.length, 'medições, variação:', reportData.weight.change);
      }

      // Buscar dados de água
      const { data: waterData } = await supabase
        .from('water_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('date', { ascending: true });
      
      if (waterData) {
        reportData.water.daily = waterData;
        const dailyTotals = {};
        waterData.forEach(entry => {
          if (!dailyTotals[entry.date]) dailyTotals[entry.date] = 0;
          dailyTotals[entry.date] += entry.amount_ml;
        });
        const dailyValues = Object.values(dailyTotals);
        reportData.water.average = dailyValues.length > 0 ? 
          dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length : 0;
        reportData.water.consistency = dailyValues.filter(val => val >= 2000).length / 7 * 100;
        console.log('💧 Água:', waterData.length, 'registros, média:', reportData.water.average);
      }

      // Buscar dados de sono
      const { data: sleepData } = await supabase
        .from('sleep_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('date', { ascending: true });
      
      if (sleepData) {
        reportData.sleep.daily = sleepData;
        reportData.sleep.average = sleepData.length > 0 ? 
          sleepData.reduce((sum, entry) => sum + entry.hours_slept, 0) / sleepData.length : 0;
        reportData.sleep.quality = sleepData.length > 0 ? 
          sleepData.reduce((sum, entry) => sum + entry.sleep_quality, 0) / sleepData.length * 20 : 0;
        console.log('😴 Sono:', sleepData.length, 'noites, média:', reportData.sleep.average);
      }

      // Buscar dados de humor
      const { data: moodData } = await supabase
        .from('mood_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('date', { ascending: true });
      
      if (moodData) {
        reportData.mood.daily = moodData;
        reportData.mood.average = moodData.length > 0 ? 
          moodData.reduce((sum, entry) => sum + entry.day_rating, 0) / moodData.length : 0;
        reportData.mood.energy = moodData.length > 0 ? 
          moodData.reduce((sum, entry) => sum + entry.energy_level, 0) / moodData.length : 0;
        reportData.mood.stress = moodData.length > 0 ? 
          moodData.reduce((sum, entry) => sum + entry.stress_level, 0) / moodData.length : 0;
        console.log('😊 Humor:', moodData.length, 'dias, média:', reportData.mood.average);
      }

      // Buscar dados de exercício
      const { data: exerciseData } = await supabase
        .from('exercise_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('date', { ascending: true });
      
      if (exerciseData) {
        reportData.exercise.sessions = exerciseData;
        reportData.exercise.totalMinutes = exerciseData.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
        const uniqueDays = new Set(exerciseData.map(entry => entry.date));
        reportData.exercise.days = uniqueDays.size;
        console.log('🚶 Exercício:', exerciseData.length, 'sessões,', reportData.exercise.totalMinutes, 'minutos');
      }

      // Buscar dados de missões
      const { data: missionData } = await supabase
        .from('daily_mission_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('date', { ascending: true });
      
      if (missionData) {
        reportData.missions.completed = missionData.filter(m => m.is_completed).length;
        reportData.missions.points = missionData.reduce((sum, m) => sum + (m.total_points || 0), 0);
        reportData.missions.streak = missionData.length > 0 ? missionData[missionData.length - 1].streak_days : 0;
        console.log('🎯 Missões:', reportData.missions.completed, 'completadas');
      }

      // Calcular Health Score
      const { data: healthScore } = await supabase
        .rpc('calculate_weekly_health_score', { 
          p_user_id: userId, 
          p_week_start: weekStartStr 
        });
      
      reportData.healthScore = healthScore || 0;
      console.log('📊 Health Score:', reportData.healthScore);

    } catch (error) {
      console.log('⚠️ Erro ao buscar dados:', error.message);
    }

    // 🤖 Gerar análise do Dr. Vital
    let drVitalAnalysis = '';
    let recommendations = [];

    if (OPENAI_API_KEY) {
      console.log('🩺 Dr. Vital analisando dados...');
      
      try {
        const analysisPrompt = `
Você é o Dr. Vital, um médico especialista em medicina preventiva e análise de dados de saúde.

DADOS DO PACIENTE: ${reportData.user?.full_name || 'Paciente'}
PERÍODO: ${weekStartStr} a ${weekEndStr}

DADOS DA SEMANA:
🏋️ PESO: ${reportData.weight.measurements.length} medições, variação de ${reportData.weight.change.toFixed(2)}kg (${reportData.weight.trend})
💧 HIDRATAÇÃO: Média ${(reportData.water.average/1000).toFixed(1)}L/dia, consistência ${reportData.water.consistency.toFixed(0)}%
😴 SONO: Média ${reportData.sleep.average.toFixed(1)}h/noite, qualidade ${reportData.sleep.quality.toFixed(0)}%
😊 BEM-ESTAR: Humor ${reportData.mood.average.toFixed(1)}/10, energia ${reportData.mood.energy.toFixed(1)}/5, estresse ${reportData.mood.stress.toFixed(1)}/5
🚶 EXERCÍCIO: ${reportData.exercise.totalMinutes} minutos em ${reportData.exercise.days} dias
🎯 MISSÕES: ${reportData.missions.completed}/7 completadas, ${reportData.missions.points} pontos
📊 HEALTH SCORE: ${reportData.healthScore}/100

INSTRUÇÕES PARA SUA ANÁLISE:
1. Seja profissional, mas acessível
2. Analise os dados com base em evidências médicas
3. Identifique padrões e correlações
4. Destaque progressos e áreas de melhoria
5. Forneça 3-5 recomendações específicas e práticas
6. Use linguagem médica, mas explicativa
7. Seja motivacional, mas realista
8. Considere a saúde holística (física, mental, comportamental)

Responda com uma análise médica completa em 2-3 parágrafos, seguida de recomendações numeradas.

ANÁLISE DR. VITAL:`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'o3-2025-04-16',
            messages: [
              { 
                role: 'system', 
                content: 'Você é o Dr. Vital, um médico especialista em medicina preventiva. Analise dados de saúde e forneça insights médicos baseados em evidências.' 
              },
              { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.3,
            max_tokens: 1500
          }),
        });

        if (response.ok) {
          const data = await response.json();
          drVitalAnalysis = data.choices[0].message.content;
          
          // Extrair recomendações
          const recoMatch = drVitalAnalysis.match(/(?:RECOMENDAÇÕES|RECOMENDACOES|RECOMMENDATIONS):(.*)/is);
          if (recoMatch) {
            const recoText = recoMatch[1];
            recommendations = recoText.split(/\d+\./)
              .filter(r => r.trim())
              .map(r => r.trim())
              .slice(0, 5);
          }
          
          console.log('✅ Análise Dr. Vital gerada');
        } else {
          throw new Error(`Erro na API: ${response.status}`);
        }
      } catch (error) {
        console.log('⚠️ Erro na análise:', error.message);
        drVitalAnalysis = `Prezado(a) ${reportData.user?.full_name || 'Paciente'},

Com base nos dados coletados nesta semana, observo um health score de ${reportData.healthScore}/100. 

Os dados indicam ${reportData.water.consistency > 70 ? 'boa' : 'moderada'} hidratação, ${reportData.sleep.average >= 7 ? 'adequadas' : 'insuficientes'} horas de sono e ${reportData.exercise.days >= 3 ? 'boa' : 'baixa'} frequência de exercícios.

Recomendo manter o foco na consistência dos hábitos saudáveis para otimizar seus resultados de saúde.

Dr. Vital
Medicina Preventiva`;
        
        recommendations = [
          'Manter hidratação adequada (2L/dia)',
          'Priorizar 7-8 horas de sono qualitativo',
          'Exercitar-se pelo menos 3x por semana',
          'Monitorar peso regularmente',
          'Manter consistência nas missões diárias'
        ];
      }
    } else {
      drVitalAnalysis = `Análise semanal não disponível - configuração de IA necessária.`;
      recommendations = ['Configurar sistema de IA para análises completas'];
    }

    // Salvar relatório no banco
    const { data: savedReport, error: saveError } = await supabase
      .from('weekly_health_reports')
      .insert({
        user_id: userId,
        week_start_date: weekStartStr,
        week_end_date: weekEndStr,
        report_data: reportData,
        dr_vital_analysis: drVitalAnalysis,
        recommendations: recommendations,
        health_score: reportData.healthScore
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erro ao salvar relatório:', saveError);
    } else {
      console.log('✅ Relatório salvo com ID:', savedReport.id);
    }

    const finalResponse = {
      success: true,
      report: {
        id: savedReport?.id,
        user: reportData.user,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        healthScore: reportData.healthScore,
        analysis: drVitalAnalysis,
        recommendations: recommendations,
        data: reportData
      }
    };

    console.log('✅ Dr. Vital concluiu análise semanal');

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro no Dr. Vital:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});