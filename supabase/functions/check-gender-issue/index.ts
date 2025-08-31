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

    // Verificar se há constraint no gênero
    const { data: constraints, error: constraintError } = await supabaseClient.rpc('sql', {
      query: `
        SELECT conname, pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'profiles'::regclass 
        AND pg_get_constraintdef(oid) ILIKE '%gender%';
      `
    })

    // Verificar dados de gênero na tabela profiles
    const { data: genderData, error: genderError } = await supabaseClient
      .from('profiles')
      .select('user_id, gender, full_name')
      .not('gender', 'is', null)
      .limit(10)

    // Verificar dados de sexo na tabela user_physical_data
    const { data: sexData, error: sexError } = await supabaseClient
      .from('user_physical_data')
      .select('user_id, sexo')
      .not('sexo', 'is', null)
      .limit(10)

    return new Response(
      JSON.stringify({ 
        success: true, 
        constraints: constraints || [],
        constraintError: constraintError?.message,
        genderData: genderData || [],
        genderError: genderError?.message,
        sexData: sexData || [],
        sexError: sexError?.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
