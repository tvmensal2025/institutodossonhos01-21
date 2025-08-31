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
  conversations: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📱 Iniciando processamento de relatórios para WhatsApp...');
    
    const body = await req.json().catch(() => ({}));
    const { userIds, customMessage, triggerType, testMode, testUser, whatsappNumber } = body;
    console.log('📋 Dados recebidos:', { userIds, customMessage, triggerType, testMode, testUser, whatsappNumber });

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase inicializado');

    // Buscar usuários
    console.log('🔍 Buscando usuários...');
    let users, usersError;
    
    if (testMode && testUser) {
      // Modo de teste - usar usuário fornecido
      console.log('🧪 Modo teste ativado - usando usuário fornecido');
      users = [testUser];
      usersError = null;
    } else if (triggerType === 'automatic_weekly') {
      // Buscar todos os usuários para envio automático
      console.log('📱 Envio automático - buscando todos os usuários...');
      const result = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .not('email', 'is', null);
      users = result.data;
      usersError = result.error;
    } else if (userIds && userIds.length > 0) {
      // Buscar usuários específicos
      console.log('👥 Envio manual - buscando usuários específicos...');
      const result = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      users = result.data;
      usersError = result.error;
    } else {
      throw new Error('Nenhum usuário especificado para envio de relatórios');
    }

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
    }

    console.log(`👥 ${users?.length || 0} usuários encontrados:`, users);

    const results = [];

    // Processar cada usuário
    for (const user of users || []) {
      try {
        console.log(`📊 Gerando relatório para: ${user.full_name}`);
        
        const reportData = await generateWeeklyReportData(supabase, user);
        console.log(`📋 Dados coletados para ${user.full_name}:`, {
          measurements: reportData.measurements.length,
          healthDiary: reportData.healthDiary.length,
          missions: reportData.missions.length
        });
        
        const reportHTML = await generateWhatsAppHTML(reportData, customMessage, whatsappNumber, supabase);
        console.log(`📝 HTML gerado para ${user.full_name} (${reportHTML.length} chars)`);
        
        results.push({
          user_id: user.user_id,
          name: user.full_name,
          email: user.email,
          html: reportHTML,
          status: 'generated'
        });

        console.log(`Relatório preparado para WhatsApp: ${user.full_name}`);
        
      } catch (error) {
        console.error(`Erro ao gerar relatório para ${user.full_name}:`, error);
        results.push({
          user_id: user.user_id,
          name: user.full_name,
          email: user.email,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Relatórios gerados para WhatsApp para ${users?.length || 0} usuários`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento de relatórios para WhatsApp:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateWhatsAppHTML(data: WeeklyReportData, customMessage?: string, whatsappNumber?: string, supabase?: any): Promise<string> {
  const { user, measurements, healthDiary, missions, weeklyAnalysis, achievements, examAnalyses, conversations } = data;
  
  // Calcular estatísticas
  const weightChange = measurements.length >= 2 ? 
    (measurements[0].peso_kg - measurements[measurements.length - 1].peso_kg) : 0;
  
  const avgEnergy = healthDiary.length > 0 ? 
    healthDiary.reduce((sum, h) => sum + (h.energy_level || 0), 0) / healthDiary.length : 0;
  
  const completedMissions = missions.filter(m => m.is_completed).length;
  const totalPoints = missions.reduce((sum, m) => sum + (m.total_points || 0), 0);

  const avgWater = healthDiary.length > 0 ? 
    healthDiary.reduce((sum, h) => sum + (h.water_intake || 0), 0) / healthDiary.length : 0;
  const avgSleep = healthDiary.length > 0 ? 
    healthDiary.reduce((sum, h) => sum + (h.sleep_hours || 0), 0) / healthDiary.length : 0;
  const avgExercise = healthDiary.length > 0 ? 
    healthDiary.reduce((sum, h) => sum + (h.exercise_minutes || 0), 0) / healthDiary.length : 0;

  // Contar conversas para mensagem personalizada
  const weeklyConversations = conversations.length;
  
  // Gerar feedback do Dr. Vita baseado nos dados biomédicos completos (com IA dinâmica)
  const drVitaFeedback = await generateDrVitaFeedback(supabase, user.full_name, {
    weightChange,
    measurements: measurements.length,
    completedMissions,
    avgWater,
    avgSleep,
    avgExercise,
    avgEnergy,
    conversations: weeklyConversations,
    latestMeasurement: measurements.length > 0 ? measurements[0] : null
  });
  
  // Gerar mensagem da Sof.ia baseada nas conversas reais
  const sofiaMessage = generateSofiaMessage(user.full_name, weeklyConversations);

  // Criar dados do gráfico de evolução (versão simplificada para WhatsApp)
  const weightEvolutionData = generateSimpleWeightChart(measurements);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dr. Vita - Relatório via WhatsApp</title>
    <style>
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 10px;
            font-size: 14px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px 15px;
        }
        .header h1 {
            margin: 0;
            font-size: 1.8em;
            font-weight: 300;
        }
        .content {
            padding: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .stat-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #666;
            font-size: 0.8em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .section {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        .section h3 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 1.2em;
        }
        .vita-feedback {
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white;
            border-left: 4px solid #0984e3;
        }
        .vita-feedback h3 {
            color: white;
        }
        .sofia-message {
            background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
            color: #2d3436;
            border-left: 4px solid #e17055;
        }
        .sofia-message h3 {
            color: #2d3436;
        }
        .chart-container {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
        }
        .custom-message {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            border-left: 4px solid #2196f3;
        }
        .whatsapp-info {
            background: #25D366;
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 DR. VITA</h1>
            <p>Relatório Semanal - WhatsApp</p>
            <p style="opacity: 0.8; font-size: 0.9em;">${new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
        </div>

        <div class="content">
            <h2 style="margin-bottom: 15px;">Olá, ${user.full_name}! 👋</h2>
            
            ${whatsappNumber ? `
            <div class="whatsapp-info">
                <p style="margin: 0; font-weight: bold;">📱 Preparado para WhatsApp: ${whatsappNumber}</p>
            </div>` : ''}
            
            ${customMessage ? `
            <div class="custom-message">
                <h3 style="margin: 0 0 10px 0; color: #1976d2;">📝 Mensagem Personalizada</h3>
                <p style="margin: 0;">${customMessage}</p>
            </div>` : ''}

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg</div>
                    <div class="stat-label">Variação de Peso</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgEnergy.toFixed(1)}/10</div>
                    <div class="stat-label">Energia Média</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${completedMissions}</div>
                    <div class="stat-label">Missões Completas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${totalPoints}</div>
                    <div class="stat-label">Pontos</div>
                </div>
            </div>

            ${measurements.length > 0 ? `
            <div class="section">
                <h3>⚖️ Dados Corporais</h3>
                <p><strong>📊 Última pesagem:</strong> ${measurements[0].peso_kg}kg</p>
                ${measurements[0].imc ? `<p><strong>📈 IMC:</strong> ${measurements[0].imc.toFixed(1)}</p>` : ''}
                ${measurements[0].gordura_corporal_percent ? `<p><strong>🔥 Gordura:</strong> ${measurements[0].gordura_corporal_percent.toFixed(1)}%</p>` : ''}
                ${measurements[0].massa_muscular_kg ? `<p><strong>💪 Músculo:</strong> ${measurements[0].massa_muscular_kg.toFixed(1)}kg</p>` : ''}
                ${measurements[0].gordura_visceral ? `<p><strong>🎯 Gordura Visceral:</strong> ${measurements[0].gordura_visceral}</p>` : ''}
                <p><strong>📅 Medições:</strong> ${measurements.length}/7 dias</p>
            </div>` : ''}

            <!-- Feedback do Dr. Vita (IGUAL AO EMAIL) -->
            <div class="section vita-feedback">
                <h3>👨‍⚕️ Dr. Vita - Análise Biomédica</h3>
                <div style="color: white; line-height: 1.6;">
                    ${drVitaFeedback}
                </div>
            </div>

            <!-- Mensagem da Sof.ia -->
            <div class="section sofia-message">
                <h3>💝 Mensagem da Sof.ia</h3>
                <div style="color: #2d3436; font-style: italic; line-height: 1.6;">
                    ${sofiaMessage}
                </div>
            </div>

            <!-- Gráfico de Evolução do Peso -->
            ${measurements.length >= 2 ? `
            <div class="section">
                <h3>📈 Evolução do Peso</h3>
                <div class="chart-container">
                    ${weightEvolutionData}
                </div>
                <p style="margin-top: 10px; color: #666; font-size: 0.8em; text-align: center;">
                    Gráfico mostra sua evolução recente
                </p>
            </div>` : ''}

            <div style="background: #f0f8ff; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">🔒 Relatório confidencial e personalizado</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9em;">Continue sua jornada com o Dr. Vita!</p>
            </div>
        </div>

        <div style="background: #2d3436; color: white; text-align: center; padding: 15px;">
            <p>📱 Dr. Vita - Seu assistente de saúde</p>
            <p><small>Relatório gerado via WhatsApp</small></p>
        </div>
    </div>
</body>
</html>`;
}

// Função para buscar configuração de IA dinamicamente
async function getAIConfig(supabase: any, functionality: string) {
  const { data: config, error } = await supabase
    .from('ai_configurations')
    .select('service, model, max_tokens, temperature, preset_level')
    .eq('functionality', functionality)
    .eq('is_enabled', true)
    .single();

  if (error || !config) {
    console.log(`⚠️ Configuração não encontrada para ${functionality}, usando padrão`);
    return {
      service: 'gemini',
      model: 'gemini-1.5-pro',
      max_tokens: 2048,
      temperature: 0.7
    };
  }

  console.log(`✅ Configuração carregada para ${functionality}:`, config);
  return config;
}

// Função para gerar feedback médico usando configuração dinâmica de IA
async function generateDrVitaFeedback(supabase: any, userName: string, metrics: any): Promise<string> {
  const { 
    weightChange, measurements, completedMissions, avgWater, avgSleep, avgExercise, 
    avgEnergy, conversations, latestMeasurement 
  } = metrics;

  try {
    // Buscar configuração de IA para relatórios semanais
    const aiConfig = await getAIConfig(supabase, 'weekly_report');
    
    console.log(`🤖 WhatsApp Dr. Vita usando: ${aiConfig.service} ${aiConfig.model} (${aiConfig.max_tokens} tokens, temp: ${aiConfig.temperature})`);

    // Preparar dados para análise da IA
    const analysisData = {
      nome: userName,
      pesagens: measurements,
      variacaoPeso: weightChange,
      dadosRecentes: latestMeasurement ? {
        peso: latestMeasurement.peso_kg,
        imc: latestMeasurement.imc,
        riscoMetabolico: latestMeasurement.risco_metabolico,
        gorduraCorporal: latestMeasurement.gordura_corporal_percent,
        massaMuscular: latestMeasurement.massa_muscular_kg,
        aguaCorporal: latestMeasurement.agua_corporal_percent,
        gorduraVisceral: latestMeasurement.gordura_visceral,
        idadeMetabolica: latestMeasurement.idade_metabolica,
        circunferenciaAbdominal: latestMeasurement.circunferencia_abdominal_cm,
        massaOssea: latestMeasurement.massa_ossea_kg,
        metabolismoBasal: latestMeasurement.metabolismo_basal_kcal
      } : null,
      habitos: {
        energia: avgEnergy,
        agua: avgWater,
        sono: avgSleep,
        exercicio: avgExercise,
        missoesCompletas: completedMissions,
        conversasSofia: conversations
      }
    };

    let prompt = `
    Você é o Dr. Vita, um médico especialista em análise corporal e metabolismo. Analise os dados biomédicos completos do paciente ${userName} e forneça um feedback médico detalhado e personalizado em HTML.

    DADOS PARA ANÁLISE:
    ${JSON.stringify(analysisData, null, 2)}

    INSTRUÇÕES ESPECÍFICAS PARA WHATSAPP:
    1. Use linguagem médica profissional, mas acessível
    2. Analise TODOS os dados de composição corporal disponíveis
    3. Foque especialmente em: IMC, gordura visceral, massa muscular, idade metabólica
    4. Dê recomendações específicas baseadas nos dados reais
    5. Use emojis médicos apropriados (🩺⚕️📊💪🔬)
    6. Inclua análise de risco metabólico quando disponível
    7. Conecte os hábitos (sono, água, exercício) com os dados corporais
    8. MÁXIMO 8-10 parágrafos (formato WhatsApp)
    9. Retorne APENAS HTML puro sem markdown
    10. Seja MUITO ESPECÍFICO e técnico com base nos dados reais

    ESTRUTURA DO FEEDBACK:
    - Cumprimento profissional personalizado
    - Análise detalhada de peso e IMC com interpretação médica
    - Composição corporal completa (gordura, músculo, água, massa óssea)
    - Análise de riscos metabólicos e idade metabólica  
    - Correlação científica entre hábitos e resultados biomédicos
    - Recomendações médicas específicas e personalizadas
    - Orientações preventivas baseadas nos dados
    - Assinatura médica profissional

    Retorne apenas o conteúdo HTML sem tags <html> ou <body>.
    `;
    try {
      const cfg = await getAIConfig(supabase, 'whatsapp_reports');
      if ((cfg as any)?.system_prompt) {
        prompt = (cfg as any).system_prompt as string;
      }
    } catch (_) {}

    let analysis = '';

    if (aiConfig.service === 'gemini') {
      // Chamar Google Gemini com configurações dinâmicas
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + aiConfig.model + ':generateContent?key=' + Deno.env.get('GOOGLE_AI_API_KEY'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: aiConfig.temperature,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: aiConfig.max_tokens,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro na análise Gemini';

    } else if (aiConfig.service === 'openai') {
      // Chamar OpenAI com configurações dinâmicas
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            { role: 'system', content: 'Você é o Dr. Vita, um médico especialista em análise corporal e metabolismo.' },
            { role: 'user', content: prompt }
          ],
          temperature: aiConfig.temperature,
          max_tokens: aiConfig.max_tokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      analysis = data.choices?.[0]?.message?.content || 'Erro na análise OpenAI';
    }

    console.log(`✅ WhatsApp Dr. Vita gerado com sucesso usando ${aiConfig.service} ${aiConfig.model}`);
    return analysis;

  } catch (error) {
    console.error('❌ Erro ao gerar feedback do Dr. Vita:', error);
    
    // Fallback para análise padrão expandida
    return generateFallbackDrVitaFeedback(userName, metrics);
  }
}

// Função de fallback para feedback do Dr. Vita (versão expandida)
function generateFallbackDrVitaFeedback(userName: string, metrics: any): string {
  const { 
    weightChange, measurements, completedMissions, avgWater, avgSleep, avgExercise, 
    avgEnergy, conversations, latestMeasurement 
  } = metrics;
  
  let feedback = `<p><strong>🩺 ${userName}, aqui é o Dr. Vita com sua análise biomédica completa!</strong></p>`;
  
  // Análise de peso e IMC
  if (measurements >= 3 && latestMeasurement) {
    const currentIMC = latestMeasurement.imc || 0;
    const currentWeight = latestMeasurement.peso_kg || 0;
    const riskLevel = latestMeasurement.risco_metabolico || 'desconhecido';
    
    feedback += `<p><strong>⚖️ Análise Corporal Atual:</strong><br>`;
    feedback += `• Peso: ${currentWeight}kg | IMC: ${currentIMC.toFixed(1)}<br>`;
    
    // Análise do risco metabólico
    switch(riskLevel) {
      case 'normal':
        feedback += `• 🟢 Risco Metabólico: NORMAL - Excelente controle!</p>`;
        break;
      case 'sobrepeso':
        feedback += `• 🟡 Risco Metabólico: SOBREPESO - Foque na redução gradual</p>`;
        break;
      case 'obesidade_grau1':
        feedback += `• 🟠 Risco Metabólico: OBESIDADE GRAU I - Ação urgente necessária</p>`;
        break;
      case 'obesidade_grau2':
        feedback += `• 🔴 Risco Metabólico: OBESIDADE GRAU II - Risco elevado</p>`;
        break;
      case 'obesidade_grau3':
        feedback += `• ⚫ Risco Metabólico: OBESIDADE GRAU III - Risco crítico</p>`;
        break;
      default:
        feedback += `• ⚪ Risco Metabólico: Em análise</p>`;
    }
    
    // Análise de variação de peso
    if (weightChange < -0.5) {
      feedback += `<p><strong>📉 EXCELENTE PROGRESSO!</strong> Perdeu ${Math.abs(weightChange).toFixed(1)}kg de forma saudável!</p>`;
    } else if (weightChange > 0.5) {
      feedback += `<p><strong>📈 ATENÇÃO:</strong> Ganhou ${weightChange.toFixed(1)}kg. Preciso revisar estratégia metabólica!</p>`;
    } else {
      feedback += `<p><strong>⚖️ Peso estável</strong> (${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg). Mantendo controle metabólico!</p>`;
    }
    
    // Análise de composição corporal
    if (latestMeasurement.gordura_corporal_percent && latestMeasurement.gordura_corporal_percent > 0) {
      feedback += `<p><strong>🔬 Composição Corporal Detalhada:</strong><br>`;
      feedback += `• Gordura Corporal: ${latestMeasurement.gordura_corporal_percent}%<br>`;
      
      if (latestMeasurement.massa_muscular_kg > 0) {
        feedback += `• Massa Muscular: ${latestMeasurement.massa_muscular_kg}kg<br>`;
      }
      if (latestMeasurement.agua_corporal_percent > 0) {
        feedback += `• Hidratação Corporal: ${latestMeasurement.agua_corporal_percent}%<br>`;
      }
      if (latestMeasurement.gordura_visceral > 0) {
        const visceralRisk = latestMeasurement.gordura_visceral > 12 ? '🔴 ALTO RISCO' : 
                           latestMeasurement.gordura_visceral > 9 ? '🟡 MODERADO' : '🟢 NORMAL';
        feedback += `• Gordura Visceral: ${latestMeasurement.gordura_visceral} (${visceralRisk})<br>`;
      }
      if (latestMeasurement.massa_ossea_kg > 0) {
        feedback += `• Massa Óssea: ${latestMeasurement.massa_ossea_kg}kg<br>`;
      }
      if (latestMeasurement.metabolismo_basal_kcal > 0) {
        feedback += `• Metabolismo Basal: ${latestMeasurement.metabolismo_basal_kcal} kcal/dia</p>`;
      } else {
        feedback += `</p>`;
      }
    }
    
    // Análise metabólica
    if (latestMeasurement.idade_metabolica && latestMeasurement.idade_metabolica > 0) {
      feedback += `<p><strong>🧬 Idade Metabólica:</strong> ${latestMeasurement.idade_metabolica} anos</p>`;
    }
    
  } else {
    feedback += `<p><strong>📊 CRÍTICO:</strong> Apenas ${measurements} pesagens! Preciso de mais dados para análise biomédica completa!</p>`;
  }
  
  // Análise de energia e metabolismo
  if (avgEnergy >= 8) {
    feedback += `<p><strong>⚡ ENERGIA ÓTIMA:</strong> ${avgEnergy.toFixed(1)}/10 - Metabolismo funcionando perfeitamente!</p>`;
  } else if (avgEnergy >= 6) {
    feedback += `<p><strong>🔋 Energia adequada</strong> (${avgEnergy.toFixed(1)}/10), mas pode otimizar com exercícios!</p>`;
  } else if (avgEnergy > 0) {
    feedback += `<p><strong>⚠️ ENERGIA BAIXA:</strong> ${avgEnergy.toFixed(1)}/10 - Fadiga pode indicar problemas metabólicos!</p>`;
  }
  
  // Correlação hábitos x resultados
  feedback += `<p><strong>💪 Correlação Hábitos x Resultados:</strong><br>`;
  if (avgWater >= 2.5) {
    feedback += `• 💧 Hidratação excelente (${avgWater.toFixed(1)}L/dia) - Ótimo para metabolismo!<br>`;
  } else if (avgWater > 0) {
    feedback += `• 💧 Hidratação insuficiente (${avgWater.toFixed(1)}L/dia) - Impacta na composição corporal!<br>`;
  }
  
  if (avgSleep >= 8) {
    feedback += `• 😴 Sono reparador (${avgSleep.toFixed(1)}h) - Fundamental para recuperação muscular!<br>`;
  } else if (avgSleep > 0) {
    feedback += `• ⏰ Sono insuficiente (${avgSleep.toFixed(1)}h) - Prejudica o metabolismo e composição corporal!<br>`;
  }
  
  if (completedMissions >= 5) {
    feedback += `• 🎯 Comprometimento exemplar (${completedMissions} missões) - Reflete nos resultados corporais!</p>`;
  } else {
    feedback += `• 📝 Precisa maior engajamento (${completedMissions} missões) - Impacta nos resultados!</p>`;
  }
  
  feedback += `<p style="text-align: right; margin-top: 25px; font-weight: bold; color: #ffffff;">Continue investindo na sua saúde!<br>Dr. Vita 👨‍⚕️🩺</p>`;
  
  return feedback;
}

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
    { data: examAnalyses },
    { data: conversations }
  ] = await Promise.all([
    supabase.from('weight_measurements').select('*').eq('user_id', user.user_id).gte('measurement_date', weekStart.toISOString().split('T')[0]).order('measurement_date', { ascending: false }),
    supabase.from('health_diary').select('*').eq('user_id', user.user_id).gte('date', weekStart.toISOString().split('T')[0]).order('date', { ascending: false }),
    supabase.from('daily_mission_sessions').select('*').eq('user_id', user.user_id).gte('date', weekStart.toISOString().split('T')[0]).order('date', { ascending: false }),
    supabase.from('weekly_analyses').select('*').eq('user_id', user.user_id).order('semana_inicio', { ascending: false }).limit(1),
    supabase.from('user_achievements').select('*').eq('user_id', user.user_id).gte('unlocked_at', weekStart.toISOString()),
    supabase.from('medical_exam_analyses').select('*').eq('user_id', user.user_id).gte('created_at', weekStart.toISOString()).order('created_at', { ascending: false }),
    supabase.from('chat_conversations').select('*').eq('user_id', user.user_id).gte('created_at', weekStart.toISOString())
  ]);

  return {
    user,
    measurements: measurements || [],
    healthDiary: healthDiary || [],
    missions: missions || [],
    weeklyAnalysis: weeklyAnalysis?.[0],
    achievements: achievements || [],
    examAnalyses: examAnalyses || [],
    conversations: conversations || []
  };
}

// Função para gerar gráfico de peso simplificado para WhatsApp
function generateSimpleWeightChart(measurements: any[]): string {
  if (measurements.length < 2) return '<p style="text-align: center; color: #666;">Dados insuficientes para gráfico</p>';
  
  // Ordenar por data (mais antigo primeiro)
  const sortedMeasurements = measurements.sort((a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime());
  
  const weights = sortedMeasurements.map(m => m.peso_kg);
  const dates = sortedMeasurements.map(m => new Date(m.measurement_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
  
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const variation = lastWeight - firstWeight;
  
  const weightList = weights.map((weight, index) => 
    `${dates[index]}: ${weight}kg`
  ).join(' → ');
  
  return `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace;">
      <div style="font-size: 1.1em; margin-bottom: 10px; font-weight: bold; color: #333;">
        📈 Evolução: ${weightList}
      </div>
      <div style="text-align: center; padding: 10px; background: ${variation < 0 ? '#d4edda' : variation > 0 ? '#f8d7da' : '#e2e3e5'}; border-radius: 5px;">
        <strong>Variação Total: ${variation > 0 ? '+' : ''}${variation.toFixed(1)}kg</strong>
        <br>
        <small>${variation < 0 ? '📉 Perda de peso' : variation > 0 ? '📈 Ganho de peso' : '⚖️ Peso estável'}</small>
      </div>
    </div>
  `;
}

// Função para gerar mensagem personalizada da Sof.ia
function generateSofiaMessage(userName: string, conversationCount: number): string {
  if (conversationCount === 0) {
    return `
      <p><strong>"Olá, ${userName}! 💕"</strong></p>
      <p>"Notei que não conversamos esta semana. Sinto sua falta! 😊"</p>
      <p>"Estou aqui sempre que precisar. Conversas regulares me ajudam a criar relatórios mais precisos!"</p>
      <p style="text-align: right; margin-top: 15px; font-weight: bold;">Esperando você! 💖<br>Sof.ia</p>
    `;
  } else if (conversationCount >= 1 && conversationCount <= 2) {
    return `
      <p><strong>"Oi, ${userName}! 💕"</strong></p>
      <p>"Que bom que conversamos ${conversationCount === 1 ? 'uma vez' : 'algumas vezes'} esta semana!"</p>
      <p>"Quanto mais conversamos, mais precisos ficam seus relatórios. Continue assim!"</p>
      <p style="text-align: right; margin-top: 15px; font-weight: bold;">Vamos conversar mais? 💖<br>Sof.ia</p>
    `;
  } else if (conversationCount >= 3 && conversationCount <= 5) {
    return `
      <p><strong>"${userName}! 💕"</strong></p>
      <p>"Adorei nossas ${conversationCount} conversas esta semana! Estou conhecendo você melhor."</p>
      <p>"Nossa conexão está mais forte e isso reflete na qualidade dos relatórios!"</p>
      <p style="text-align: right; margin-top: 15px; font-weight: bold;">Continue confiando em mim! 💖<br>Sof.ia</p>
    `;
  } else {
    return `
      <p><strong>"Querido(a) ${userName}! 💕"</strong></p>
      <p>"Que semana incrível! ${conversationCount} conversas mostram nossa conexão especial."</p>
      <p>"Com essa interação, posso criar os relatórios mais precisos e personalizados!"</p>
      <p style="text-align: right; margin-top: 15px; font-weight: bold;">Obrigada por confiar em mim! 💖<br>Sof.ia</p>
    `;
  }
}