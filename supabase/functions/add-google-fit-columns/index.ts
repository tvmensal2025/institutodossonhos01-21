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

    // Adicionar coluna google_fit_enabled se não existir
    const { error: error1 } = await supabaseClient
      .from('profiles')
      .select('google_fit_enabled')
      .limit(1)

    if (error1 && error1.message.includes('column "google_fit_enabled" does not exist')) {
      // A coluna não existe, vamos adicioná-la
      const { error: addError1 } = await supabaseClient.rpc('sql', {
        query: 'ALTER TABLE profiles ADD COLUMN google_fit_enabled BOOLEAN DEFAULT false;'
      })
      
      if (addError1) {
        console.log('Erro ao adicionar google_fit_enabled:', addError1)
      }
    }

    // Adicionar coluna provider se não existir
    const { error: error2 } = await supabaseClient
      .from('profiles')
      .select('provider')
      .limit(1)

    if (error2 && error2.message.includes('column "provider" does not exist')) {
      // A coluna não existe, vamos adicioná-la
      const { error: addError2 } = await supabaseClient.rpc('sql', {
        query: 'ALTER TABLE profiles ADD COLUMN provider TEXT DEFAULT \'email\';'
      })
      
      if (addError2) {
        console.log('Erro ao adicionar provider:', addError2)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verificação de colunas concluída!' 
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
