import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 google-fit-callback-public chamada:', req.method, req.url)

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request - retornando CORS')
    return new Response('ok', { headers: corsHeaders })
  }

  // Endpoint de teste público
  if (req.url.includes('/test')) {
    console.log('🧪 Endpoint de teste público chamado')
    return new Response(
      JSON.stringify({
        message: 'google-fit-callback-public funcionando!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        status: 'PUBLIC_ACCESS_ENABLED'
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
    console.log('🔑 Callback OAuth detectado - processando SEM autenticação')
    
    try {
      console.log('🔧 Criando cliente Supabase com service role...')
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

      // Extrair URL de retorno e user_id do state
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      let returnUrl = 'https://plataforma.institutodossonhos.com.br'
      let userId = null

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

      if (error) {
        console.log('❌ Erro na autorização:', error)
        return new Response(
          `<!DOCTYPE html>
          <html>
          <head><title>Erro na Autorização</title></head>
          <body>
            <h1>Erro na autorização do Google Fit</h1>
            <p>Erro: ${error}</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      }

      if (!code) {
        console.log('❌ Código de autorização não encontrado')
        return new Response(
          `<!DOCTYPE html>
          <html>
          <head><title>Erro</title></head>
          <body>
            <h1>Código de autorização não encontrado</h1>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      }

      console.log('🔑 Iniciando troca de código por token...')

      // Trocar código por tokens
      const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET')
      const redirectUri = `${supabaseUrl}/functions/v1/google-fit-callback-public`

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
          `<!DOCTYPE html>
          <html>
          <head><title>Erro no Token</title></head>
          <body>
            <h1>Erro ao obter token</h1>
            <p>${errorData}</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      }

      const tokenData = await tokenResponse.json()
      console.log('✅ Token obtido com sucesso')

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
            .eq('id', userId)

          if (profileError) {
            console.error('❌ Erro ao atualizar profile:', profileError)
          } else {
            console.log('✅ Profile atualizado com sucesso')
          }

        } catch (dbError) {
          console.error('❌ Erro ao salvar no banco:', dbError)
        }
      }

      return new Response(
        `<!DOCTYPE html>
        <html>
        <head><title>Google Fit Conectado</title></head>
        <body>
          <h1>✅ Google Fit conectado com sucesso!</h1>
          <p>Redirecionando para a plataforma...</p>
          <script>
            // Notificar o app principal
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_FIT_CONNECTED',
                success: true,
                userId: '${userId}',
                message: 'Google Fit conectado com sucesso!'
              }, '*');
            }
            // Redirecionar para a plataforma de produção
            setTimeout(() => {
              window.location.href = '${returnUrl}';
            }, 1000);
          </script>
        </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )

    } catch (error) {
      console.error('❌ Erro interno:', error)
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head><title>Erro</title></head>
        <body>
          <h1>Erro interno</h1>
          <p>${error.message}</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }
  }

  // Para outras requisições, retornar erro de método não permitido
  return new Response(
    JSON.stringify({
      error: 'Method not allowed',
      message: 'Esta função só aceita callbacks OAuth do Google',
      status: 'PUBLIC_ACCESS_ENABLED'
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
