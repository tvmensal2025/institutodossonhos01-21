import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Função google-fit-token-simple iniciada');
    
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      console.error('❌ Erro ao fazer parse do JSON:', jsonError);
      throw new Error('Body da requisição inválido');
    }
    
    const { code, testSecrets } = requestBody;
    
    console.log('📝 Request recebido:', { 
      hasCode: !!code, 
      isTestSecrets: !!testSecrets,
      bodyKeys: Object.keys(requestBody || {})
    });

    // Teste de secrets
    if (testSecrets) {
      const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET');
      
      console.log('🔧 Teste de secrets:');
      console.log('- Client ID definido:', !!clientId);
      console.log('- Client Secret definido:', !!clientSecret);
      
      return new Response(
        JSON.stringify({
          secretsTest: true,
          clientIdDefined: !!clientId,
          clientSecretDefined: !!clientSecret,
          clientIdPreview: clientId ? clientId.substring(0, 10) + '...' : 'UNDEFINED',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
        }
      );
    }

    if (!code) {
      throw new Error('Código de autorização é obrigatório');
    }

    // Pegar secrets
    const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do Google não configuradas');
    }
    
    // Redirect URI fixo para teste
    const redirectUri = 'http://localhost:8083/google-fit-callback';
    
    console.log('🔗 Configuração:', {
      clientId: clientId.substring(0, 10) + '...',
      redirectUri,
      code: code.substring(0, 10) + '...'
    });

    // Trocar código por token
    const tokenBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });
    
    console.log('📡 Fazendo requisição para Google...');
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody,
    });

    console.log('📊 Status da resposta Google:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Falha na troca de token:', errorData);
      throw new Error(`Falha na troca de token: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Troca de token bem-sucedida');

    return new Response(
      JSON.stringify({
        success: true,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
        message: 'Token obtido com sucesso'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );

  } catch (error) {
    console.error('💥 Erro na função:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'edge-function-error'
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
