import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar usuários com token ativo
    const { data: tokens, error } = await supabase
      .from('google_fit_tokens')
      .select('user_id, access_token, refresh_token, expires_at')
      .limit(500);

    if (error) throw error;

    const now = new Date();
    const endDate = new Date().toISOString().slice(0,10);
    const startDate = new Date(now.getTime() - 24*60*60*1000).toISOString().slice(0,10); // ontem->hoje

    let processed = 0;
    for (const t of tokens || []) {
      // pular tokens expirados
      if (new Date(t.expires_at) < new Date()) continue;

      // Chamar a função principal de sync para cada usuário.
      // Aqui usamos fetch para preservar cabeçalhos/cors; como estamos em Edge, podemos chamar HTTP da própria função.
      const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-fit-sync`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          access_token: t.access_token,
          refresh_token: t.refresh_token,
          date_range: { startDate, endDate }
        })
      });

      // Tolerante a erro: continua nos próximos
      if (resp.ok) processed++;
      // Respeitar limites: pequena pausa a cada 10 usuários
      if (processed % 10 === 0) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    return new Response(JSON.stringify({ success: true, processed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});


