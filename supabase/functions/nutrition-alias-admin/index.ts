import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function normalize(text: string): string {
  if (!text) return '';
  const lowered = text.toLowerCase();
  const withoutAccents = lowered.normalize('NFD').replace(/\p{Diacritic}+/gu, '');
  const cleaned = withoutAccents.replace(/[^a-z0-9 ]/g, ' ').trim().replace(/\s+/g, ' ');
  return cleaned;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = req.headers.get('authorization') || '';
    // Require a Bearer token (service role or admin JWT)
    if (!auth.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { food_id, aliases } = await req.json();
    if (!food_id || !Array.isArray(aliases) || aliases.length === 0) {
      throw new Error('food_id e aliases[] são obrigatórios');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Validate food exists
    const { data: food } = await supabase.from('nutrition_foods').select('id').eq('id', food_id).limit(1);
    if (!food || food.length === 0) throw new Error('food_id inválido');

    const rows = aliases.map((a: string) => ({ alias_normalized: normalize(a), food_id }));
    const { error } = await supabase.from('nutrition_aliases').upsert(rows, { onConflict: 'alias_normalized' });
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, upserted: rows.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('nutrition-alias-admin error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});








