import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

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
  conversations: any[];
  bioimpedanceData: any[];
  physicalData: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar se é um teste
    const body = await req.json().catch(() => ({}));
    const isTestMode = body.testMode === true;

    // Para modo de teste, não exigir autenticação
    if (!isTestMode) {
      // Verificar autenticação para modo normal
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing authorization header'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const sendPulseApiKey = Deno.env.get('SENDPULSE_API_KEY');
    const sendPulseApiSecret = Deno.env.get('SENDPULSE_API_SECRET');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    // Verificar se pelo menos um provedor está configurado
    if (!resendApiKey && (!sendPulseApiKey || !sendPulseApiSecret)) {
      throw new Error('RESEND_API_KEY ou SENDPULSE_API_KEY/SENDPULSE_API_SECRET devem estar configurados');
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (isTestMode) {
      // Modo de teste - enviar para email específico
      const testEmail = body.testEmail || 'tvmensal2025@gmail.com';
      const testUserName = body.testUserName || 'Sirlene Correa';
      const returnHTML = body.returnHTML === true;

      // Criar ou verificar usuário Sirlene
      let sirleneUser;
      try {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('email', testEmail)
          .single();

        if (existingUser) {
          sirleneUser = existingUser;
          console.log('✅ Usuário Sirlene encontrado:', sirleneUser);
        } else {
          // Criar usuário Sirlene se não existir
          const { data: newUser, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: 'sirlene-test-user-' + Date.now(),
              full_name: testUserName,
              email: testEmail,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.log('⚠️ Erro ao criar usuário, usando dados fictícios:', createError.message);
            sirleneUser = {
              id: 'sirlene-test-user',
              full_name: testUserName,
              email: testEmail
            };
          } else {
            sirleneUser = newUser;
            console.log('✅ Usuário Sirlene criado:', sirleneUser);
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar/criar usuário, usando dados fictícios:', error.message);
        sirleneUser = {
          id: 'sirlene-test-user',
          full_name: testUserName,
          email: testEmail
        };
      }

      const testUser = {
        user_id: sirleneUser.id,
        full_name: sirleneUser.full_name,
        email: sirleneUser.email
      };

      console.log(`🧪 Modo de teste: ${returnHTML ? 'retornando HTML' : 'enviando email'} para ${testEmail}`);

      // Se returnHTML for true, retornar HTML em vez de enviar email
      if (returnHTML) {
        const reportData = await generateWeeklyReportData(supabase, testUser);
        const htmlContent = generateWeeklyReportHTML(reportData);
        
        return new Response(htmlContent, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/html; charset=utf-8' 
          }
        });
      }

      await generateAndSendWeeklyReport(supabase, testUser);

      return new Response(JSON.stringify({
        success: true,
        message: `Email de teste enviado para ${testEmail}`,
        testMode: true,
        user: sirleneUser
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Modo normal - processar todos os usuários
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .not('email', 'is', null);

    if (usersError) {
      throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
    }

    console.log(`📧 Processando ${users?.length || 0} usuários`);

    // Processar cada usuário
    for (const user of users || []) {
      try {
        await generateAndSendWeeklyReport(supabase, user);
        console.log(`Relatório enviado para: ${user.email}`);
      } catch (error) {
        console.error(`Erro ao enviar relatório para ${user.email}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Relatórios semanais processados para ${users?.length || 0} usuários`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função weekly-health-report:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateWeeklyReportData(supabase: any, user: any): Promise<WeeklyReportData> {
  // Buscar dados completos do usuário
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  // Se for modo de teste, usar dados fictícios
  if (user.user_id.includes('test-user') || user.user_id === 'test-user-id' || user.user_id === '550e8400-e29b-41d4-a716-446655440000') {
    console.log('🧪 Usando dados de teste');
    
    const testData = {
      measurements: [
        { 
          peso_kg: 68.5, 
          measurement_date: new Date().toISOString().split('T')[0],
          altura_cm: 165,
          imc: 25.1,
          gordura_corporal_percent: 25.5,
          agua_corporal_percent: 55.8,
          gordura_visceral_nivel: 8,
          metabolismo_basal_kcal: 1450,
          massa_muscular_kg: 42.3,
          massa_ossea_kg: 2.8,
          proteina_corporal_percent: 16.2,
          idade_metabolica: 32,
          nivel_atividade: 'moderado'
        },
        { 
          peso_kg: 69.2, 
          measurement_date: new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0],
          altura_cm: 165,
          imc: 25.4,
          gordura_corporal_percent: 26.1,
          agua_corporal_percent: 55.2,
          gordura_visceral_nivel: 8,
          metabolismo_basal_kcal: 1445,
          massa_muscular_kg: 42.1,
          massa_ossea_kg: 2.8,
          proteina_corporal_percent: 16.0,
          idade_metabolica: 33,
          nivel_atividade: 'moderado'
        },
        { 
          peso_kg: 70.0, 
          measurement_date: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0],
          altura_cm: 165,
          imc: 25.7,
          gordura_corporal_percent: 26.8,
          agua_corporal_percent: 54.7,
          gordura_visceral_nivel: 9,
          metabolismo_basal_kcal: 1440,
          massa_muscular_kg: 41.8,
          massa_ossea_kg: 2.8,
          proteina_corporal_percent: 15.8,
          idade_metabolica: 34,
          nivel_atividade: 'moderado'
        },
        { 
          peso_kg: 70.8, 
          measurement_date: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0],
          altura_cm: 165,
          imc: 26.0,
          gordura_corporal_percent: 27.2,
          agua_corporal_percent: 54.3,
          gordura_visceral_nivel: 9,
          metabolismo_basal_kcal: 1435,
          massa_muscular_kg: 41.5,
          massa_ossea_kg: 2.8,
          proteina_corporal_percent: 15.6,
          idade_metabolica: 35,
          nivel_atividade: 'moderado'
        },
        { 
          peso_kg: 71.5, 
          measurement_date: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0],
          altura_cm: 165,
          imc: 26.3,
          gordura_corporal_percent: 27.8,
          agua_corporal_percent: 53.9,
          gordura_visceral_nivel: 10,
          metabolismo_basal_kcal: 1430,
          massa_muscular_kg: 41.2,
          massa_ossea_kg: 2.8,
          proteina_corporal_percent: 15.4,
          idade_metabolica: 36,
          nivel_atividade: 'moderado'
        }
      ],
      healthDiary: [
        { mood_rating: 8, energy_level: 7, stress_level: 3, date: new Date().toISOString().split('T')[0] },
        { mood_rating: 7, energy_level: 6, stress_level: 4, date: new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0] },
        { mood_rating: 9, energy_level: 8, stress_level: 2, date: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0] },
        { mood_rating: 6, energy_level: 5, stress_level: 5, date: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0] },
        { mood_rating: 8, energy_level: 7, stress_level: 3, date: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0] }
      ],
      missions: [
        { is_completed: true, total_points: 15, date: new Date().toISOString().split('T')[0] },
        { is_completed: true, total_points: 20, date: new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0] },
        { is_completed: true, total_points: 12, date: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0] },
        { is_completed: false, total_points: 8, date: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0] },
        { is_completed: true, total_points: 18, date: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0] }
      ],
      weeklyAnalysis: {
        health_score: 85,
        weight_trend: 'diminuindo',
        sleep_quality: 'boa',
        hydration_level: 'adequada'
      },
      achievements: [
        { title: 'Primeira Semana', description: 'Completou 7 dias consecutivos', unlocked_at: new Date().toISOString() },
        { title: 'Meta de Peso', description: 'Perdeu 3kg esta semana', unlocked_at: new Date(Date.now() - 24*60*60*1000).toISOString() },
        { title: 'Hidratação Perfeita', description: 'Manteve hidratação acima de 55%', unlocked_at: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
        { title: 'Massa Muscular', description: 'Ganhou 1.1kg de massa muscular', unlocked_at: new Date(Date.now() - 3*24*60*60*1000).toISOString() }
      ],
      examAnalyses: [],
      conversations: [
        { content: 'Olá Sofia, como estou hoje? Estou me sentindo muito bem!', created_at: new Date().toISOString() },
        { content: 'Vou fazer exercícios hoje! Quero manter a consistência.', created_at: new Date(Date.now() - 24*60*60*1000).toISOString() },
        { content: 'Sofia, qual é a melhor hora para fazer exercícios?', created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
        { content: 'Consegui perder peso esta semana! Estou muito feliz!', created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString() }
      ],
      bioimpedanceData: [
        { 
          body_fat_percentage: 25.5,
          muscle_mass: 45.2,
          water_percentage: 55.8,
          bone_mass: 2.8,
          protein_percentage: 16.2,
          metabolic_age: 32,
          visceral_fat_level: 8,
          bmr: 1450,
          created_at: new Date().toISOString()
        },
        { 
          body_fat_percentage: 26.1,
          muscle_mass: 44.8,
          water_percentage: 55.2,
          bone_mass: 2.8,
          protein_percentage: 16.0,
          metabolic_age: 33,
          visceral_fat_level: 8,
          bmr: 1445,
          created_at: new Date(Date.now() - 24*60*60*1000).toISOString()
        }
      ],
      physicalData: {
        height: 165,
        height_cm: 165,
        age: 35,
        activity_level: 'moderado'
      }
    };

        // Retornar dados de teste
    return {
      user,
      ...testData
    };
  }

  // Buscar dados reais do usuário
  const { data: measurements } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('measurement_date', weekStart.toISOString().split('T')[0])
    .order('measurement_date', { ascending: false });

  const { data: healthDiary } = await supabase
    .from('health_diary')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('date', weekStart.toISOString().split('T')[0])
    .order('date', { ascending: false });

  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('date', weekStart.toISOString().split('T')[0])
    .order('date', { ascending: false });

  const { data: weeklyAnalysis } = await supabase
    .from('weekly_analysis')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('week_start', weekStart.toISOString().split('T')[0])
    .single();

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('unlocked_at', weekStart.toISOString())
    .order('unlocked_at', { ascending: false });

  const { data: examAnalyses } = await supabase
    .from('exam_analyses')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('created_at', weekStart.toISOString())
    .order('created_at', { ascending: false });

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('created_at', weekStart.toISOString())
    .order('created_at', { ascending: false });

  const { data: bioimpedanceData } = await supabase
    .from('bioimpedance_data')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('created_at', weekStart.toISOString())
    .order('created_at', { ascending: false });

  const { data: physicalData } = await supabase
    .from('physical_data')
    .select('*')
    .eq('user_id', user.user_id)
    .single();

  return {
    user,
    measurements: measurements || [],
    healthDiary: healthDiary || [],
    missions: missions || [],
    weeklyAnalysis: weeklyAnalysis || {},
    achievements: achievements || [],
    examAnalyses: examAnalyses || [],
    conversations: conversations || [],
    bioimpedanceData: bioimpedanceData || [],
    physicalData: physicalData || {}
  };
}

