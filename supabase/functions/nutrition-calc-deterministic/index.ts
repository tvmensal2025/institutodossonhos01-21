import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const NUTRITION_DEBUG = Deno.env.get('NUTRITION_DEBUG') === 'true';
const SOFIA_DETERMINISTIC_ONLY = Deno.env.get('SOFIA_DETERMINISTIC_ONLY') === 'true';

// Normalizar texto (lowercase, sem acentos/pontuação)
function normalize(text: string): string {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9 ]/g, ' ') // remove pontuação
    .trim()
    .replace(/\s+/g, ' '); // normaliza espaços
}

interface FoodItem {
  name: string;
  grams?: number;
  ml?: number;
  state?: 'cru' | 'cozido' | 'grelhado' | 'frito';
}

interface NutritionResult {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  matched_items: Array<{
    name: string;
    grams_effective: number;
    source: 'tabelataco' | 'nutrition_foods';
    match_type: 'exact' | 'alias' | 'similar';
    debug?: any;
  }>;
  unmatched_items: string[];
  total_items: number;
  matched_count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { items, analysis_type } = await req.json();
    
    if (NUTRITION_DEBUG) {
      console.log('🔧 nutrition-calc-deterministic:', { items, analysis_type });
    }

    if (!items || !Array.isArray(items)) {
      throw new Error('Items deve ser um array');
    }

    const result: NutritionResult = {
      kcal: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sodium_mg: 0,
      matched_items: [],
      unmatched_items: [],
      total_items: items.length,
      matched_count: 0
    };

    // Processar cada item
    for (const item of items) {
      const itemResult = await processItem(supabase, item);
      
      if (itemResult.matched) {
        result.kcal += itemResult.kcal;
        result.protein_g += itemResult.protein_g;
        result.carbs_g += itemResult.carbs_g;
        result.fat_g += itemResult.fat_g;
        result.fiber_g += itemResult.fiber_g;
        result.sodium_mg += itemResult.sodium_mg;
        result.matched_items.push(itemResult.matchInfo);
        result.matched_count++;
      } else {
        result.unmatched_items.push(item.name);
        console.warn('⚠️ Item não encontrado:', item.name);
      }
    }

    // Arredondar valores finais
    result.kcal = Math.round(result.kcal);
    result.protein_g = Math.round(result.protein_g * 10) / 10;
    result.carbs_g = Math.round(result.carbs_g * 10) / 10;
    result.fat_g = Math.round(result.fat_g * 10) / 10;
    result.fiber_g = Math.round(result.fiber_g * 10) / 10;
    result.sodium_mg = Math.round(result.sodium_mg * 10) / 10;

