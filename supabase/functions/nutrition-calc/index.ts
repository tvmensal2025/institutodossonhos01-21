import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

type InputItem = {
  name: string; // free text
  grams?: number; // quantity in grams; if mL provided, set ml and provide density via db
  ml?: number;
  state?: string; // user-provided state (cru/cozido/grelhado...)
};

type ResolvedItem = {
  input: InputItem;
  matched_food_id: string | null;
  matched_canonical_name: string | null;
  base_state: string | null;
  used_density_g_ml: number | null;
  used_epf: number | null;
  used_yield_factor: number | null;
  effective_grams: number; // after ml->g, epf, yield
  nutrients: { kcal: number; protein_g: number; fat_g: number; carbs_g: number; fiber_g: number; sodium_mg: number } | null;
};

function normalize(text: string): string {
  if (!text) return '';
  const lowered = text.toLowerCase();
  const withoutAccents = lowered.normalize('NFD').replace(/\p{Diacritic}+/gu, '');
  const cleaned = withoutAccents.replace(/[^a-z0-9 ]/g, ' ').trim().replace(/\s+/g, ' ');
  return cleaned;
}

const preparedStatePriority = ['cozido', 'grelhado', 'assado', 'pronto', 'liquido', 'raw'];

// Precision mode defaults: strict and no yield guessing unless explicitly disabled
const strictMode = (Deno.env.get('NUTRITION_STRICT_MODE') || 'true').toLowerCase() === 'true';
const disableYieldGuess = (Deno.env.get('NUTRITION_DISABLE_YIELD_GUESS') || 'true').toLowerCase() === 'true';

function guessDefaultYield(fromState: string, toState: string, foodName: string): number | null {
  const n = (foodName || '').toLowerCase();
  if (fromState === toState) return null;
  // Arroz/massa: cru -> cozido
  if ((/arroz|massa|macarr/i).test(n) && fromState === 'cru' && toState === 'cozido') return 2.5;
  // Feijão: cru -> cozido
  if ((/feij/i).test(n) && fromState === 'cru' && toState === 'cozido') return 2.8;
  // Batata/vegetais: cru -> cozido/assado (perda água)
  if ((/batata|cenoura|brocolis|br[óo]colis|couve|abobrinh|legume/i).test(n) && fromState === 'cru' && (toState === 'cozido' || toState === 'assado')) return 0.85;
  // Carnes: cru -> grelhado
  if ((/carne|bovino|bovina|frango|peito|peixe/i).test(n) && fromState === 'cru' && toState === 'grelhado') return 0.7;
  return null;
}