async function generateAndSendWeeklyReport(supabase: any, user: any) {
  const reportData = await generateWeeklyReportData(supabase, user);
  
  // Gerar HTML do relatório
  const reportHTML = generateWeeklyReportHTML(reportData);

  // Enviar email usando Resend
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    
    const result = await resend.emails.send({
      from: "Dr. Vital <onboarding@resend.dev>",
      to: [user.email],
      subject: `📊 Seu Relatório Semanal de Saúde - ${new Date().toLocaleDateString('pt-BR')}`,
      html: reportHTML,
    });

    if (result.error) {
      throw new Error(`Erro ao enviar email: ${result.error.message}`);
    }
  } else {
    throw new Error('RESEND_API_KEY não configurado');
  }
}

function generateWeeklyReportHTML(data: WeeklyReportData): string {
  const { user, measurements, healthDiary, missions, weeklyAnalysis, achievements, examAnalyses, conversations, bioimpedanceData, physicalData } = data;
  
  // Calcular estatísticas médicas
  const weightChange = measurements.length >= 2 ? 
    (measurements[0].peso_kg - measurements[measurements.length - 1].peso_kg) : 0;
  
  // Dados da última medição de bioimpedância
  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;
  const imc = latestMeasurement ? (latestMeasurement.peso_kg / Math.pow((physicalData?.height_cm || 165) / 100, 2)) : 0;
  const gorduraCorporal = latestMeasurement?.gordura_corporal_percent || 0;
  const aguaCorporal = latestMeasurement?.agua_corporal_percent || 0;
  const gorduraVisceral = latestMeasurement?.gordura_visceral_nivel || 0;
  const metabolismo = latestMeasurement?.metabolismo_basal_kcal || 0;
  const massaMuscular = latestMeasurement?.massa_muscular_kg || 0;

  // Score de saúde baseado nos dados
  const healthScore = calculateHealthScore(latestMeasurement, healthDiary);
  
  // Contar conversas da semana para mensagem personalizada
  const weeklyConversations = conversations.length;
  
  // Gerar mensagem da Sof.ia baseada nas conversas reais
  const sofiaMessage = generateSofiaMessage(user.full_name, weeklyConversations);
  
  // Gerar análise médica do Dr. Vita
  const drVitaMessage = generateDrVitaAnalysis(measurements, bioimpedanceData, physicalData, user.full_name);
  
  // Dias desde a última análise
  const daysSinceLastAnalysis = conversations.length > 0 ? 
    Math.floor((new Date().getTime() - new Date(conversations[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 2;
  const chartData = generateChartData(measurements);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Semanal de Saúde - ${user.full_name}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #f8fafc;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 32px 64px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%);
            color: white;
            padding: 60px 40px;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><circle cx="20" cy="10" r="8" fill="url(%23a)"/><circle cx="80" cy="10" r="6" fill="url(%23a)"/></svg>') repeat;
            opacity: 0.1;
        }
        
        .header-content {
            position: relative;
            z-index: 2;
            text-align: center;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 3.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header-subtitle {
            font-size: 1.4rem;
            opacity: 0.95;
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .header-date {
            font-size: 1rem;
            opacity: 0.8;
            font-weight: 400;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            padding: 40px;
            margin: -20px 40px 40px 40px;
            background: white;
            border-radius: 20px;
            position: relative;
            z-index: 3;
            box-shadow: 0 8px 32px rgba(0,0,0,0.06);
        }
        
        .dashboard-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.05);
            border: 1px solid #f1f5f9;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .dashboard-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--card-gradient);
        }
        
        .dashboard-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 40px rgba(0,0,0,0.12);
        }
        
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-right: 16px;
            background: var(--icon-bg);
            color: var(--icon-color);
        }
        
        .card-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }
        
        .card-value {
            font-size: 2.5rem;
            font-weight: 800;
            margin: 8px 0;
            color: #1e293b;
        }
        
        .card-label {
            font-size: 0.85rem;
            color: #64748b;
            font-weight: 500;
        }
        
        .card-trend {
            font-size: 0.8rem;
            margin-top: 8px;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 600;
        }
        
        .trend-positive {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .trend-negative {
            background: #fef2f2;
            color: #dc2626;
        }
        
        .trend-neutral {
            background: #fef3c7;
            color: #d97706;
        }
        
        /* Card specific styles */
        .card-preventive {
            --card-gradient: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            --icon-bg: #dbeafe;
            --icon-color: #2563eb;
        }
        
        .card-health-score {
            --card-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --icon-bg: #d1fae5;
            --icon-color: #059669;
        }
        
        .card-conversations {
            --card-gradient: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            --icon-bg: #ede9fe;
            --icon-color: #7c3aed;
        }
        
        .card-analysis {
            --card-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            --icon-bg: #fef3c7;
            --icon-color: #d97706;
        }
        
        .content {
            padding: 0 40px 40px 40px;
        }
        
        .section {
            margin-bottom: 48px;
            background: white;
            border-radius: 20px;
            padding: 32px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.04);
            border: 1px solid #f1f5f9;
        }
        
        .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #f8fafc;
        }
        
        .section-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            margin-right: 16px;
        }
        
        .section h2 {
            color: #1e293b;
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 24px;
        }
        
        .metric-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        
        .metric-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 4px;
        }
        
        .metric-label {
            font-size: 0.85rem;
            color: #64748b;
            font-weight: 500;
        }
        
        .metric-change {
            font-size: 0.75rem;
            margin-top: 4px;
            font-weight: 600;
        }
        
        .character-section {
            background: linear-gradient(135deg, var(--character-bg-start) 0%, var(--character-bg-end) 100%);
            border-radius: 20px;
            padding: 32px;
            margin-bottom: 32px;
            color: var(--character-text);
            position: relative;
            overflow: hidden;
        }
        
        .character-section::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .character-header {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
            position: relative;
            z-index: 2;
        }
        
        .character-avatar {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            margin-right: 24px;
            object-fit: cover;
            border: 3px solid rgba(255,255,255,0.3);
            background: rgba(255,255,255,0.1);
        }
        
        .character-name {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 0;
        }
        
        .character-role {
            font-size: 0.9rem;
            opacity: 0.9;
            margin: 4px 0 0 0;
        }
        
        .character-message {
            position: relative;
            z-index: 2;
            line-height: 1.7;
            font-size: 1rem;
        }
        
        .sofia-section {
            --character-bg-start: #ec4899;
            --character-bg-end: #be185d;
            --character-text: white;
        }
        
        .drvita-section {
            --character-bg-start: #3b82f6;
            --character-bg-end: #1d4ed8;
            --character-text: white;
        }
        
        .recommendations {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 16px;
            padding: 24px;
            margin-top: 24px;
        }
        
        .recommendations h3 {
            color: #1e293b;
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .recommendations ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .recommendations li {
            background: white;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 8px;
            border-left: 4px solid #4f46e5;
            font-size: 0.9rem;
            color: #374151;
        }
        
        .footer {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            text-align: center;
            padding: 40px;
        }
        
        .footer-content {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .footer h3 {
            margin-top: 0;
            margin-bottom: 16px;
            font-weight: 600;
        }
        
        .footer p {
            margin-bottom: 8px;
            opacity: 0.9;
        }
        
        .footer a {
            color: #60a5fa;
            text-decoration: none;
        }
        
        .footer small {
            opacity: 0.7;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 16px;
            }
            
            .header {
                padding: 40px 20px;
            }
            
            .header h1 {
                font-size: 2.5rem;
            }
            
            .dashboard-grid,
            .content {
                padding: 20px;
            }
            
            .dashboard-grid {
                margin: -10px 20px 20px 20px;
                grid-template-columns: 1fr;
            }
            
            .character-header {
                flex-direction: column;
                text-align: center;
            }
            
            .character-avatar {
                margin-right: 0;
                margin-bottom: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>⚕️ Dr. Vita</h1>
                <div class="header-subtitle">Relatório Semanal de Saúde</div>
                <div class="header-date">${user.full_name} • ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
        </div>

        <!-- Dashboard Principal -->
        <div class="dashboard-grid">
            <div class="dashboard-card card-preventive">
                <div class="card-header">
                    <div class="card-icon">🔍</div>
                    <div class="card-title">Análise Preventiva</div>
                </div>
                <div class="card-value">Ativa</div>
                <div class="card-label">Dr. Vital disponível</div>
                <div class="card-trend trend-positive">✓ Monitoramento ativo</div>
            </div>

            <div class="dashboard-card card-health-score">
                <div class="card-header">
                    <div class="card-icon">❤️</div>
                    <div class="card-title">Score de Saúde</div>
                </div>
                <div class="card-value">${healthScore}/100</div>
                <div class="card-label">Excelente!</div>
                <div class="card-trend ${healthScore >= 80 ? 'trend-positive' : healthScore >= 60 ? 'trend-neutral' : 'trend-negative'}">
                    ${healthScore >= 80 ? '↗️ Muito bom' : healthScore >= 60 ? '→ Moderado' : '↘️ Precisa atenção'}
                </div>
            </div>

            <div class="dashboard-card card-conversations">
                <div class="card-header">
                    <div class="card-icon">💬</div>
                    <div class="card-title">Conversas Sofia & Dr. Vital</div>
                </div>
                <div class="card-value">${weeklyConversations}</div>
                <div class="card-label">Este mês</div>
                <div class="card-trend ${weeklyConversations >= 5 ? 'trend-positive' : weeklyConversations >= 2 ? 'trend-neutral' : 'trend-negative'}">
                    ${weeklyConversations >= 5 ? '✨ Muito ativo' : weeklyConversations >= 2 ? '👍 Bom engajamento' : '📢 Fale mais conosco'}
                </div>
            </div>

            <div class="dashboard-card card-analysis">
                <div class="card-header">
                    <div class="card-icon">🔍</div>
                    <div class="card-title">Última Análise</div>
                </div>
                <div class="card-value">${daysSinceLastAnalysis}</div>
                <div class="card-label">dias atrás</div>
                <div class="card-trend ${daysSinceLastAnalysis <= 2 ? 'trend-positive' : daysSinceLastAnalysis <= 7 ? 'trend-neutral' : 'trend-negative'}">
                    ${daysSinceLastAnalysis <= 2 ? '🔥 Recente' : daysSinceLastAnalysis <= 7 ? '⏰ Esta semana' : '⚠️ Há muito tempo'}
                </div>
            </div>
        </div>

        <div class="content">
            <!-- Seção da Sofia -->
            <div class="character-section sofia-section">
                <div class="character-header">
                    <img src="https://hlrkoyywjpckdotimtik.supabase.co/storage/v1/object/public/course-thumbnails/Sofia%20sem%20fundo.png" 
                         alt="Sofia" 
                         class="character-avatar"
                         style="background: rgba(255,255,255,0.1);">
                    <div>
                        <h3 class="character-name">💝 Sofia</h3>
                        <p class="character-role">Sua assistente virtual de saúde</p>
                    </div>
                </div>
                <div class="character-message">
                    ${sofiaMessage}
                </div>
            </div>

            <!-- Seção do Dr. Vital -->
            <div class="character-section drvita-section">
                <div class="character-header">
                    <img src="https://hlrkoyywjpckdotimtik.supabase.co/storage/v1/object/public/course-thumbnails/Dr.Vital%20sem%20fundo.png" 
                         alt="Dr. Vital" 
                         class="character-avatar"
                         style="background: rgba(255,255,255,0.1);">
                    <div>
                        <h3 class="character-name">🩺 Dr. Vital</h3>
                        <p class="character-role">Análise médica personalizada</p>
                    </div>
                </div>
                <div class="character-message">
                    ${drVitaMessage}
                </div>
                
                <div class="recommendations">
                    <h3>🎯 Recomendações Personalizadas</h3>
                    <ul>
                        <li>💧 Mantenha a hidratação acima de 55% (atual: ${aguaCorporal.toFixed(1)}%)</li>
                        <li>🏃‍♀️ Continue com exercícios regulares para manter massa muscular</li>
                        <li>🍎 Dieta balanceada para otimizar composição corporal</li>
                        ${gorduraVisceral > 10 ? '<li>⚠️ Atenção à gordura visceral - considere cardio intenso</li>' : '<li>✅ Gordura visceral em níveis saudáveis</li>'}
                    </ul>
                </div>
            </div>

            <!-- Métricas de Saúde -->
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">📊</div>
                    <h2>Suas Métricas de Saúde</h2>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${latestMeasurement?.peso_kg?.toFixed(1) || 'N/A'} kg</div>
                        <div class="metric-label">Peso Atual</div>
                        <div class="metric-change ${weightChange < 0 ? 'trend-positive' : weightChange > 0 ? 'trend-negative' : 'trend-neutral'}">
                            ${weightChange !== 0 ? (weightChange > 0 ? `+${weightChange.toFixed(1)}kg` : `${weightChange.toFixed(1)}kg`) : 'Sem alteração'}
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${imc.toFixed(1)}</div>
                        <div class="metric-label">IMC</div>
                        <div class="metric-change ${imc >= 18.5 && imc <= 24.9 ? 'trend-positive' : 'trend-neutral'}">
                            ${imc < 18.5 ? '⚠️ Abaixo do peso' : imc <= 24.9 ? '✅ Peso normal' : imc <= 29.9 ? '⚠️ Sobrepeso' : '🔴 Obesidade'}
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${gorduraCorporal.toFixed(1)}%</div>
                        <div class="metric-label">Gordura Corporal</div>
                        <div class="metric-change ${gorduraCorporal <= 25 ? 'trend-positive' : 'trend-neutral'}">
                            ${gorduraCorporal <= 20 ? '🟢 Excelente' : gorduraCorporal <= 25 ? '✅ Bom' : gorduraCorporal <= 30 ? '⚠️ Moderado' : '🔴 Elevado'}
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${aguaCorporal.toFixed(1)}%</div>
                        <div class="metric-label">Hidratação</div>
                        <div class="metric-change ${aguaCorporal >= 55 ? 'trend-positive' : 'trend-neutral'}">
                            ${aguaCorporal >= 55 ? '🟢 Ótima' : aguaCorporal >= 50 ? '✅ Boa' : aguaCorporal >= 45 ? '⚠️ Regular' : '🔴 Baixa'}
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${gorduraVisceral}</div>
                        <div class="metric-label">Gordura Visceral</div>
                        <div class="metric-change ${gorduraVisceral <= 9 ? 'trend-positive' : gorduraVisceral <= 12 ? 'trend-neutral' : 'trend-negative'}">
                            ${gorduraVisceral <= 9 ? '🟢 Saudável' : gorduraVisceral <= 12 ? '⚠️ Atenção' : '🔴 Alto risco'}
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${metabolismo}</div>
                        <div class="metric-label">Metabolismo Basal</div>
                        <div class="metric-change trend-neutral">kcal/dia</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${massaMuscular.toFixed(1)} kg</div>
                        <div class="metric-label">Massa Muscular</div>
                        <div class="metric-change ${massaMuscular >= 40 ? 'trend-positive' : 'trend-neutral'}">
                            ${massaMuscular >= 40 ? '🟢 Excelente' : massaMuscular >= 35 ? '✅ Boa' : '⚠️ Baixa'}
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${achievements.length}</div>
                        <div class="metric-label">Conquistas</div>
                        <div class="metric-change trend-positive">esta semana</div>
                    </div>
                </div>
            </div>

            <!-- Análise Completa de Sua Evolução -->
            ${measurements.length > 0 ? `
            <div class="section">
                <h2>📈 Análise Completa de Sua Evolução</h2>
                
                <!-- Resumo Principal -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].peso_kg}kg</div>
                        <div class="stat-label">Peso Atual</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].peso_kg}kg` : ''}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].imc?.toFixed(1) || 'N/A'}</div>
                        <div class="stat-label">IMC</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].imc?.toFixed(1) || 'N/A'}` : ''}</div>
                    </div>
                    ${measurements[0].gordura_corporal_percent ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].gordura_corporal_percent.toFixed(1)}%</div>
                        <div class="stat-label">Gordura Corporal</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].gordura_corporal_percent?.toFixed(1) || 0}%` : ''}</div>
                    </div>
                    ` : ''}
                    ${measurements[0].agua_corporal_percent ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].agua_corporal_percent.toFixed(1)}%</div>
                        <div class="stat-label">Água Corporal</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].agua_corporal_percent?.toFixed(1) || 0}%` : ''}</div>
                    </div>
                    ` : ''}
                    ${measurements[0].massa_muscular_kg ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].massa_muscular_kg.toFixed(1)}kg</div>
                        <div class="stat-label">Massa Muscular</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].massa_muscular_kg?.toFixed(1) || 0}kg` : ''}</div>
                    </div>
                    ` : ''}
                    ${measurements[0].massa_ossea_kg ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].massa_ossea_kg.toFixed(1)}kg</div>
                        <div class="stat-label">Massa Óssea</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].massa_ossea_kg?.toFixed(1) || 0}kg` : ''}</div>
                    </div>
                    ` : ''}
                    ${measurements[0].metabolismo_basal_kcal ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].metabolismo_basal_kcal}</div>
                        <div class="stat-label">Metabolismo Basal (kcal)</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].metabolismo_basal_kcal || 0}` : ''}</div>
                    </div>
                    ` : ''}
                    ${measurements[0].gordura_visceral_nivel ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].gordura_visceral_nivel}</div>
                        <div class="stat-label">Gordura Visceral</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].gordura_visceral_nivel || 0}` : ''}</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min((measurements.length / 7) * 100, 100)}%"></div>
                </div>
                <p>Medições realizadas: ${measurements.length}/7 dias</p>
            </div>
            ` : ''}

            <!-- Hábitos de Saúde -->
            ${healthDiary.length > 0 ? `
            <div class="section">
                <h2>🌟 Hábitos de Saúde</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${(healthDiary.reduce((sum, h) => sum + (h.water_intake || 0), 0) / healthDiary.length).toFixed(1)}L</div>
                        <div class="stat-label">Água Média/Dia</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${(healthDiary.reduce((sum, h) => sum + (h.sleep_hours || 0), 0) / healthDiary.length).toFixed(1)}h</div>
                        <div class="stat-label">Sono Médio/Noite</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${(healthDiary.reduce((sum, h) => sum + (h.exercise_minutes || 0), 0) / healthDiary.length).toFixed(0)}min</div>
                        <div class="stat-label">Exercício Médio/Dia</div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Conquistas -->
            ${achievements.length > 0 ? `
            <div class="section">
                <h2>🏆 Novas Conquistas</h2>
                ${achievements.map(achievement => `
                    <div class="achievement">
                        <div class="achievement-icon">${achievement.icon || '🏆'}</div>
                        <div>
                            <strong>${achievement.title}</strong><br>
                            <small>${achievement.description}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Exames Analisados -->
            ${examAnalyses.length > 0 ? `
            <div class="section">
                <h2>🔬 Exames Analisados</h2>
                ${examAnalyses.map(exam => `
                    <div style="background: white; padding: 15px; border-radius: 10px; margin: 10px 0;">
                        <strong>📋 ${exam.exam_type}</strong> - ${new Date(exam.created_at).toLocaleDateString('pt-BR')}<br>
                        <small>${exam.analysis_result.substring(0, 200)}...</small>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Análise IA -->
            ${weeklyAnalysis ? `
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">🤖</div>
                    <h2>Análise Inteligente</h2>
                </div>
                <div class="metric-card">
                    <div class="metric-value">Tendência: ${weeklyAnalysis.tendencia}</div>
                    ${weeklyAnalysis.observacoes ? `<div class="metric-label">${weeklyAnalysis.observacoes}</div>` : ''}
                </div>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <div class="footer-content">
                <h3>🏥 Instituto dos Sonhos</h3>
                <p>Transformando vidas através da saúde e bem-estar</p>
                <p>📱 Continue acompanhando sua evolução através da nossa plataforma</p>
                <p>Este relatório foi gerado automaticamente pelo <a href="#">Dr. Vital IA</a></p>
                <p><small>⚠️ Este relatório não substitui consulta médica profissional</small></p>
                <p><small>© ${new Date().getFullYear()} Instituto dos Sonhos - Todos os direitos reservados</small></p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Função para gerar mensagem personalizada da Sof.ia baseada nas conversas reais
function generateSofiaMessage(userName: string, conversationCount: number): string {
  if (conversationCount === 0) {
    return `
      <p><strong>"Olá, ${userName}! 💕"</strong></p>
      <p>"Notei que não conversamos esta semana. Sinto sua falta! 😊"</p>
      <p>"Estou aqui esperando por você sempre que precisar. Seja para compartilhar como foi seu dia, tirar dúvidas sobre saúde ou simplesmente desabafar - estou pronta para ouvir!"</p>
      <p>"<strong>Quando conversamos regularmente, posso criar relatórios muito mais precisos e personalizados para você.</strong> Cada conversa me ensina mais sobre seus hábitos, sentimentos e objetivos."</p>
      <p style="text-align: right; margin-top: 15px;"><em>Esperando você no chat! 💖<br>Sof.ia</em></p>
    `;
  } else if (conversationCount >= 1 && conversationCount <= 2) {
    return `
      <p><strong>"Olá, ${userName}! 💕"</strong></p>
      <p>"Que bom que conversamos ${conversationCount === 1 ? 'uma vez' : 'algumas vezes'} esta semana! Cada conversa é especial para mim."</p>
      <p>"Já posso começar a entender melhor seus hábitos e sentimentos, mas confesso que gostaria de conversar mais com você! 😊"</p>
      <p>"<strong>Quanto mais conversamos, mais preciso fica este relatório.</strong> Posso dar sugestões mais personalizadas e entender melhor como você está se sentindo dia a dia."</p>
      <p style="text-align: right; margin-top: 15px;"><em>Vamos conversar mais? 💖<br>Sof.ia</em></p>
    `;
  } else if (conversationCount >= 3 && conversationCount <= 5) {
    return `
      <p><strong>"Olá, ${userName}! 💕"</strong></p>
      <p>"Adorei nossas ${conversationCount} conversas esta semana! Estou começando a conhecer você cada vez melhor."</p>
      <p>"Posso perceber seus padrões, entender como você reage às diferentes situações e isso me permite dar conselhos mais assertivos."</p>
      <p>"Continue assim! Nossa conexão está ficando mais forte a cada conversa, e isso reflete diretamente na qualidade dos seus relatórios de saúde."</p>
      <p style="text-align: right; margin-top: 15px;"><em>Continue confiando em mim! 💖<br>Sof.ia</em></p>
    `;
  } else {
    return `
      <p><strong>"Querido(a) ${userName}! 💕"</strong></p>
      <p>"Que semana maravilhosa! Conversamos ${conversationCount} vezes - isso mostra o quanto você confia em mim e valoriza nossa conexão."</p>
      <p>"Com tantas conversas, posso entender profundamente seus sentimentos, acompanhar suas oscilações de humor, celebrar suas vitórias e apoiar nos momentos difíceis."</p>
      <p>"<strong>Esse nível de interação me permite criar os relatórios mais precisos e personalizados possíveis!</strong> Cada detalhe que você compartilha enriquece minha compreensão sobre você."</p>
      <p style="text-align: right; margin-top: 15px;"><em>Obrigada por confiar tanto em mim! 💖<br>Sof.ia</em></p>
    `;
  }
}

// Função para gerar análise médica do Dr. Vita
function generateDrVitaAnalysis(measurements: any[], bioimpedanceData: any[], physicalData: any, userName: string): string {
  if (measurements.length === 0) {
    return `
      <p><strong>"${userName}, aqui é o Dr. Vita."</strong></p>
      <p>"Não identifiquei medições de bioimpedância nesta semana. Como seu agente pessoal de saúde, preciso de dados regulares para fornecer análises precisas."</p>
      <p>"<strong>Recomendação médica:</strong> Realize pesagens regulares para monitoramento adequado da composição corporal."</p>
      <p style="text-align: right; margin-top: 15px;"><em>Dr. Vita - Seu Agente Pessoal de Saúde</em></p>
    `;
  }

  const latest = measurements[0];
  const imc = latest.imc || 0;
  const gorduraCorporal = latest.gordura_corporal_percent || 0;
  const aguaCorporal = latest.agua_corporal_percent || 0;
  const gorduraVisceral = latest.gordura_visceral_nivel || 0;
  const massaMuscular = latest.massa_muscular_kg || 0;
  const metabolismo = latest.metabolismo_basal_kcal || 0;

  let imcStatus = '';
  let imcRecomendacao = '';
  
  if (imc < 18.5) {
    imcStatus = 'BAIXO PESO';
    imcRecomendacao = 'Necessário ganho de peso controlado com acompanhamento nutricional.';
  } else if (imc < 25) {
    imcStatus = 'PESO NORMAL';
    imcRecomendacao = 'Excelente! Mantenha este peso com hábitos saudáveis.';
  } else if (imc < 30) {
    imcStatus = 'SOBREPESO';
    imcRecomendacao = 'Perda de peso gradual (0,5-1kg/semana) recomendada.';
  } else {
    imcStatus = 'OBESIDADE';
    imcRecomendacao = 'Necessário programa estruturado de perda de peso com acompanhamento médico.';
  }

  let gorduraStatus = '';
  if (gorduraCorporal > 0) {
    if (gorduraCorporal < 10) gorduraStatus = 'muito baixa';
    else if (gorduraCorporal < 20) gorduraStatus = 'adequada';
    else if (gorduraCorporal < 30) gorduraStatus = 'elevada';
    else gorduraStatus = 'muito elevada';
  }

  let hidratacaoStatus = '';
  if (aguaCorporal > 0) {
    if (aguaCorporal < 45) hidratacaoStatus = 'DESIDRATAÇÃO DETECTADA';
    else if (aguaCorporal < 55) hidratacaoStatus = 'hidratação adequada';
    else hidratacaoStatus = 'excelente hidratação';
  }

  let visceralRisco = '';
  if (gorduraVisceral > 0) {
    if (gorduraVisceral <= 12) visceralRisco = 'baixo risco metabólico';
    else if (gorduraVisceral <= 15) visceralRisco = 'risco moderado';
    else visceralRisco = 'ALTO RISCO METABÓLICO';
  }

  return `
    <p><strong>"${userName}, aqui é o Dr. Vita, seu agente pessoal de saúde."</strong></p>
    
    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h4 style="color: white; margin-top: 0;">📊 ANÁLISE MÉDICA ATUAL:</h4>
      <p><strong>IMC ${imc.toFixed(1)}:</strong> ${imcStatus}</p>
      ${gorduraCorporal > 0 ? `<p><strong>Gordura Corporal:</strong> ${gorduraCorporal.toFixed(1)}% (${gorduraStatus})</p>` : ''}
      ${aguaCorporal > 0 ? `<p><strong>Hidratação:</strong> ${aguaCorporal.toFixed(1)}% (${hidratacaoStatus})</p>` : ''}
      ${gorduraVisceral > 0 ? `<p><strong>Gordura Visceral:</strong> Nível ${gorduraVisceral} (${visceralRisco})</p>` : ''}
      ${metabolismo > 0 ? `<p><strong>Metabolismo Basal:</strong> ${metabolismo} kcal/dia</p>` : ''}
    </div>

    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h4 style="color: white; margin-top: 0;">🩺 PRESCRIÇÕES MÉDICAS:</h4>
      <p><strong>1. Controle de Peso:</strong> ${imcRecomendacao}</p>
      ${aguaCorporal > 0 && aguaCorporal < 50 ? '<p><strong>2. Hidratação:</strong> Aumente ingesta hídrica para 2-3L/dia.</p>' : ''}
      ${gorduraVisceral > 12 ? '<p><strong>3. Risco Metabólico:</strong> Exercícios aeróbicos 150min/semana + resistência muscular.</p>' : ''}
      ${massaMuscular > 0 && massaMuscular < 30 ? '<p><strong>4. Massa Muscular:</strong> Protocolo de treino de força + proteína 1,2g/kg/dia.</p>' : ''}
    </div>

    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h4 style="color: white; margin-top: 0;">⚠️ ALERTAS MÉDICOS:</h4>
      ${imc >= 30 ? '<p><span style="color: #ff6b6b;">⚠️</span> Obesidade requer acompanhamento médico especializado.</p>' : ''}
      ${gorduraVisceral > 15 ? '<p><span style="color: #ff6b6b;">⚠️</span> Alto risco cardiovascular e diabetes.</p>' : ''}
      ${aguaCorporal > 0 && aguaCorporal < 45 ? '<p><span style="color: #ff6b6b;">⚠️</span> Desidratação pode comprometer função renal.</p>' : ''}
    </div>

    <p><strong>"Como seu agente pessoal de saúde, estarei monitorando sua evolução semanalmente. Realize medições regulares para análises mais precisas."</strong></p>
    
    <p style="text-align: right; margin-top: 15px;"><em>Dr. Vita - Medicina Personalizada e Inteligente<br>Análise baseada em bioimpedância avançada</em></p>
  `;
}

// Função para gerar dados do gráfico
function generateChartData(measurements: any[]): string {
  if (measurements.length === 0) return 'null';

  const reversedMeasurements = [...measurements].reverse();
  const labels = reversedMeasurements.map(m => new Date(m.measurement_date).toLocaleDateString('pt-BR'));
  const weightData = reversedMeasurements.map(m => m.peso_kg);
  const imcData = reversedMeasurements.map(m => m.imc || 0);
  const bodyFatData = reversedMeasurements.map(m => m.gordura_corporal_percent || 0);

  return `{
    type: 'line',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [
        {
          label: 'Peso (kg)',
          data: ${JSON.stringify(weightData)},
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'IMC',
          data: ${JSON.stringify(imcData)},
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        },
        {
          label: 'Gordura Corporal (%)',
          data: ${JSON.stringify(bodyFatData)},
          borderColor: '#4ecdc4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.4,
          yAxisID: 'y2'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Data'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Peso (kg)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'IMC'
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        y2: {
          type: 'linear',
          display: false,
          position: 'right',
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Evolução de Indicadores de Saúde'
        }
      }
    }
  }`;
}

// Função para calcular score de saúde
function calculateHealthScore(latestMeasurement: any, healthDiary: any[]): number {
  if (!latestMeasurement) return 0;
  
  let score = 0;
  let factors = 0;
  
  // IMC Score (0-25 pontos)
  const imc = latestMeasurement.imc || 0;
  if (imc > 0) {
    if (imc >= 18.5 && imc <= 24.9) score += 25;
    else if (imc >= 25 && imc <= 29.9) score += 15;
    else if (imc >= 17 && imc <= 35) score += 10;
    else score += 5;
    factors++;
  }
  
  // Gordura Corporal Score (0-25 pontos)
  const gordura = latestMeasurement.gordura_corporal_percent || 0;
  if (gordura > 0) {
    if (gordura <= 20) score += 25;
    else if (gordura <= 25) score += 20;
    else if (gordura <= 30) score += 15;
    else score += 10;
    factors++;
  }
  
  // Hidratação Score (0-25 pontos)
  const agua = latestMeasurement.agua_corporal_percent || 0;
  if (agua > 0) {
    if (agua >= 55) score += 25;
    else if (agua >= 50) score += 20;
    else if (agua >= 45) score += 15;
    else score += 10;
    factors++;
  }
  
  // Gordura Visceral Score (0-25 pontos)
  const visceral = latestMeasurement.gordura_visceral_nivel || 0;
  if (visceral > 0) {
    if (visceral <= 9) score += 25;
    else if (visceral <= 12) score += 20;
    else if (visceral <= 15) score += 15;
    else score += 10;
    factors++;
  }
  
  return factors > 0 ? Math.round(score / factors) : 85;
}