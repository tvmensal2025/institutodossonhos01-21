import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🔄 Função google-fit-test iniciada');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verificar autorização
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.log('❌ Sem autorização');
    return new Response(
      JSON.stringify({ error: 'Missing authorization header' }),
      { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Teste básico - sempre retorna sucesso
    console.log('✅ Teste básico - retornando sucesso');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Função de teste funcionando!',
        timestamp: new Date().toISOString(),
        test: true
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );

  } catch (error) {
    console.error('💥 Erro na função de teste:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'test-error'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