    console.log(`✅ Cálculo determinístico: ${result.matched_count}/${result.total_items} itens processados`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro nutrition-calc-deterministic:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      kcal: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sodium_mg: 0,
      matched_items: [],
      unmatched_items: [],
      total_items: 0,
      matched_count: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processItem(supabase: any, item: FoodItem) {
  const normalizedName = normalize(item.name);
  let grams = Number(item.grams || 0);
  
  // Converter mL para gramas se necessário
  if (!grams && item.ml) {
    grams = Number(item.ml);
  }

  if (grams <= 0) {
    console.warn('⚠️ Gramas inválidas para:', item.name);
    return { matched: false };
  }

  if (NUTRITION_DEBUG) {
    console.log(`🔍 Processando: ${item.name} (${grams}g) -> normalized: ${normalizedName}`);
  }

  // 1) Tentar tabelataco primeiro
  const tacoResult = await searchTabelaTaco(supabase, normalizedName, item.name);
  if (tacoResult) {
    const nutrition = calculateNutrients(tacoResult, grams, 'tabelataco');
    return {
      matched: true,
      ...nutrition,
      matchInfo: {
        name: item.name,
        grams_effective: grams,
        source: 'tabelataco',
        match_type: tacoResult.match_type,
        debug: NUTRITION_DEBUG ? tacoResult.debug : undefined
      }
    };
  }

  // 2) Fallback para nutrition_foods
  const nutritionResult = await searchNutritionFoods(supabase, normalizedName, item.name, grams, item.state);
  if (nutritionResult) {
    const nutrition = calculateNutrients(nutritionResult.food, nutritionResult.grams_effective, 'nutrition_foods');
    return {
      matched: true,
      ...nutrition,
      matchInfo: {
        name: item.name,
        grams_effective: nutritionResult.grams_effective,
        source: 'nutrition_foods',
        match_type: nutritionResult.match_type,
        debug: NUTRITION_DEBUG ? nutritionResult.debug : undefined
      }
    };
  }

  return { matched: false };
}

async function searchTabelaTaco(supabase: any, normalizedName: string, originalName: string) {
  // Buscar por nome exato normalizado na tabela oficial TACO
  const { data: exactMatch } = await supabase
    .from('taco_foods')
    .select('*')
    .ilike('descricao', originalName)
    .limit(1);

  if (exactMatch?.length > 0) {
    if (NUTRITION_DEBUG) {
      console.log(`✅ TACO exact match: ${exactMatch[0].descricao}`);
    }
    return {
      ...exactMatch[0],
      match_type: 'exact',
      debug: { query: 'exact_name', result: exactMatch[0].descricao }
    };
  }

  // Buscar por similaridade
  const { data: similarMatch } = await supabase
    .from('taco_foods')
    .select('*')
    .ilike('descricao', `%${normalizedName}%`)
    .limit(5);

  if (similarMatch?.length > 0) {
    // Pegar o que tem mais macros preenchidos
    const best = similarMatch.reduce((prev, curr) => {
      const prevScore = (prev.energia_kcal || 0) + (prev.proteina_g || 0) + (prev.carboidrato_g || 0);
      const currScore = (curr.energia_kcal || 0) + (curr.proteina_g || 0) + (curr.carboidrato_g || 0);
      return currScore > prevScore ? curr : prev;
    });

    if (NUTRITION_DEBUG) {
      console.log(`✅ TACO similar match: ${best.descricao}`);
    }
    return {
      ...best,
      match_type: 'similar',
      debug: { query: 'similar_name', candidates: similarMatch.map(s => s.descricao), selected: best.descricao }
    };
  }

  return null;
}

async function searchNutritionFoods(supabase: any, normalizedName: string, originalName: string, grams: number, state?: string) {
  // 1) Tentar busca por alias
  const { data: aliasMatch } = await supabase
    .from('nutrition_aliases')
    .select('food_id')
    .eq('alias_normalized', normalizedName)
    .limit(1);

  let food = null;
  let match_type = 'alias';

  if (aliasMatch?.length > 0) {
    const { data: foodData } = await supabase
      .from('nutrition_foods')
      .select('*')
      .eq('id', aliasMatch[0].food_id)
      .limit(1);
    
    if (foodData?.length > 0) {
      food = foodData[0];
    }
  }

  // 2) Se não encontrou alias, buscar por nome similar
  if (!food) {
    const { data: similarFoods } = await supabase
      .from('nutrition_foods')
      .select('*')
      .ilike('canonical_name', `%${originalName}%`)
      .eq('locale', 'pt-BR')
      .limit(5);

    if (similarFoods?.length > 0) {
      // Preferir comidas com macros não zerados
      const nonZero = similarFoods.filter(f => (Number(f.kcal)||0) > 0 || (Number(f.protein_g)||0) > 0);
      food = nonZero.length > 0 ? nonZero[0] : similarFoods[0];
      match_type = 'similar';
    }
  }

  if (!food) return null;

  let grams_effective = grams;
  let debug: any = { original_grams: grams };

  // Aplicar yield se estado for diferente
  if (state && state !== food.state) {
    const { data: yieldData } = await supabase
      .from('nutrition_yields')
      .select('factor')
      .eq('food_id', food.id)
      .eq('from_state', state)
      .eq('to_state', food.state)
      .limit(1);

    if (yieldData?.length > 0) {
      grams_effective = grams * Number(yieldData[0].factor);
      debug.yield_applied = { from: state, to: food.state, factor: yieldData[0].factor, new_grams: grams_effective };
    }
  }

  // Aplicar EPF se existir
  if (food.edible_portion_factor && Number(food.edible_portion_factor) > 0) {
    grams_effective = grams_effective * Number(food.edible_portion_factor);
    debug.epf_applied = { factor: food.edible_portion_factor, new_grams: grams_effective };
  }

  // Converter mL para g se for líquido
  if (food.density_g_ml && Number(food.density_g_ml) > 0) {
    grams_effective = grams_effective * Number(food.density_g_ml);
    debug.density_applied = { density: food.density_g_ml, new_grams: grams_effective };
  }

  if (NUTRITION_DEBUG) {
    console.log(`✅ Nutrition Foods match: ${food.canonical_name}, grams: ${grams} -> ${grams_effective}`);
  }

  return {
    food,
    grams_effective,
    match_type,
    debug
  };
}

function calculateNutrients(food: any, grams: number, source: string) {
  const factor = grams / 100.0;
  
  if (source === 'tabelataco') {
    return {
      kcal: Number(food.energia_kcal || 0) * factor,
      protein_g: Number(food.proteina_g || 0) * factor,
      carbs_g: Number(food.carboidrato_g || 0) * factor,
      fat_g: Number(food.lipideos_g || 0) * factor,
      fiber_g: Number(food.fibra_alimentar_g || 0) * factor,
      sodium_mg: Number(food.sodio_mg || 0) * factor,
    };
  } else {
    return {
      kcal: Number(food.kcal || 0) * factor,
      protein_g: Number(food.protein_g || 0) * factor,
      carbs_g: Number(food.carbs_g || 0) * factor,
      fat_g: Number(food.fat_g || 0) * factor,
      fiber_g: Number(food.fiber_g || 0) * factor,
      sodium_mg: Number(food.sodium_mg || 0) * factor,
    };
  }
}