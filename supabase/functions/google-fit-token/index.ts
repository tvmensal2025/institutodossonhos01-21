import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 google-fit-token chamada:', req.method, req.url)
  
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request - retornando CORS')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 Criando cliente Supabase...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let body: any = {}
    try {
      body = await req.json()
    } catch (_e) {
      body = {}
    }
    
    const { action, code, redirect_uri, testSecrets } = body
    console.log('📋 Parâmetros recebidos:', { action, code, redirect_uri, testSecrets })

    // Teste de configuração - para verificar se as variáveis estão configuradas
    if (testSecrets) {
      const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET')
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      console.log('🧪 Teste de configuração executado')
      return new Response(
        JSON.stringify({
          success: true,
          config: {
            clientId: clientId ? '✅ Configurado' : '❌ Não configurado',
            clientSecret: clientSecret ? '✅ Configurado' : '❌ Não configurado',
            supabaseUrl: supabaseUrl ? '✅ Configurado' : '❌ Não configurado',
            serviceRoleKey: serviceRoleKey ? '✅ Configurado' : '❌ Não configurado',
            redirectUri: `${supabaseUrl}/functions/v1/google-fit-callback`,
            productionUrl: 'https://plataforma.institutodossonhos.com.br',
            timestamp: new Date().toISOString()
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'connect') {
      console.log('🔗 Iniciando conexão Google Fit...')
      
      // Verificar autenticação do usuário
      const authHeader = req.headers.get('Authorization') || ''
      const token = authHeader.replace('Bearer ', '')
      
      if (!token) {
        console.log('❌ Token de autorização não fornecido')
        return new Response(
          JSON.stringify({ success: false, error: 'Authorization token required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      console.log('🔑 Verificando token de autorização...')
      const { data: user, error: userError } = await supabaseClient.auth.getUser(token)
      
      if (userError || !user.user) {
        console.log('❌ Usuário não autenticado:', userError?.message)
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      console.log('✅ Usuário autenticado:', user.user.email)
      console.log('🆔 User ID:', user.user.id)

      // Gerar URL de autorização do Google Fit
      const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID')
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      
      // USAR A URL QUE JÁ ESTÁ AUTORIZADA NO GOOGLE CLOUD CONSOLE
      const redirectUri = `${supabaseUrl}/functions/v1/google-fit-callback`
      
      // Criar state com userId e returnUrl
      const stateData = {
        returnUrl: 'http://localhost:8080', // URL local do Vite
        userId: user.user.id,
        userEmail: user.user.email,
        timestamp: new Date().toISOString()
      }
      
      const state = encodeURIComponent(JSON.stringify(stateData))
      console.log('🔧 State gerado:', stateData)
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read')}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`

      console.log('🔗 URL de autorização gerada com sucesso')
      return new Response(
        JSON.stringify({ 
          success: true, 
          authUrl,
          redirectUri,
          supabaseUrl,
          productionUrl: 'https://plataforma.institutodossonhos.com.br',
          state: stateData,
          userId: user.user.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (code) {
      console.log('🔑 Processando código de autorização...')
      const authHeader = req.headers.get('Authorization') || ''
      const token = authHeader.replace('Bearer ', '')
      const { data: user } = await supabaseClient.auth.getUser(token)
      if (!user.user) {
        console.log('❌ Usuário não autenticado para troca de código')
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET')
      if (!clientId || !clientSecret) {
        console.log('❌ Credenciais do Google Fit não configuradas')
        return new Response(
          JSON.stringify({ success: false, error: 'Google Fit credentials not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Usar sempre a URL correta do Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const correctRedirectUri = `${supabaseUrl}/functions/v1/google-fit-callback`

      const tokenBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: correctRedirectUri
      })

      console.log('🔄 Trocando código por token...')
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenBody
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.log('❌ Erro na troca de token:', errorText)
        return new Response(
          JSON.stringify({ success: false, error: errorText }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const tokenData = await tokenResponse.json()
      console.log('✅ Token obtido com sucesso')
      const expiresAt = new Date(Date.now() + (tokenData.expires_in || 0) * 1000).toISOString()

      console.log('💾 Salvando tokens no banco...')
      const { error: upsertError } = await supabaseClient
        .from('google_fit_tokens')
        .upsert({
          user_id: user.user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          expires_at: expiresAt,
          token_type: tokenData.token_type || 'Bearer',
          scope: tokenData.scope || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (upsertError) {
        console.log('❌ Erro ao salvar tokens:', upsertError.message)
        return new Response(
          JSON.stringify({ success: false, error: upsertError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      console.log('✅ Tokens salvos com sucesso')

      // Atualizar profile para marcar Google Fit como habilitado
      console.log('🔄 Atualizando profile...')
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ google_fit_enabled: true })
        .eq('user_id', user.user.id)

      if (profileError) {
        console.log('❌ Erro ao atualizar profile:', profileError.message)
      } else {
        console.log('✅ Profile atualizado com sucesso')
      }

      return new Response(
        JSON.stringify({
          success: true,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in,
          scope: tokenData.scope,
          userId: user.user.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log('❌ Requisição inválida')
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid request. Use action: "connect" or provide a code.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('❌ Erro na Edge Function google-fit-token:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
