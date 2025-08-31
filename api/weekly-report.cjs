const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Configuração do Supabase (usar variáveis de ambiente)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuração do Resend (usar variável de ambiente)
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  throw new Error('Defina RESEND_API_KEY nas variáveis de ambiente.');
}
const resend = new Resend(resendApiKey);

// Função para gerar HTML do relatório semanal
function generateWeeklyReportHTML(user, data) {
  const { measurements, healthDiary, missions, conversations } = data;
  
  // Calcular estatísticas
  const weightChange = measurements.length >= 2 ? 
    (measurements[0].peso_kg - measurements[measurements.length - 1].peso_kg) : 0;
  
  const avgMood = healthDiary.length > 0 ? 
    healthDiary.reduce((sum, h) => sum + (h.mood_rating || 0), 0) / healthDiary.length : 0;
  
  const completedMissions = missions.filter(m => m.is_completed).length;
  const totalPoints = missions.reduce((sum, m) => sum + (m.total_points || 0), 0);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Semanal de Saúde</title>
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
            max-width: 800px;
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
        .section {
            margin-bottom: 40px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 15px;
            border-left: 5px solid #667eea;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .character-section {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .character-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-right: 20px;
            object-fit: cover;
        }
        .footer {
            background: #2d3436;
            color: white;
            text-align: center;
            padding: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Dr. Vita</h1>
            <p>Relatório Semanal de Saúde para ${user.full_name}</p>
            <p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="content">
            <!-- Resumo da Semana -->
            <div class="section">
                <h2>📊 Resumo da Semana</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value ${weightChange > 0 ? 'color: #00b894' : weightChange < 0 ? 'color: #e17055' : 'color: #fdcb6e'}">
                            ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg
                        </div>
                        <div class="stat-label">Variação de Peso</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${avgMood.toFixed(1)}/10</div>
                        <div class="stat-label">Humor Médio</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${completedMissions}</div>
                        <div class="stat-label">Missões Completas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalPoints}</div>
                        <div class="stat-label">Pontos Conquistados</div>
                    </div>
                </div>
            </div>

            <!-- Mensagem da Sofia -->
            <div class="section" style="background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); border-left: 5px solid #e17055;">
                <div class="character-section">
                    <img src="https://hlrkoyywjpckdotimtik.supabase.co/storage/v1/object/public/course-thumbnails/Sofia%20sem%20fundo.png" 
                         alt="Sofia" class="character-avatar">
                    <h2 style="color: #2d3436; margin: 0;">💝 Mensagem da Sof.ia</h2>
                </div>
                <div style="color: #2d3436; font-style: italic; line-height: 1.8;">
                    <p>Olá, ${user.full_name}!</p>
                    <p>Notei que não conversamos esta semana. Sinto sua falta!</p>
                    <p>Estou aqui esperando por você sempre que precisar. Seja para compartilhar como foi seu dia, tirar dúvidas ou simplesmente desabafar - estou pronta para ouvir!</p>
                    <p>Se conversamos regularmente, posso criar relatórios muito mais precisos e personalizados para você. Cada conversa me ensina mais sobre seus hábitos, sentimentos e objetivos.</p>
                    <p style="text-align: right; margin-top: 20px;"><strong>Esperando você no chat! Sof.ia</strong></p>
                </div>
            </div>

            <!-- Análise Médica do Dr. Vital -->
            <div class="section" style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); border-left: 5px solid #0984e3;">
                <div class="character-section">
                    <img src="https://hlrkoyywjpckdotimtik.supabase.co/storage/v1/object/public/course-thumbnails/Dr.Vital%20sem%20fundo.png" 
                         alt="Dr. Vital" class="character-avatar">
                    <h2 style="color: white; margin: 0;">🩺 Dr. Vita - Análise Médica Personalizada</h2>
                </div>
                <div style="color: white; line-height: 1.8;">
                    <p>${user.full_name}, aqui é o Dr. Vita.</p>
                    <p>Não identifiquei medições de bioimpedância nesta semana. Como seu agente pessoal de saúde, preciso de dados regulares para fornecer análises precisas.</p>
                    <p><strong>Recomendação médica:</strong> Realize pesagens regulares para monitoramento adequado da composição corporal.</p>
                    <p style="text-align: right; margin-top: 20px;"><strong>Dr. Vita - Seu Agente Pessoal de Saúde</strong></p>
                </div>
            </div>

            <!-- Recomendações -->
            <div class="section">
                <h2>💡 Recomendações Precisas para Próxima Semana</h2>
                <ul>
                    ${completedMissions < 5 ? '<li>🎯 Tente completar mais missões diárias para manter a consistência</li>' : ''}
                    ${avgMood < 7 ? '<li>😊 Considere atividades que melhorem seu humor, como meditação ou exercícios leves</li>' : ''}
                    ${measurements.length < 3 ? '<li>⚖️ Mantenha pesagens regulares para acompanhar melhor seu progresso</li>' : ''}
                    ${healthDiary.length < 5 ? '<li>📝 Continue registrando seus hábitos diários no app</li>' : ''}
                    ${conversations.length === 0 ? '<li>💬 <strong>Converse com a Sof.ia para relatórios mais precisos!</strong></li>' : ''}
                    ${conversations.length > 0 && conversations.length < 3 ? '<li>💬 Continue conversando com a Sof.ia - mais conversas = relatórios mais detalhados!</li>' : ''}
                    ${conversations.length >= 3 ? '<li>💬 Continue suas conversas regulares com a Sof.ia!</li>' : ''}
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>📱 Continue acompanhando sua saúde no app</p>
            <p>Este relatório foi gerado automaticamente pelo <a href="#" style="color: #667eea;">Dr. Vita AI</a></p>
            <p><small>Relatório não substitui consulta médica profissional</small></p>
        </div>
    </div>
