import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obter todos os usuários ativos
    const { data: users, error: usersError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email_notifications', true)

    if (usersError) {
      throw new Error(`Erro ao buscar usuários: ${usersError.message}`)
    }

    const results = []

    for (const user of users || []) {
      try {
        // Buscar dados do usuário para o relatório
        const { data: weightData } = await supabaseClient
          .from('weight_measurements')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })

        const { data: goalData } = await supabaseClient
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id)

        // Calcular estatísticas
        const stats = []
        let highlight = ''

        if (weightData && weightData.length > 0) {
          const latestWeight = weightData[0].weight
          const previousWeight = weightData[weightData.length - 1]?.weight
          
          if (previousWeight) {
            const weightChange = latestWeight - previousWeight
            stats.push({
              label: 'Variação de Peso',
              value: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg`
            })
          }

          stats.push({
            label: 'Pesagens Registradas',
            value: weightData.length.toString()
          })
        }

        if (goalData && goalData.length > 0) {
          const completedGoals = goalData.filter(goal => goal.completed)
          stats.push({
            label: 'Metas Alcançadas',
            value: `${completedGoals.length}/${goalData.length}`
          })
        }

        // Gerar mensagens personalizadas
        let drVitalMessage = 'Continue focado nos seus objetivos de saúde!'
        let sofiaMessage = 'Você está no caminho certo! Vamos manter o foco nos seus objetivos.'

        if (weightData && weightData.length > 0) {
          const weightChange = weightData[0].weight - weightData[weightData.length - 1]?.weight
          if (weightChange < 0) {
            drVitalMessage = 'Excelente progresso! A perda de peso está acontecendo de forma saudável.'
            sofiaMessage = 'Parabéns! Você está conseguindo manter a consistência nos seus hábitos.'
            highlight = 'Você perdeu peso esta semana! Continue assim!'
          } else if (weightChange > 0) {
            drVitalMessage = 'Vamos analisar juntos o que pode estar causando o ganho de peso.'
            sofiaMessage = 'Não se preocupe, vamos ajustar a estratégia juntos!'
          }
        }

        // Template HTML com imagens dos personagens
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Relatório Semanal - Instituto dos Sonhos</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; }
              .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
              .character-section { display: flex; align-items: center; margin: 20px 0; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .character-avatar { width: 80px; height: 80px; border-radius: 50%; margin-right: 20px; object-fit: cover; }
              .character-info h3 { margin: 0 0 10px 0; color: #333; }
              .character-info p { margin: 0; color: #666; }
              .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
              .stat-card { background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
              .stat-label { color: #666; margin-top: 5px; }
              .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
              .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Relatório Semanal</h1>
                <p>Seu acompanhamento personalizado de saúde e bem-estar</p>
              </div>
              
              <div class="content">
                <div class="character-section">
                  <img src="https://imagensids.s3.us-east-1.amazonaws.com/Dr.Vital%20sem%20fundo.png" alt="Dr. Vital" class="character-avatar">
                  <div class="character-info">
                    <h3>👨‍⚕️ Dr. Vital</h3>
                    <p>Médico especialista em saúde e bem-estar</p>
                    <p><strong>Mensagem:</strong> ${drVitalMessage}</p>
                  </div>
                </div>

                <div class="character-section">
                  <img src="https://imagensids.s3.us-east-1.amazonaws.com/Sofia%20sem%20fundo.png" alt="Sofia" class="character-avatar">
                  <div class="character-info">
                    <h3>💜 Sofia</h3>
                    <p>Assistente virtual e coach de saúde</p>
                    <p><strong>Mensagem:</strong> ${sofiaMessage}</p>
                  </div>
                </div>

                <div class="stats-grid">
                  ${stats.map(stat => `
                    <div class="stat-card">
                      <div class="stat-number">${stat.value}</div>
                      <div class="stat-label">${stat.label}</div>
                    </div>
                  `).join('')}
                </div>

                ${highlight ? `
                  <div class="highlight">
                    <h4>🌟 Destaque da Semana</h4>
                    <p>${highlight}</p>
                  </div>
                ` : ''}

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://institutodossonhos.com" class="cta-button">
                    📱 Acessar Plataforma
                  </a>
                </div>
              </div>

              <div class="footer">
                <p>© 2024 Instituto dos Sonhos - Transformando vidas através da saúde</p>
                <p>Para dúvidas, entre em contato conosco</p>
              </div>
            </div>
          </body>
          </html>
        `

        // Enviar email
        const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
          body: {
            to: user.email,
            subject: '📊 Seu Relatório Semanal - Instituto dos Sonhos',
            html: emailHtml
          }
        })

        if (emailError) {
          console.error(`Erro ao enviar email para ${user.email}:`, emailError)
          results.push({ user: user.email, success: false, error: emailError.message })
        } else {
          results.push({ user: user.email, success: true })
        }

      } catch (error) {
        console.error(`Erro ao processar usuário ${user.email}:`, error)
        results.push({ user: user.email, success: false, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Relatórios processados: ${results.length}`,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})