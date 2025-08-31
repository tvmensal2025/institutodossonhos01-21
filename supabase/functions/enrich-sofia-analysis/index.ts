import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { detectedFoods, userProfile, analysisType, debug: debugInput } = await req.json();

    console.log('🧪 ENRIQUECENDO ANÁLISE SOFIA (precisão nutricional):', { detectedFoods, analysisType });

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Feature flag de debug
    const debugEnabled = (Deno.env.get('NUTRITION_DEBUG') || '').toLowerCase() === 'true' || !!debugInput;

    // Utilitários
    const normalize = (text: string) => (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();

    type InputFood = string | { nome?: string; name?: string; quantidade?: number; grams?: number; ml?: number; volume_ml?: number; state?: string };
    type Per100g = { carboidratos?: number; proteina?: number; gorduras?: number; fibra?: number; sodio_mg?: number; kcal?: number };

    const parseFood = (item: InputFood) => {
      if (typeof item === 'string') {
        return { nome: item, quantidade: undefined as number | undefined, ml: undefined as number | undefined, state: undefined as string | undefined };
      }
      return {
        nome: item.nome || item.name || '',
        quantidade: typeof item.quantidade === 'number' ? item.quantidade : (typeof item.grams === 'number' ? item.grams : undefined),
        ml: typeof item.volume_ml === 'number' ? item.volume_ml : (typeof item.ml === 'number' ? item.ml : undefined),
        state: item.state
      };
    };

    // Fallback local determinístico por 100g (apenas para contingência)
    const FALLBACK_NUTRITION: Record<string, Per100g & { canonical: string }> = {
      'lasanha': { canonical: 'Lasanha (carne)', carboidratos: 14.4, proteina: 7.9, gorduras: 6.3, fibra: 1.2, sodio_mg: 350, kcal: 149 },
      'arroz branco': { canonical: 'Arroz branco cozido', carboidratos: 28.0, proteina: 2.7, gorduras: 0.3, fibra: 0.4, sodio_mg: 1, kcal: 130 },
      'brocolis': { canonical: 'Brócolis cozido', carboidratos: 7.0, proteina: 2.8, gorduras: 0.4, fibra: 3.3, sodio_mg: 41, kcal: 35 },
      'cenoura': { canonical: 'Cenoura cozida', carboidratos: 8.2, proteina: 0.8, gorduras: 0.2, fibra: 2.9, sodio_mg: 58, kcal: 35 },
      'couve flor': { canonical: 'Couve-flor cozida', carboidratos: 5.0, proteina: 1.9, gorduras: 0.3, fibra: 2.0, sodio_mg: 15, kcal: 25 },
      'couve-flor': { canonical: 'Couve-flor cozida', carboidratos: 5.0, proteina: 1.9, gorduras: 0.3, fibra: 2.0, sodio_mg: 15, kcal: 25 },
      'tomate': { canonical: 'Tomate cru', carboidratos: 3.9, proteina: 0.9, gorduras: 0.2, fibra: 1.2, sodio_mg: 5, kcal: 18 }
    };

    // Busca receita por nome (expansão determinística)
    async function fetchRecipeByName(foodName: string): Promise<null | { nome: string; components: Array<{ alimento_id: number; grams: number }> }> {
      const { data: recipe } = await supabase
        .from('receitas')
        .select('id, nome')
        .ilike('nome', foodName)
        .maybeSingle();
      if (!recipe?.id) return null;

      const { data: comps } = await supabase
        .from('receita_componentes')
        .select('alimento_id, grams')
        .eq('receita_id', recipe.id);
      if (!comps || comps.length === 0) return null;
      return { nome: recipe.nome, components: comps as any };
    }

    // Busca valores por alimento de forma determinística (alias -> canônico -> nutrientes)
    async function fetchNutrientsByName(foodName: string): Promise<{ found: boolean; alimento_id?: number; nome?: string; per100g?: Per100g; matched_by: 'alias' | 'canonical' | 'fallback' | 'none' }>{
      const name = normalize(foodName);
      if (!name) return { found: false, matched_by: 'none' };

      // 1) Tabela de aliases (determinístico)
      const { data: aliasHit } = await supabase
        .from('alimentos_alias')
        .select('alimento_id')
        .eq('alias_norm', name)
        .maybeSingle();

      if (aliasHit?.alimento_id) {
        const { data: can } = await supabase
          .from('alimentos_completos')
          .select('id, nome')
          .eq('id', aliasHit.alimento_id)
          .maybeSingle();

        if (can?.id) {
          const { data: valoresCan } = await supabase
            .from('valores_nutricionais_completos')
            .select('carboidratos, proteina, gorduras, fibra, sodio_mg, kcal')
            .eq('alimento_id', can.id)
            .maybeSingle();

          if (valoresCan) {
            return { found: true, alimento_id: can.id, nome: can.nome, per100g: valoresCan as unknown as Per100g, matched_by: 'alias' };
          }
        }
      }

      // 2) Match canônico exato por nome (sem IA). Usa comparação case-insensitive estrita
      const { data: canonic } = await supabase
        .from('alimentos_completos')
        .select('id, nome')
        .ilike('nome', foodName) // estrito por string enviada
        .maybeSingle();

      if (canonic?.id) {
        const { data: valores } = await supabase
          .from('valores_nutricionais_completos')
          .select('carboidratos, proteina, gorduras, fibra, sodio_mg, kcal')
          .eq('alimento_id', canonic.id)
          .maybeSingle();
        if (valores) {
          return { found: true, alimento_id: canonic.id, nome: canonic.nome, per100g: valores as unknown as Per100g, matched_by: 'canonical' };
        }
      }

      // 3) Fallback local (determinístico)
      if (FALLBACK_NUTRITION[name]) {
        const f = FALLBACK_NUTRITION[name];
        return { found: true, alimento_id: undefined, nome: f.canonical, per100g: f, matched_by: 'fallback' };
      }

      return { found: false, matched_by: 'none' };
    }

    // Preparar lista de itens
    const items = Array.isArray(detectedFoods) ? detectedFoods.map(parseFood) : [];

    const results: Array<{ nome: string; quantidade?: number; per100g?: Per100g; calculado?: { carbs_g: number; protein_g: number; fat_g: number; fiber_g: number; sodium_mg: number; kcal: number }; details?: any; medicinal?: { propriedades?: string | null; principios_ativos?: string[] | null } }>= [];
    let total = { carbs_g: 0, protein_g: 0, fat_g: 0, fiber_g: 0, sodium_mg: 0, kcal: 0 };
    const unmatched: Array<{ input_name: string; reason: string }> = [];
    const logs: any = { normalization: [], lookups: [], conversions: [] };

    for (const item of items) {
      const norm = normalize(item.nome);
      logs.normalization.push({ from: item.nome, to: norm });
      const lookup = await fetchNutrientsByName(item.nome);
      logs.lookups.push({ input: item.nome, matched_by: lookup.matched_by, alimento_id: lookup.alimento_id || null });
      if (!lookup.found || !lookup.per100g) {
        // Tentar receita
        const recipe = await fetchRecipeByName(item.nome);
        if (recipe) {
          let gramsSum = 0;
          for (const c of recipe.components) gramsSum += Number(c.grams);
          const targetGrams = typeof item.quantidade === 'number' && item.quantidade > 0 ? item.quantidade : gramsSum;
          const scale = gramsSum > 0 ? (targetGrams / gramsSum) : 1;

          let sum = { carbs: 0, prot: 0, fat: 0, fiber: 0, sodium: 0, kcal: 0 };
          const expanded: Array<{ nome: string; grams: number; per100g?: Per100g }>= [];
          for (const c of recipe.components) {
            const gramsScaled = Number(c.grams) * scale;
            const { data: v } = await supabase
              .from('valores_nutricionais_completos')
              .select('carboidratos, proteina, gorduras, fibra, sodio_mg, kcal')
              .eq('alimento_id', c.alimento_id)
              .maybeSingle();
            if (v) {
              const factor = gramsScaled / 100;
              sum.carbs += Number(v.carboidratos || 0) * factor;
              sum.prot += Number(v.proteina || 0) * factor;
              sum.fat += Number(v.gorduras || 0) * factor;
              sum.fiber += Number(v.fibra || 0) * factor;
              sum.sodium += Number(v.sodio_mg || 0) * factor;
              const kcal100 = v.kcal != null ? Number(v.kcal) : (4*Number(v.carboidratos||0)+4*Number(v.proteina||0)+9*Number(v.gorduras||0));
              sum.kcal += kcal100 * factor;
              expanded.push({ nome: `#${c.alimento_id}`, grams: gramsScaled, per100g: v as any });
            }
          }
          const calc = {
            carbs_g: +sum.carbs.toFixed(1),
            protein_g: +sum.prot.toFixed(1),
            fat_g: +sum.fat.toFixed(1),
            fiber_g: +sum.fiber.toFixed(1),
            sodium_mg: Math.round(sum.sodium),
            kcal: Math.round(sum.kcal)
          };
          total.carbs_g += calc.carbs_g;
          total.protein_g += calc.protein_g;
          total.fat_g += calc.fat_g;
          total.fiber_g += calc.fiber_g;
          total.sodium_mg += calc.sodium_mg;
          total.kcal += calc.kcal;

          results.push({
            nome: recipe.nome,
            quantidade: targetGrams,
            per100g: undefined,
            calculado: calc,
            details: { applied: ['recipe:expanded'], expanded }
          });
          continue;
        } else {
          unmatched.push({ input_name: item.nome, reason: 'not_found' });
          results.push({ nome: item.nome, quantidade: item.quantidade });
          continue;
        }
      }

      const per100g = lookup.per100g;
      const carbs100 = Number(per100g.carboidratos ?? 0);
      const prot100 = Number(per100g.proteina ?? 0);
      const fat100 = Number(per100g.gorduras ?? 0);
      const fiber100 = Number(per100g.fibra ?? 0);
      const sodio100 = Number(per100g.sodio_mg ?? 0);
      let kcal100 = per100g.kcal != null ? Number(per100g.kcal) : (4 * carbs100 + 4 * prot100 + 9 * fat100);

      // EPF (edible portion)
      let epf = 1.0;
      if (lookup.alimento_id) {
        const { data: epfRow } = await supabase.from('alimentos_epf').select('epf').eq('alimento_id', lookup.alimento_id).maybeSingle();
        if (epfRow?.epf) epf = Number(epfRow.epf);
      }

      // Densidade (ml->g)
      let gramsInput = typeof item.quantidade === 'number' ? item.quantidade : undefined;
      if (gramsInput == null && typeof item.ml === 'number') {
        let densidade = 1.0; // fallback
        if (lookup.alimento_id) {
          const { data: dens } = await supabase.from('alimentos_densidades').select('densidade_g_ml').eq('alimento_id', lookup.alimento_id).maybeSingle();
          if (dens?.densidade_g_ml) densidade = Number(dens.densidade_g_ml);
        }
        gramsInput = +(item.ml * densidade).toFixed(1);
        logs.conversions.push({ type: 'density', ml: item.ml, densidade, grams: gramsInput });
      }

      // Yield entre estados (raw/cooked) se houver
      const fromState = item.state ? normalize(item.state) : undefined;
      const toState = fromState; // sem mudança explícita
      const applied: string[] = [];
      if (lookup.alimento_id && fromState && toState) {
        const { data: y } = await supabase
          .from('alimentos_yield')
          .select('factor')
          .eq('alimento_id', lookup.alimento_id)
          .eq('from_state', fromState)
          .eq('to_state', toState)
          .maybeSingle();
        if (y?.factor && typeof gramsInput === 'number') {
          gramsInput = +(gramsInput * Number(y.factor)).toFixed(1);
          logs.conversions.push({ type: 'yield', factor: Number(y.factor) });
          applied.push(`yield:${Number(y.factor)}`);
        }
      }
      if (epf !== 1.0) { applied.push(`epf:${epf}`); }

      let calculado;
      if (typeof gramsInput === 'number' && gramsInput > 0) {
        gramsInput = gramsInput * epf;
        const factor = gramsInput / 100;
        calculado = {
          carbs_g: +(carbs100 * factor).toFixed(1),
          protein_g: +(prot100 * factor).toFixed(1),
          fat_g: +(fat100 * factor).toFixed(1),
          fiber_g: +(fiber100 * factor).toFixed(1),
          sodium_mg: Math.round(sodio100 * factor),
          kcal: Math.round(kcal100 * factor)
        };

        total.carbs_g += calculado.carbs_g;
        total.protein_g += calculado.protein_g;
        total.fat_g += calculado.fat_g;
        total.fiber_g += calculado.fiber_g;
        total.sodium_mg += calculado.sodium_mg;
        total.kcal += calculado.kcal;
      }

      // Propriedades medicinais (se houver)
      let medicinal: { propriedades?: string | null; principios_ativos?: string[] | null } | undefined;
      if (lookup.alimento_id) {
        try {
          const { data: med } = await supabase
            .from('alimentos_completos')
            .select('propriedades_medicinais, principios_ativos')
            .eq('id', lookup.alimento_id)
            .maybeSingle();
          medicinal = { propriedades: med?.propriedades_medicinais || null, principios_ativos: (med?.principios_ativos as unknown as string[]) || null };
        } catch (_) {}
      }

      results.push({ 
        nome: lookup.nome || item.nome, 
        quantidade: gramsInput, 
        per100g: { carboidratos: carbs100, proteina: prot100, gorduras: fat100, fibra: fiber100, sodio_mg: sodio100, kcal: kcal100 }, 
        calculado,
        details: { applied },
        medicinal
      });
    }

    // Arredondar totais
    total = {
      carbs_g: +total.carbs_g.toFixed(1),
      protein_g: +total.protein_g.toFixed(1),
      fat_g: +total.fat_g.toFixed(1),
      fiber_g: +total.fiber_g.toFixed(1),
      sodium_mg: Math.round(total.sodium_mg),
      kcal: Math.round(total.kcal)
    };

    // Recomendação simples opcional
    let recomendacoes = '';
    if (userProfile?.goals?.includes('perda_peso')) {
      recomendacoes += '🎯 Preferir proteínas magras e fibras, evitar ultraprocessados.\n';
    }

    const hasUnmatched = unmatched.length > 0;

    // Resumo e pontuação
    const summaryItems = results.map(r => `${r.nome}${typeof r.quantidade === 'number' ? ` ${r.quantidade}g` : ''}`).join(', ');
    const summary_text = `Prato identificado: ${summaryItems}`;
    const kcal = total.kcal;
    const fiber = total.fiber_g;
    const sodium = total.sodium_mg;
    const protein = total.protein_g;
    const carbs = total.carbs_g;
    const fat = total.fat_g;

    const warnings: string[] = [];
    if (kcal > 900) warnings.push('Calorias elevadas');
    if (kcal < 300) warnings.push('Calorias muito baixas');
    if (fiber < 5) warnings.push('Baixa fibra');
    if (sodium > 1200) warnings.push('Sódio elevado');
    if (protein / Math.max(1, kcal) < 0.1) warnings.push('Baixa densidade proteica');

    const scoreBase = 100;
    let penalty = 0;
    if (kcal > 900) penalty += 15;
    if (kcal < 300) penalty += 10;
    if (fiber < 5) penalty += 15;
    if (sodium > 1200) penalty += 20;
    if (protein / Math.max(1, kcal) < 0.1) penalty += 20;
    const meal_score = Math.max(0, scoreBase - penalty);

    const suggestions: string[] = [];
    if (fiber < 5) suggestions.push('Adicionar verduras/legumes ou versões integrais para elevar a fibra.');
    if (sodium > 1200) suggestions.push('Reduzir sal/molhos industrializados; preferir temperos naturais.');
    if (fat > 35) suggestions.push('Preferir preparos grelhados/assados e reduzir queijos gordurosos.');
    if (carbs > 120) suggestions.push('Substituir parte dos refinados por integrais.');

    const response: any = {
      success: !hasUnmatched,
      analysis_type: analysisType || 'nutritional_sum',
      items,
      items_detailed: results.map(r => ({
        input_name: r.nome,
        canonical_name: r.nome,
        state_used: 'desconhecido',
        grams_input: r.quantidade,
        grams_effective: r.quantidade,
        kcal: r.calculado?.kcal || 0,
        protein_g: r.calculado?.protein_g || 0,
        fat_g: r.calculado?.fat_g || 0,
        carbs_g: r.calculado?.carbs_g || 0,
        fiber_g: r.calculado?.fiber_g || 0,
        sodium_mg: r.calculado?.sodium_mg || 0,
        medicinal: r.medicinal || null,
        notes: r.details?.applied || []
      })),
      totals: total,
      summary_text,
      meal_score,
      warnings,
      suggestions,
      unmatched,
      notes: 'Determinístico: 100g base * (gramas/100). EPF aplicado quando disponível.'
    };

    if (debugEnabled) {
      response.debug = { normalization: logs.normalization, lookups: logs.lookups, conversions: logs.conversions };
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na função de enriquecimento:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      enriched_analysis: '⚠️ Erro ao enriquecer análise. Usando dados básicos.',
      medicinal_data_available: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
