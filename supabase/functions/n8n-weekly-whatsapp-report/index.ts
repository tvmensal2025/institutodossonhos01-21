import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface WeeklyReportData {
  user: any;
  measurements: any[];
  healthDiary: any[];
  missions: any[];
  weeklyAnalysis: any;
  achievements: any[];
  examAnalyses: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar todos os usuários ativos com telefone
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone')
      .not('phone', 'is', null);

    if (usersError) {
      throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
    }

    console.log(`Processando relatórios WhatsApp para ${users?.length || 0} usuários`);

    const reportsData = [];

    // Processar cada usuário
    for (const user of users || []) {
      try {
        const reportData = await generateWeeklyReportData(supabase, user);
        const whatsappMessage = generateWhatsAppMessage(reportData);
        
        reportsData.push({
          user_id: user.user_id,
          name: user.full_name,
          phone: user.phone,
          message: whatsappMessage
        });

        // Registrar no webhook log
        await supabase
          .from('n8n_webhook_logs')
          .insert({
            user_id: user.user_id,
            webhook_id: crypto.randomUUID(),
            event_type: 'weekly_whatsapp_report',
            payload: {
              user_id: user.user_id,
              phone: user.phone,
              message_preview: whatsappMessage.substring(0, 100)
            },
            status: 'generated'
          });

        console.log(`Relatório WhatsApp gerado para: ${user.full_name}`);
      } catch (error) {
        console.error(`Erro ao gerar relatório para ${user.full_name}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Relatórios WhatsApp processados para ${users?.length || 0} usuários`,
      reports: reportsData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no envio de relatórios WhatsApp:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateWeeklyReportData(supabase: any, user: any): Promise<WeeklyReportData> {
  // Buscar dados da última semana
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    { data: measurements },
    { data: healthDiary },
    { data: missions },
    { data: weeklyAnalysis },
    { data: achievements },
    { data: examAnalyses }
  ] = await Promise.all([
    supabase.from('weight_measurements').select('*').eq('user_id', user.user_id).gte('measurement_date', weekStart.toISOString().split('T')[0]).order('measurement_date', { ascending: false }),
    supabase.from('health_diary').select('*').eq('user_id', user.user_id).gte('date', weekStart.toISOString().split('T')[0]).order('date', { ascending: false }),
    supabase.from('daily_mission_sessions').select('*').eq('user_id', user.user_id).gte('date', weekStart.toISOString().split('T')[0]).order('date', { ascending: false }),
    supabase.from('weekly_analyses').select('*').eq('user_id', user.user_id).order('semana_inicio', { ascending: false }).limit(1),
    supabase.from('user_achievements').select('*').eq('user_id', user.user_id).gte('unlocked_at', weekStart.toISOString()),
    supabase.from('medical_exam_analyses').select('*').eq('user_id', user.user_id).gte('created_at', weekStart.toISOString()).order('created_at', { ascending: false })
  ]);

  return {
    user,
    measurements: measurements || [],
    healthDiary: healthDiary || [],
    missions: missions || [],
    weeklyAnalysis: weeklyAnalysis?.[0],
    achievements: achievements || [],
    examAnalyses: examAnalyses || []
  };
}

function generateWhatsAppMessage(data: WeeklyReportData): string {
  const { user, measurements, healthDiary, missions, weeklyAnalysis, achievements, examAnalyses } = data;
  
  // Calcular estatísticas
  const weightChange = measurements.length >= 2 ? 
    (measurements[0].peso_kg - measurements[measurements.length - 1].peso_kg) : 0;
  
  const avgMood = healthDiary.length > 0 ? 
    healthDiary.reduce((sum, h) => sum + (h.mood_rating || 0), 0) / healthDiary.length : 0;
  
  const completedMissions = missions.filter(m => m.is_completed).length;
  const totalPoints = missions.reduce((sum, m) => sum + (m.total_points || 0), 0);

  let message = `🏥 *DR. VITA - RELATÓRIO SEMANAL*\n\n`;
  message += `Olá, ${user.full_name}! 👋\n\n`;
  message += `📊 *RESUMO DA SEMANA*\n`;
  message += `${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

  // Estatísticas principais
  message += `📈 *INDICADORES PRINCIPAIS*\n`;
  message += `⚖️ Variação de peso: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg\n`;
  message += `😊 Humor médio: ${avgMood.toFixed(1)}/10\n`;
  message += `🎯 Missões completas: ${completedMissions}\n`;
  message += `⭐ Pontos conquistados: ${totalPoints}\n\n`;

  // Progresso físico
  if (measurements.length > 0) {
    message += `⚖️ *PROGRESSO FÍSICO*\n`;
    message += `📊 Última pesagem: ${measurements[0].peso_kg}kg\n`;
    if (measurements[0].imc) {
      message += `📈 IMC: ${measurements[0].imc.toFixed(1)}\n`;
    }
    if (measurements[0].gordura_corporal_percent) {
      message += `🔥 Gordura corporal: ${measurements[0].gordura_corporal_percent.toFixed(1)}%\n`;
    }
    message += `📅 Medições realizadas: ${measurements.length}/7 dias\n\n`;
  }

  // Hábitos de saúde
  if (healthDiary.length > 0) {
    const avgWater = healthDiary.reduce((sum, h) => sum + (h.water_intake || 0), 0) / healthDiary.length;
    const avgSleep = healthDiary.reduce((sum, h) => sum + (h.sleep_hours || 0), 0) / healthDiary.length;
    const avgExercise = healthDiary.reduce((sum, h) => sum + (h.exercise_minutes || 0), 0) / healthDiary.length;

    message += `🌟 *HÁBITOS DE SAÚDE*\n`;
    message += `💧 Água média/dia: ${avgWater.toFixed(1)}L\n`;
    message += `😴 Sono médio/noite: ${avgSleep.toFixed(1)}h\n`;
    message += `🏃‍♂️ Exercício médio/dia: ${avgExercise.toFixed(0)}min\n\n`;
  }

  // Conquistas
  if (achievements.length > 0) {
    message += `🏆 *NOVAS CONQUISTAS*\n`;
    achievements.forEach(achievement => {
      message += `${achievement.icon || '🏆'} ${achievement.title}\n`;
    });
    message += `\n`;
  }

  // Análise IA
  if (weeklyAnalysis) {
    message += `🤖 *ANÁLISE INTELIGENTE*\n`;
    message += `📈 Tendência: ${weeklyAnalysis.tendencia}\n`;
    if (weeklyAnalysis.observacoes) {
      message += `📝 ${weeklyAnalysis.observacoes.substring(0, 100)}...\n`;
    }
    message += `\n`;
  }

  // Recomendações
  message += `💡 *RECOMENDAÇÕES PARA PRÓXIMA SEMANA*\n`;
  if (completedMissions < 5) {
    message += `🎯 Tente completar mais missões diárias\n`;
  }
  if (avgMood < 7) {
    message += `😊 Pratique atividades que melhorem seu humor\n`;
  }
  if (measurements.length < 3) {
    message += `⚖️ Mantenha pesagens mais regulares\n`;
  }
  message += `💬 Use o chat do Dr. Vita para tirar dúvidas\n\n`;

  message += `📱 Continue acompanhando sua saúde no app!\n`;
  message += `🔒 Este relatório é confidencial e personalizado para você.`;

  return message;
}