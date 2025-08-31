import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

type RecipeSpec = {
  nome: string;
  components: Array<{ nome: string; grams: number }>;
};

const RECIPES: RecipeSpec[] = [
  {
    nome: 'Feijoada',
    components: [
      { nome: 'Feijão preto cozido', grams: 200 },
      { nome: 'Carne bovina cozida', grams: 120 },
      { nome: 'Linguiça cozida', grams: 60 },
      { nome: 'Farofa (farinha de mandioca torrada)', grams: 50 },
      { nome: 'Couve refogada', grams: 40 },
    ],
  },
  {
    nome: 'Estrogonofe de frango',
    components: [
      { nome: 'Frango cozido', grams: 150 },
      { nome: 'Creme de leite', grams: 60 },
      { nome: 'Molho de tomate', grams: 80 },
      { nome: 'Arroz branco cozido', grams: 150 },
      { nome: 'Batata palha', grams: 30 },
    ],
  },
  {
    nome: 'Moqueca de peixe',
    components: [
      { nome: 'Peixe cozido', grams: 180 },
      { nome: 'Leite de coco', grams: 80 },
      { nome: 'Pimentão', grams: 40 },
      { nome: 'Tomate cru', grams: 60 },
      { nome: 'Cebola', grams: 40 },
      { nome: 'Arroz branco cozido', grams: 150 },
    ],
  },
  {
    nome: 'Lasanha completa',
    components: [
      { nome: 'Lasanha (carne)', grams: 250 },
      { nome: 'Salada verde', grams: 80 },
    ],
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const created: any[] = [];
    const unmatched: any[] = [];

    for (const recipe of RECIPES) {
      // Upsert receita
      let receitaId: number | null = null;
      const { data: found } = await supabase.from('receitas').select('id').ilike('nome', recipe.nome).maybeSingle();
      if (found?.id) receitaId = found.id;
      else {
        const { data: ins, error: insErr } = await supabase.from('receitas').insert({ nome: recipe.nome }).select('id').single();
        if (insErr) throw insErr;
        receitaId = ins!.id;
      }

      // Mapear componentes por nome → alimento_id
      const compsToInsert: Array<{ receita_id: number; alimento_id: number; grams: number }> = [];
      for (const c of recipe.components) {
        const { data: ali } = await supabase.from('alimentos_completos').select('id').ilike('nome', c.nome).maybeSingle();
        if (ali?.id) compsToInsert.push({ receita_id: receitaId!, alimento_id: ali.id, grams: c.grams });
        else unmatched.push({ receita: recipe.nome, componente: c.nome });
      }

      if (compsToInsert.length > 0) {
        // Inserir componentes (ignorar duplicatas pelo par receita+alimento+grams)
        const { error: compErr } = await supabase.from('receita_componentes').insert(compsToInsert);
        if (compErr && !`${compErr.message}`.includes('duplicate key')) throw compErr;
      }

      created.push({ nome: recipe.nome, receita_id: receitaId, inseridos: compsToInsert.length });
    }

    return new Response(JSON.stringify({ success: unmatched.length === 0, created, unmatched }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});


