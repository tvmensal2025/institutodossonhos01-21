import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 google-fit-callback chamada:', req.method, req.url)

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request - retornando CORS')
    return new Response('ok', { headers: corsHeaders })
  }

  // Endpoint de teste público
  if (req.url.includes('/test')) {
    console.log('🧪 Endpoint de teste chamado')
    return new Response(
      JSON.stringify({
        message: 'google-fit-callback funcionando!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }

  // Endpoint público para callback do Google OAuth
  if (req.url.includes('code=') || req.url.includes('error=')) {
    console.log('🔑 Callback OAuth detectado - processando sem autenticação')

    try {
      console.log('🔧 Criando cliente Supabase...')
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const url = new URL(req.url)
      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')
      const state = url.searchParams.get('state')

      console.log('📋 Parâmetros recebidos:')
      console.log('  - code:', code ? '✅ Presente' : '❌ Ausente')
      console.log('  - error:', error || 'Nenhum')
      console.log('  - state:', state || 'Nenhum')

      if (error) {
        console.log('❌ Erro na autorização:', error)
        return new Response(
          JSON.stringify({
            success: false,
            error: error,
            message: 'Erro na autorização do Google Fit'
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        )
      }

      if (!code) {
        console.log('❌ Código de autorização não encontrado')
        return new Response(
          JSON.stringify({
            success: false,
            error: 'NO_CODE',
            message: 'Código de autorização não encontrado'
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        )
      }

      console.log('🔑 Iniciando troca de código por token...')

      // Trocar código por tokens
      const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET')
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-fit-callback`

      console.log('🔧 Configuração OAuth:')
      console.log('  - clientId:', clientId ? '✅ Configurado' : '❌ Não configurado')
      console.log('  - clientSecret:', clientSecret ? '✅ Configurado' : '❌ Não configurado')
      console.log('  - redirectUri:', redirectUri)

      const tokenBody = new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenBody
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        console.error('❌ Erro na troca de token:', errorData)
        return new Response(
          JSON.stringify({
            success: false,
            error: 'TOKEN_EXCHANGE_FAILED',
            message: 'Erro ao obter token',
            details: errorData
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        )
      }

      const tokenData = await tokenResponse.json()
      console.log('✅ Token obtido com sucesso')

      // SOLUÇÃO ALTERNATIVA: Tentar extrair userId do state ou usar fallback
      let userId = null
      let returnUrl = 'https://plataforma.institutodossonhos.com.br'

      if (state) {
        try {
          const stateData = JSON.parse(decodeURIComponent(state))
          returnUrl = stateData.returnUrl || returnUrl
          userId = stateData.userId || null
          console.log('🔍 State decodificado:', { returnUrl, userId })
        } catch (e) {
          console.error('❌ Erro ao decodificar state:', e)
        }
      }

      // SE userId ainda for null, tentar buscar por email do Google
      if (!userId) {
        console.log('⚠️ userId não encontrado no state, tentando buscar por email do Google...')
        
        try {
          // Usar o access_token para obter informações do usuário do Google
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`
            }
          })
          
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json()
            console.log('📧 Informações do usuário Google:', userInfo)
            
            if (userInfo.email) {
              // Buscar usuário no Supabase pelo email
              const { data: profile, error: profileError } = await supabaseClient
                .from('profiles')
                .select('user_id, email')
                .eq('email', userInfo.email)
                .single()
              
              if (profile && !profileError) {
                userId = profile.user_id
                console.log('✅ Usuário encontrado pelo email:', { email: userInfo.email, userId })
              } else {
                console.log('❌ Usuário não encontrado pelo email:', userInfo.email)
              }
            }
          } else {
            console.log('❌ Erro ao obter informações do usuário Google')
          }
        } catch (error) {
          console.error('❌ Erro ao buscar usuário por email:', error)
        }
      }

      // Salvar tokens no banco se userId estiver disponível
      if (userId) {
        try {
          const expiresAt = new Date()
          expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 3600))

          const tokenRecord = {
            user_id: userId,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: expiresAt.toISOString(),
            token_type: tokenData.token_type || 'Bearer',
            scope: tokenData.scope || 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.location.read https://www.googleapis.com/auth/fitness.nutrition.read https://www.googleapis.com/auth/fitness.oxygen_saturation.read https://www.googleapis.com/auth/fitness.sleep.read',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          // Upsert para atualizar tokens existentes ou criar novos
          const { error: upsertError } = await supabaseClient
            .from('google_fit_tokens')
            .upsert(tokenRecord, { onConflict: 'user_id' })

          if (upsertError) {
            console.error('❌ Erro ao salvar tokens:', upsertError)
          } else {
            console.log('✅ Tokens salvos com sucesso')
          }

          // Atualizar profile para marcar Google Fit como habilitado
          const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({ google_fit_enabled: true })
            .eq('user_id', userId)

          if (profileError) {
            console.error('❌ Erro ao atualizar profile:', profileError)
          } else {
            console.log('✅ Profile atualizado com sucesso')
          }

        } catch (dbError) {
          console.error('❌ Erro ao salvar no banco:', dbError)
        }
      } else {
        console.log('❌ userId não encontrado - tokens não serão salvos')
      }

      // Retornar HTML de redirecionamento para o frontend
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Fit Conectado</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              margin: 0;
            }
            .container { 
              background: rgba(255,255,255,0.1); 
              padding: 40px; 
              border-radius: 20px; 
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            .success-icon { 
              font-size: 60px; 
              margin-bottom: 20px; 
            }
            h1 { 
              margin-bottom: 20px; 
              font-size: 28px; 
            }
            p { 
              margin-bottom: 30px; 
              font-size: 16px; 
              opacity: 0.9; 
            }
            .redirecting { 
              font-size: 14px; 
              opacity: 0.7; 
              margin-top: 30px; 
            }
            .spinner { 
              display: inline-block; 
              width: 20px; 
              height: 20px; 
              border: 3px solid rgba(255,255,255,0.3); 
              border-radius: 50%; 
              border-top-color: white; 
              animation: spin 1s ease-in-out infinite; 
              margin-right: 10px; 
            }
            @keyframes spin { 
              to { transform: rotate(360deg); } 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Google Fit Conectado!</h1>
            <p>Seus dados de saúde foram sincronizados com sucesso.</p>
            <p>Redirecionando para o Instituto dos Sonhos...</p>
            <div class="redirecting">
              <span class="spinner"></span>
              Redirecionando em <span id="countdown">3</span> segundos...
            </div>
          </div>
          
          <script>
            // Enviar mensagem para o popup pai
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_FIT_CONNECTED',
                success: true,
                userId: '${userId || ''}',
                returnUrl: '${returnUrl || ''}'
              }, '*');
              
              // Fechar popup após 3 segundos
              let countdown = 3;
              const countdownElement = document.getElementById('countdown');
              
              const timer = setInterval(() => {
                countdown--;
                if (countdownElement) {
                  countdownElement.textContent = countdown;
                }
                
                if (countdown <= 0) {
                  clearInterval(timer);
                  window.close();
                }
              }, 1000);
            } else {
              // Se não for popup, redirecionar para o frontend
              setTimeout(() => {
                window.location.href = '${returnUrl || 'http://localhost:8080'}/dashboard?tab=progress';
              }, 3000);
            }
          </script>
        </body>
        </html>
      `;

      return new Response(htmlResponse, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('❌ Erro interno:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Erro interno no servidor',
          details: (error as Error).message
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }
  }

  // Para outras requisições, retornar erro de método não permitido
  return new Response(
    JSON.stringify({
      error: 'Method not allowed',
      message: 'Esta função só aceita callbacks OAuth do Google'
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  )
})