const SYNONYMS: Record<string, string> = {
  'carne de panela': 'carne bovina cozida',
  'bife': 'carne bovina grelhada',
  'batata': 'batata cozida',
  'arroz': 'arroz, branco, cozido',
  'feijao': 'feijao preto cozido',
  'feijão': 'feijao preto cozido',
  'salada': 'salada verde',
  'farofa': 'farofa pronta',
  'vinagrete': 'molho vinagrete',
  'maionese': 'maionese',
  // Ovos
  'ovo': 'ovo de galinha cozido',
  'ovos': 'ovo de galinha cozido',
  'ovo cozido': 'ovo de galinha cozido',
  'ovo frito': 'ovo de galinha frito',
  'ovos mexidos': 'ovos mexidos',
  'omelete': 'omelete simples',
  // Laticínios/queijos frequentes em lasanha
  'queijo': 'queijo minas',
  'queijo ralado': 'queijo parmesão ralado',
  // Pratos compostos para expandir por receita (futuro):
  // 'lasanha': 'lasanha de carne' // placeholder canônico
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Aceitar qualquer chamada - sem verificação JWT para Edge Functions internas
  try {
    console.log('🔧 nutrition-calc called, method:', req.method);
    const { items, locale, target_state } = await req.json();
    if (!items || !Array.isArray(items)) throw new Error('items é obrigatório (array)');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const resolved: ResolvedItem[] = [];
    let totals = { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };

    for (const input of items as InputItem[]) {
      // Apply synonyms before normalization to bias towards prepared variants
      const rawName = input.name || '';
      const synonym = SYNONYMS[rawName.toLowerCase().trim() as keyof typeof SYNONYMS];
      const searchName = synonym || rawName;
      const alias = normalize(searchName);
      const loc = (locale || 'pt-BR');

      // 1) Resolve alias -> food (prefer prepared states by name hints)
      // Try nutrition_aliases exact, then foods trigram
      const { data: aliasHit } = await supabase
        .from('nutrition_aliases')
        .select('food_id')
        .eq('alias_normalized', alias)
        .limit(1);

      let foodId: string | null = aliasHit?.[0]?.food_id ?? null;

      if (!foodId) {
        let foodGuess: any = null;
        try {
          const { data } = await supabase.rpc('search_food_by_name', { q: alias, q_locale: loc });
          foodGuess = data;
        } catch (_e) {
          foodGuess = null;
        }

        if (foodGuess && foodGuess.length > 0) {
          foodId = foodGuess[0].id;
        } else {
          // fallback: ilike
          const { data: ilikeFoods } = await supabase
            .from('nutrition_foods')
            .select('id, state, kcal, protein_g, fat_g, carbs_g, fiber_g')
            .ilike('canonical_name', `%${searchName}%`)
            .eq('locale', loc)
            .limit(10);
          if (ilikeFoods && ilikeFoods.length > 0) {
            const nonZero = ilikeFoods.filter((f: any) => (Number(f.kcal)||0)>0 || (Number(f.protein_g)||0)>0 || (Number(f.fat_g)||0)>0 || (Number(f.carbs_g)||0)>0 || (Number(f.fiber_g)||0)>0);
            const list = nonZero.length > 0 ? nonZero : ilikeFoods;
            list.sort((a: any, b: any) => preparedStatePriority.indexOf(a.state) - preparedStatePriority.indexOf(b.state));
            foodId = list[0].id;
          } else {
            foodId = null;
          }
        }
      }

      if (!foodId) {
        resolved.push({
          input,
          matched_food_id: null,
          matched_canonical_name: null,
          base_state: null,
          used_density_g_ml: null,
          used_epf: null,
          used_yield_factor: null,
          effective_grams: 0,
          nutrients: null,
        });
        continue;
      }

      // 2) Load food row
      let { data: foods } = await supabase
        .from('nutrition_foods')
        .select('*')
        .eq('id', foodId)
        .limit(10);
      let food = foods?.[0];
      // Prefer prepared states
      if (foods && foods.length > 1) {
        foods.sort((a: any, b: any) => preparedStatePriority.indexOf(a.state) - preparedStatePriority.indexOf(b.state));
        food = foods[0];
      }
      if (!food) {
        resolved.push({
          input,
          matched_food_id: null,
          matched_canonical_name: null,
          base_state: null,
          used_density_g_ml: null,
          used_epf: null,
          used_yield_factor: null,
          effective_grams: 0,
          nutrients: null,
        });
        continue;
      }

      // If selected food has zero macros (likely section/placeholder), try fallback to prepared variants with non-zero macros
      const foodHasMacros = (Number(food.kcal)||0)>0 || (Number(food.protein_g)||0)>0 || (Number(food.fat_g)||0)>0 || (Number(food.carbs_g)||0)>0 || (Number(food.fiber_g)||0)>0;
      if (!foodHasMacros) {
        const { data: betterFoods } = await supabase
          .from('nutrition_foods')
          .select('*')
          .ilike('canonical_name', `%${searchName}%`)
          .eq('locale', loc)
          .limit(20);
        if (betterFoods && betterFoods.length > 0) {
          const candidates = betterFoods.filter((f: any) => (Number(f.kcal)||0)>0 || (Number(f.protein_g)||0)>0 || (Number(f.fat_g)||0)>0 || (Number(f.carbs_g)||0)>0 || (Number(f.fiber_g)||0)>0);
          if (candidates.length > 0) {
            candidates.sort((a: any, b: any) => preparedStatePriority.indexOf(a.state) - preparedStatePriority.indexOf(b.state));
            food = candidates[0];
          }
        }
      }

      // 3) Quantity baseline in grams
      let grams = Number(input.grams || 0);
      if (!grams && input.ml && food.density_g_ml) {
        grams = Number(input.ml) * Number(food.density_g_ml);
      }
      // Strict: if no grams resolvable, skip item deterministically (no guesses)
      if ((!grams || grams <= 0) && strictMode) {
        resolved.push({
          input,
          matched_food_id: food.id,
          matched_canonical_name: food.canonical_name,
          base_state: food.state,
          used_density_g_ml: food.density_g_ml ?? null,
          used_epf: null,
          used_yield_factor: null,
          effective_grams: 0,
          nutrients: null,
        });
        continue;
      }

      // 4) Apply edible portion factor
      const epf = food.edible_portion_factor ? Number(food.edible_portion_factor) : null;
      if (epf && epf > 0) {
        grams = grams * epf;
      }

      // 5) Apply yield factor if target_state different from base state
      let usedYield: number | null = null;
      const fromState = (food.state as string) || 'raw';
      const toState = ((target_state || input.state) as string) || fromState;
      if (fromState && toState && fromState !== toState) {
        const { data: yields } = await supabase
          .from('nutrition_yields')
          .select('factor')
          .eq('food_id', food.id)
          .eq('from_state', fromState)
          .eq('to_state', toState)
          .limit(1);
        usedYield = yields?.[0]?.factor
          ? Number(yields[0].factor)
          : (disableYieldGuess ? null : guessDefaultYield(fromState, toState, food.canonical_name));
        if (usedYield && usedYield > 0) grams = grams * usedYield;
      }

      // 6) Nutrients are per 100g
      const factor = grams / 100.0;
      const nutrients = {
        kcal: 0, // Não usar kcal da tabela - será calculado depois
        protein_g: Number(food.protein_g) * factor,
        fat_g: Number(food.fat_g) * factor,
        carbs_g: Number(food.carbs_g) * factor,
        fiber_g: Number(food.fiber_g || 0) * factor,
        sodium_mg: Number(food.sodium_mg || 0) * factor,
      };
      
      // NOVA REGRA: Calcular kcal usando APENAS 4×P + 4×C + 9×G
      nutrients.kcal = 4 * nutrients.protein_g + 4 * nutrients.carbs_g + 9 * nutrients.fat_g;

      // 7) Oil absorption adjustment (applies when fried)
      // If item state or target_state is 'frito' and oil_absorption_factor > 0, add fat accordingly (per 100g basis)
      if ((toState === 'frito' || fromState === 'frito') && Number(food.oil_absorption_factor || 0) > 0) {
        const oilAbs = Number(food.oil_absorption_factor);
        nutrients.fat_g += oilAbs * factor;
        nutrients.kcal += (oilAbs * 9) * factor;
      }

      totals.kcal += nutrients.kcal;
      totals.protein_g += nutrients.protein_g;
      totals.fat_g += nutrients.fat_g;
      totals.carbs_g += nutrients.carbs_g;
      totals.fiber_g += nutrients.fiber_g;
      totals.sodium_mg += nutrients.sodium_mg;

      resolved.push({
        input,
        matched_food_id: food.id,
        matched_canonical_name: food.canonical_name,
        base_state: food.state,
        used_density_g_ml: food.density_g_ml ?? null,
        used_epf: epf,
        used_yield_factor: usedYield,
        effective_grams: grams,
        nutrients,
      });
    }

    return new Response(JSON.stringify({ success: true, resolved, totals }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('nutrition-calc error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// SQL helper function in DB (create via migration if missing)
// CREATE OR REPLACE FUNCTION public.search_food_by_name(q TEXT, q_locale TEXT)
// RETURNS TABLE (id uuid, canonical_name text, similarity real)
// LANGUAGE sql STABLE AS $$
//   SELECT f.id, f.canonical_name, similarity(f.canonical_name, q) as similarity
//   FROM public.nutrition_foods f
//   WHERE f.locale = q_locale
//   ORDER BY f.canonical_name <-> q
//   LIMIT 5
// $$;