</body>
</html>`;
}

// Função para gerar e enviar relatório semanal
async function generateAndSendWeeklyReport(userEmail, userName) {
  try {
    console.log(`📧 Gerando relatório para ${userName} (${userEmail})...`);

    // Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      console.error('❌ Usuário não encontrado:', userError);
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Buscar dados da semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: measurements } = await supabase
      .from('weight_measurements')
      .select('*')
      .eq('user_id', user.user_id)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false });

    const { data: healthDiary } = await supabase
      .from('health_diary')
      .select('*')
      .eq('user_id', user.user_id)
      .gte('created_at', oneWeekAgo.toISOString());

    const { data: missions } = await supabase
      .from('daily_mission_sessions')
      .select('*')
      .eq('user_id', user.user_id)
      .gte('created_at', oneWeekAgo.toISOString());

    const { data: conversations } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.user_id)
      .gte('created_at', oneWeekAgo.toISOString());

    // Gerar HTML do relatório
    const reportHTML = generateWeeklyReportHTML(user, {
      measurements: measurements || [],
      healthDiary: healthDiary || [],
      missions: missions || [],
      conversations: conversations || []
    });

    // Enviar email
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "Dr. Vital <onboarding@resend.dev>",
      to: [userEmail],
      subject: `📊 Seu Relatório Semanal de Saúde - ${new Date().toLocaleDateString('pt-BR')}`,
      html: reportHTML,
    });

    if (emailError) {
      console.error('❌ Erro ao enviar email:', emailError);
      return { success: false, error: emailError.message };
    }

    console.log('✅ Relatório enviado com sucesso!');
    return { success: true, data: emailResult };

  } catch (error) {
    console.error('💥 Erro fatal:', error);
    return { success: false, error: error.message };
  }
}

// Função para testar relatório
async function testWeeklyReport() {
  try {
    console.log('🧪 Testando relatório semanal...');
    
    const testEmail = 'tvmensal2025@gmail.com';
    const testUserName = 'Sirlene Correa';

    const result = await generateAndSendWeeklyReport(testEmail, testUserName);
    
    console.log('Resultado do teste:', result);
    return result;

  } catch (error) {
    console.error('💥 Erro no teste:', error);
    return { success: false, error: error.message };
  }
}

// Exportar funções
module.exports = {
  generateAndSendWeeklyReport,
  testWeeklyReport,
  generateWeeklyReportHTML
};

// Se executado diretamente
if (require.main === module) {
  async function main() {
    console.log('📧 API de Relatório Semanal');
    console.log('='.repeat(50));
    
    // Testar relatório
    console.log('\n🧪 Testando relatório semanal...');
    const result = await testWeeklyReport();
    console.log('Resultado:', result);
  }
  
  main().catch(console.error);
} 