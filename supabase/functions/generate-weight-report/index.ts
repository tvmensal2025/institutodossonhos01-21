import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface WeightReportData {
  user: any;
  measurements: any[];
  bioimpedance: any[];
  conversations: any[];
  healthDiary: any[];
  missions: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, reportType = 'monthly', sendEmail = false } = await req.json();
    
    if (!userId) {
      throw new Error('UserId é obrigatório');
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados dos últimos 30 dias para análise completa
    const daysBack = reportType === 'weekly' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const [
      { data: user },
      { data: measurements },
      { data: bioimpedance },
      { data: conversations },
      { data: healthDiary },
      { data: missions }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('weight_measurements').select('*').eq('user_id', userId).gte('measurement_date', startDate.toISOString().split('T')[0]).order('measurement_date', { ascending: false }),
      supabase.from('bioimpedance_analysis').select('*').eq('user_id', userId).gte('created_at', startDate.toISOString()).order('created_at', { ascending: false }),
      supabase.from('chat_conversations').select('*').eq('user_id', userId).gte('created_at', startDate.toISOString()),
      supabase.from('health_diary').select('*').eq('user_id', userId).gte('date', startDate.toISOString().split('T')[0]).order('date', { ascending: false }),
      supabase.from('daily_mission_sessions').select('*').eq('user_id', userId).gte('date', startDate.toISOString().split('T')[0]).order('date', { ascending: false })
    ]);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const reportData: WeightReportData = {
      user,
      measurements: measurements || [],
      bioimpedance: bioimpedance || [],
      conversations: conversations || [],
      healthDiary: healthDiary || [],
      missions: missions || []
    };

    // Gerar relatório HTML
    const reportHTML = generateWeightReportHTML(reportData, reportType);

    if (sendEmail) {
      // Enviar por email
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      
      const { error } = await resend.emails.send({
        from: 'Dr. Vita <reports@seudominio.com>',
        to: [user.email],
        subject: `📊 Seu Relatório Detalhado de Pesagem - ${new Date().toLocaleDateString('pt-BR')}`,
        html: reportHTML,
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      reportHTML,
      data: {
        measurementCount: measurements?.length || 0,
        conversationCount: conversations?.length || 0,
        lastMeasurement: measurements?.[0] || null
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de pesagem:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateWeightReportHTML(data: WeightReportData, reportType: string): string {
  const { user, measurements, bioimpedance, conversations, healthDiary, missions } = data;
  
  // Análise dos dados
  const latestMeasurement = measurements[0];
  const conversationCount = conversations.length;
  const measurementCount = measurements.length;
  
  // Calcular tendências
  const weightTrend = measurements.length >= 2 ? 
    (measurements[0].peso_kg - measurements[measurements.length - 1].peso_kg) : 0;
  
  const avgMood = healthDiary.length > 0 ? 
    healthDiary.reduce((sum, h) => sum + (h.mood_rating || 0), 0) / healthDiary.length : 0;
  
  const avgWater = healthDiary.length > 0 ? 
    healthDiary.reduce((sum, h) => sum + (h.water_intake || 0), 0) / healthDiary.length : 0;

  // Gerar mensagens personalizadas
  const sofiaMessage = generateSofiaWeightMessage(user.full_name, conversationCount, measurementCount);
  const drVitaMessage = generateDrVitaAnalysis(latestMeasurement, weightTrend, avgMood, avgWater, measurementCount);
  
  // Gerar dados para gráficos
  const chartData = generateChartData(measurements, bioimpedance);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Detalhado de Pesagem - Dr. Vita</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .content {
            padding: 40px;
        }
        .message-sofia {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            border-radius: 20px;
            padding: 30px;
            margin: 30px 0;
            border-left: 5px solid #ff6b6b;
        }
        .message-doctor {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            border-radius: 20px;
            padding: 30px;
            margin: 30px 0;
            border-left: 5px solid #00d2ff;
        }
        .data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .data-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            border-left: 5px solid #667eea;
        }
        .data-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .data-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .chart-container {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
        }
        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 20px 0;
        }
        .chart-item {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .footer {
            background: #2d3436;
            color: white;
            text-align: center;
            padding: 30px;
        }
        .trend-up { color: #00b894; }
        .trend-down { color: #e17055; }
        .trend-stable { color: #fdcb6e; }
        .recommendation {
            background: #e3f2fd;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #2196f3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 DR. VITA</h1>
            <p>Relatório Detalhado de Pesagem e Bioimpedância</p>
            <p style="opacity: 0.8;">${user.full_name} • ${new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
        </div>

        <div class="content">
            <!-- Mensagem da Sof.ia -->
            <div class="message-sofia">
                <h2 style="color: #2d3436; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                    💕 Mensagem Carinhosa da Sof.ia
                </h2>
                <div style="color: #2d3436; font-style: italic; line-height: 1.6;">
                    ${sofiaMessage}
                </div>
            </div>

            <!-- Dados Principais -->
            ${latestMeasurement ? `
            <div class="data-grid">
                <div class="data-card">
                    <div class="data-value">${latestMeasurement.peso_kg}kg</div>
                    <div class="data-label">Peso Atual</div>
                </div>
                <div class="data-card">
                    <div class="data-value">${latestMeasurement.imc?.toFixed(1) || 'N/A'}</div>
                    <div class="data-label">IMC</div>
                </div>
                <div class="data-card">
                    <div class="data-value">${latestMeasurement.gordura_corporal_percent?.toFixed(1) || 'N/A'}%</div>
                    <div class="data-label">Gordura Corporal</div>
                </div>
                <div class="data-card">
                    <div class="data-value">${latestMeasurement.agua_corporal_percent?.toFixed(1) || 'N/A'}%</div>
                    <div class="data-label">Água Corporal</div>
                </div>
                <div class="data-card">
                    <div class="data-value">${latestMeasurement.massa_muscular_kg?.toFixed(1) || 'N/A'}kg</div>
                    <div class="data-label">Massa Muscular</div>
                </div>
                <div class="data-card">
                    <div class="data-value">${latestMeasurement.massa_ossea_kg?.toFixed(1) || 'N/A'}kg</div>
                    <div class="data-label">Massa Óssea</div>
                </div>
                <div class="data-card">
                    <div class="data-value">${latestMeasurement.metabolismo_basal || 'N/A'}</div>
                    <div class="data-label">Metabolismo Basal</div>
                </div>
                <div class="data-card">
                    <div class="data-value">${latestMeasurement.gordura_visceral_nivel || 'N/A'}</div>
                    <div class="data-label">Gordura Visceral</div>
                </div>
            </div>
            ` : '<p style="text-align: center; color: #666;">Nenhuma medição recente encontrada.</p>'}

            <!-- Gráficos -->
            <div class="chart-container">
                <h2 style="color: #667eea; margin-bottom: 30px;">📊 Evolução dos Dados</h2>
                <div class="chart-grid">
                    <div class="chart-item">
                        <h3 style="color: #667eea; text-align: center;">Peso (kg)</h3>
                        <canvas id="weightChart" width="300" height="200"></canvas>
                    </div>
                    <div class="chart-item">
                        <h3 style="color: #667eea; text-align: center;">IMC</h3>
                        <canvas id="imcChart" width="300" height="200"></canvas>
                    </div>
                    <div class="chart-item">
                        <h3 style="color: #667eea; text-align: center;">Gordura Corporal (%)</h3>
                        <canvas id="fatChart" width="300" height="200"></canvas>
                    </div>
                    <div class="chart-item">
                        <h3 style="color: #667eea; text-align: center;">Massa Muscular (kg)</h3>
                        <canvas id="muscleChart" width="300" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Análise do Dr. Vita -->
            <div class="message-doctor">
                <h2 style="color: #2d3436; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                    🩺 Análise Médica - Dr. Vita
                </h2>
                <div style="color: #2d3436; line-height: 1.6;">
                    ${drVitaMessage}
                </div>
            </div>
        </div>

        <div class="footer">
            <p>📱 Continue acompanhando sua saúde no Dr. Vita</p>
            <p>Este relatório foi gerado automaticamente com base em seus dados</p>
            <p><small>Relatório não substitui consulta médica profissional</small></p>
        </div>
    </div>

    <script>
        // Dados para os gráficos
        const chartData = ${JSON.stringify(chartData)};
        
        // Configuração comum dos gráficos
        const commonOptions = {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        };

        // Gráfico de Peso
        if (chartData.weight.length > 0) {
            new Chart(document.getElementById('weightChart'), {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: chartData.weight,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: commonOptions
            });
        }

        // Gráfico de IMC
        if (chartData.imc.length > 0) {
            new Chart(document.getElementById('imcChart'), {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: chartData.imc,
                        borderColor: '#00d2ff',
                        backgroundColor: 'rgba(0, 210, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: commonOptions
            });
        }

        // Gráfico de Gordura Corporal
        if (chartData.bodyFat.length > 0) {
            new Chart(document.getElementById('fatChart'), {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: chartData.bodyFat,
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: commonOptions
            });
        }

        // Gráfico de Massa Muscular
        if (chartData.muscle.length > 0) {
            new Chart(document.getElementById('muscleChart'), {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: chartData.muscle,
                        borderColor: '#00b894',
                        backgroundColor: 'rgba(0, 184, 148, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: commonOptions
            });
        }
    </script>
</body>
</html>`;
}

function generateSofiaWeightMessage(userName: string, conversationCount: number, measurementCount: number): string {
  let conversationFeedback = '';
  
  if (conversationCount === 0) {
    conversationFeedback = `
      <p><strong>Sinto sua falta!</strong> Não conversamos recentemente, e isso me deixa preocupada. 😢</p>
      <p>Sabia que quando conversamos regularmente, posso entender melhor seus hábitos, humor e motivações? Isso me permite dar conselhos muito mais precisos sobre sua jornada de saúde!</p>
    `;
  } else if (conversationCount <= 3) {
    conversationFeedback = `
      <p>Que bom que conversamos algumas vezes! Mas confesso que gostaria de conversar mais com você. 😊</p>
      <p><strong>Quanto mais conversamos, melhor posso ajudar!</strong> Suas conversas me ajudam a entender como você está se sentindo dia a dia.</p>
    `;
  } else {
    conversationFeedback = `
      <p>Adorei nossas ${conversationCount} conversas! Nossa conexão está ficando cada vez mais forte. 💕</p>
      <p>Com tantas conversas, posso oferecer orientações muito mais personalizadas e acompanhar de perto sua evolução.</p>
    `;
  }

  let measurementFeedback = '';
  if (measurementCount === 0) {
    measurementFeedback = `<p><strong>Vamos começar a se pesar regularmente?</strong> Os dados de pesagem são fundamentais para acompanhar sua evolução! 📊</p>`;
  } else if (measurementCount <= 5) {
    measurementFeedback = `<p>Você tem ${measurementCount} medições recentes. Que tal aumentar a frequência para acompanharmos melhor sua evolução? 📈</p>`;
  } else {
    measurementFeedback = `<p>Parabéns pela consistência! ${measurementCount} medições recentes mostram seu comprometimento. 🎉</p>`;
  }

  return `
    <p><strong>"Querido(a) ${userName}! 💕"</strong></p>
    ${conversationFeedback}
    ${measurementFeedback}
    <p><strong>Lembre-se:</strong> Estou sempre aqui para você - quanto mais dados compartilha comigo, mais precisa posso ser em meus conselhos!</p>
    <p style="text-align: right; margin-top: 20px;"><em>Com todo carinho, Sof.ia 💖</em></p>
  `;
}

function generateDrVitaAnalysis(measurement: any, weightTrend: number, avgMood: number, avgWater: number, measurementCount: number): string {
  if (!measurement) {
    return `
      <p><strong>Olá! Sou o Dr. Vita, seu agente pessoal de saúde.</strong></p>
      <p>Infelizmente, não tenho dados suficientes de pesagem para realizar uma análise completa. Para que eu possa ser seu melhor consultor de saúde, preciso de dados regulares.</p>
      <div class="recommendation">
        <strong>📋 Minha Recomendação Médica:</strong>
        <p>Comece a se pesar pelo menos 3x por semana, preferencialmente sempre no mesmo horário (manhã, em jejum). Isso me permitirá acompanhar suas tendências e oferecer orientações precisas.</p>
      </div>
    `;
  }

  const imc = measurement.imc || 0;
  const bodyFat = measurement.gordura_corporal_percent || 0;
  const water = measurement.agua_corporal_percent || 0;
  const visceralFat = measurement.gordura_visceral_nivel || 0;
  const muscle = measurement.massa_muscular_kg || 0;
  const bone = measurement.massa_ossea_kg || 0;
  const metabolism = measurement.metabolismo_basal || 0;

  // Análise do IMC
  let imcAnalysis = '';
  if (imc < 18.5) {
    imcAnalysis = '⚠️ **Baixo peso** - Recomendo consulta nutricional para ganho de peso saudável.';
  } else if (imc < 25) {
    imcAnalysis = '✅ **Peso normal** - Excelente! Mantenha este padrão.';
  } else if (imc < 30) {
    imcAnalysis = '⚠️ **Sobrepeso** - Foque em déficit calórico moderado e exercícios.';
  } else {
    imcAnalysis = '🚨 **Obesidade** - Importante buscar acompanhamento médico especializado.';
  }

  // Análise da gordura corporal
  let fatAnalysis = '';
  if (bodyFat > 0) {
    if (bodyFat < 10) {
      fatAnalysis = '⚠️ **Muito baixa** - Cuidado, gordura essencial insuficiente.';
    } else if (bodyFat < 20) {
      fatAnalysis = '✅ **Ideal** - Percentual excelente para saúde.';
    } else if (bodyFat < 30) {
      fatAnalysis = '⚠️ **Elevada** - Considere aumentar atividade física.';
    } else {
      fatAnalysis = '🚨 **Muito alta** - Priorize redução urgente.';
    }
  }

  // Análise da água corporal
  let waterAnalysis = '';
  if (water > 0) {
    if (water < 45) {
      waterAnalysis = '⚠️ **Desidratação** - Aumente significativamente a ingestão de água.';
    } else if (water < 60) {
      waterAnalysis = '⚠️ **Hidratação baixa** - Beba mais água ao longo do dia.';
    } else {
      waterAnalysis = '✅ **Bem hidratado** - Continue assim!';
    }
  }

  // Análise de tendência
  let trendAnalysis = '';
  if (measurementCount >= 2) {
    if (weightTrend > 1) {
      trendAnalysis = '📈 **Tendência de ganho** - Monitore se está alinhado com seus objetivos.';
    } else if (weightTrend < -1) {
      trendAnalysis = '📉 **Tendência de perda** - Ótimo se este é seu objetivo!';
    } else {
      trendAnalysis = '➡️ **Peso estável** - Manutenção consistente.';
    }
  }

  return `
    <p><strong>Olá! Sou o Dr. Vita, seu agente pessoal de saúde e bem-estar.</strong></p>
    <p>Analisei cuidadosamente seus dados de bioimpedância e tenho orientações importantes para você:</p>
    
    <div class="recommendation">
        <strong>📊 Análise do IMC (${imc.toFixed(1)}):</strong>
        <p>${imcAnalysis}</p>
    </div>

    ${bodyFat > 0 ? `
    <div class="recommendation">
        <strong>🔥 Gordura Corporal (${bodyFat.toFixed(1)}%):</strong>
        <p>${fatAnalysis}</p>
    </div>
    ` : ''}

    ${water > 0 ? `
    <div class="recommendation">
        <strong>💧 Hidratação (${water.toFixed(1)}%):</strong>
        <p>${waterAnalysis}</p>
    </div>
    ` : ''}

    ${visceralFat > 0 ? `
    <div class="recommendation">
        <strong>⚠️ Gordura Visceral (${visceralFat}):</strong>
        <p>${visceralFat <= 9 ? '✅ **Normal** - Risco baixo para doenças.' : '🚨 **Elevada** - Priorize exercícios e dieta anti-inflamatória.'}</p>
    </div>
    ` : ''}

    ${trendAnalysis ? `
    <div class="recommendation">
        <strong>📈 Tendência (${Math.abs(weightTrend).toFixed(1)}kg):</strong>
        <p>${trendAnalysis}</p>
    </div>
    ` : ''}

    <div class="recommendation">
        <strong>🎯 Minhas Recomendações Personalizadas:</strong>
        <ul>
            ${avgWater < 2 ? '<li>💧 Aumente ingestão de água para pelo menos 2L/dia</li>' : ''}
            ${bodyFat > 25 ? '<li>🏃‍♂️ Inclua 30min de cardio 4x/semana</li>' : ''}
            ${muscle < 30 ? '<li>💪 Adicione treino de força 2x/semana</li>' : ''}
            ${avgMood < 7 ? '<li>😊 Pratique atividades que melhorem seu humor</li>' : ''}
            <li>📊 Continue medições regulares - dados são fundamentais!</li>
            <li>💬 Converse mais com a Sof.ia para orientações personalizadas</li>
        </ul>
    </div>

    <p><strong>Lembre-se:</strong> Sou seu parceiro nesta jornada. Quanto mais dados precisos você me fornece, mais assertivas são minhas orientações para sua saúde ideal.</p>
    
    <p style="text-align: right; margin-top: 20px;"><em>Dr. Vita - Seu Agente Pessoal de Saúde 🩺</em></p>
  `;
}

function generateChartData(measurements: any[], bioimpedance: any[]): any {
  if (!measurements || measurements.length === 0) {
    return {
      labels: [],
      weight: [],
      imc: [],
      bodyFat: [],
      muscle: [],
      water: []
    };
  }

  // Pegar os últimos 10 dados e inverter para ordem cronológica
  const recentData = measurements.slice(0, 10).reverse();

  return {
    labels: recentData.map(m => new Date(m.measurement_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
    weight: recentData.map(m => m.peso_kg),
    imc: recentData.map(m => m.imc || 0),
    bodyFat: recentData.map(m => m.gordura_corporal_percent || 0),
    muscle: recentData.map(m => m.massa_muscular_kg || 0),
    water: recentData.map(m => m.agua_corporal_percent || 0)
  };
}