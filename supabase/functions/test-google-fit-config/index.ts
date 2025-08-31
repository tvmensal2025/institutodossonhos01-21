import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET')
    
    return new Response(
      JSON.stringify({
        success: true,
        config: {
          clientId: clientId ? '✅ Configurado' : '❌ Não configurado',
          clientSecret: clientSecret ? '✅ Configurado' : '❌ Não configurado',
          redirectUri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-fit-callback`,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
