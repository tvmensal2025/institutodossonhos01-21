import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

type Nutrients = { carboidratos: number; proteina: number; gorduras: number; kcal?: number };

const FOODS: Array<{ nome: string; categoria: string; subcategoria: string; nutrients: Nutrients }> = [
  // Valores por 100g (fontes públicas, aproximadas; foco em precisão prática)
  { nome: 'Lasanha (carne)', categoria: 'prato', subcategoria: 'massa', nutrients: { carboidratos: 14.4, proteina: 7.9, gorduras: 6.3, kcal: 149 } },
  { nome: 'Arroz branco cozido', categoria: 'cereal', subcategoria: 'arroz', nutrients: { carboidratos: 28.0, proteina: 2.7, gorduras: 0.3, kcal: 130 } },
  { nome: 'Brócolis cozido', categoria: 'vegetal', subcategoria: 'crucifero', nutrients: { carboidratos: 7.0, proteina: 2.8, gorduras: 0.4, kcal: 35 } },
  { nome: 'Cenoura cozida', categoria: 'vegetal', subcategoria: 'raiz', nutrients: { carboidratos: 8.2, proteina: 0.8, gorduras: 0.2, kcal: 35 } },
  { nome: 'Couve-flor cozida', categoria: 'vegetal', subcategoria: 'crucifero', nutrients: { carboidratos: 5.0, proteina: 1.9, gorduras: 0.3, kcal: 25 } },
  { nome: 'Tomate cru', categoria: 'vegetal', subcategoria: 'fruto', nutrients: { carboidratos: 3.9, proteina: 0.9, gorduras: 0.2, kcal: 18 } },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const upserted: Array<{ nome: string; alimento_id: number }> = [];
    const updatedValues: Array<{ alimento_id: number; nome: string }> = [];
    const errors: Array<{ nome: string; error: string }> = [];

    for (const item of FOODS) {
      try {
        // 1) Garantir alimento em alimentos_completos
        let alimentoId: number | null = null;
        const { data: existing } = await supabase
          .from('alimentos_completos')
          .select('id')
          .ilike('nome', `%${item.nome}%`)
          .maybeSingle();

        if (existing?.id) {
          alimentoId = existing.id;
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from('alimentos_completos')
            .insert({ nome: item.nome, categoria: item.categoria, subcategoria: item.subcategoria })
            .select('id')
            .single();
          if (insertErr) throw insertErr;
          alimentoId = inserted!.id;
        }

        // 2) Garantir valores em valores_nutricionais_completos
        const { data: valores } = await supabase
          .from('valores_nutricionais_completos')
          .select('alimento_id')
          .eq('alimento_id', alimentoId)
          .maybeSingle();

        const kcal = item.nutrients.kcal ?? Math.round(4*item.nutrients.carboidratos + 4*item.nutrients.proteina + 9*item.nutrients.gorduras);

        if (!valores) {
          const { error: vErr } = await supabase
            .from('valores_nutricionais_completos')
            .insert({
              alimento_id: alimentoId,
              carboidratos: item.nutrients.carboidratos,
              proteina: item.nutrients.proteina,
              gorduras: item.nutrients.gorduras,
              kcal,
            });
          if (vErr) throw vErr;
        } else {
          // opcional: atualizar valores
          const { error: updErr } = await supabase
            .from('valores_nutricionais_completos')
            .update({
              carboidratos: item.nutrients.carboidratos,
              proteina: item.nutrients.proteina,
              gorduras: item.nutrients.gorduras,
              kcal,
            })
            .eq('alimento_id', alimentoId);
          if (updErr) throw updErr;
          updatedValues.push({ alimento_id: alimentoId, nome: item.nome });
        }

        upserted.push({ nome: item.nome, alimento_id: alimentoId });
      } catch (e) {
        errors.push({ nome: item.nome, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ success: true, upserted, updatedValues, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


