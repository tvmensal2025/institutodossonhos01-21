import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const SUPABASE_URL = 'https://hlrkoyywjpckdotimtik.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzE4NjU5MiwiZXhwIjoyMDMyNzYyNTkyfQ.WQRmY7TDo5_rPkh_dqJZJlBBcjkqfI4R4sQrZBCYzro';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debugNutrition() {
  console.log('🔍 Verificando dados nutricionais...\n');

  // 1) Verificar dados do ovo
  console.log('1️⃣ DADOS DO OVO:');
  const { data: ovos } = await supabase
    .from('nutrition_foods')
    .select('*')
    .ilike('canonical_name', '%ovo%')
    .limit(5);
    
  if (ovos && ovos.length > 0) {
    ovos.forEach(ovo => {
      console.log(`📍 ${ovo.canonical_name}: ${ovo.kcal} kcal, ${ovo.protein_g}g prot, ${ovo.fat_g}g gord, ${ovo.carbs_g}g carbo`);
    });
  } else {
    console.log('❌ Nenhum dado de ovo encontrado!');
  }

  // 2) Verificar aliases do ovo
  console.log('\n2️⃣ ALIASES DO OVO:');
  const { data: aliases } = await supabase
    .from('nutrition_aliases')
    .select('alias_normalized, food_id')
    .ilike('alias_normalized', '%ovo%')
    .limit(5);
    
  console.log('Aliases encontrados:', aliases);

  // 3) Testar cálculo direto
  console.log('\n3️⃣ TESTE DE CÁLCULO (50g ovo):');
  
  const SYNONYMS = {
    'ovo': 'ovo de galinha cozido',
  };
  
  const normalize = (text) => {
    if (!text) return '';
    return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '').replace(/[^a-z0-9 ]/g, ' ').trim().replace(/\s+/g, ' ');
  };

  const items = [{ name: 'ovo', grams: 50 }];
  let totals = { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };

  for (const item of items) {
    const rawName = item.name;
    const synonym = SYNONYMS[rawName.toLowerCase().trim()];
    const searchName = synonym || rawName;
    const alias = normalize(searchName);

    console.log(`🔍 Buscando: rawName="${rawName}", synonym="${synonym}", searchName="${searchName}", alias="${alias}"`);

    // Buscar na base de dados
    let food = null;
    
    // 1) Tentar aliases
    const { data: aliasHit } = await supabase
      .from('nutrition_aliases')
      .select('food_id')
      .eq('alias_normalized', alias)
      .limit(1);

    let foodId = aliasHit?.[0]?.food_id ?? null;
    console.log(`🔗 Alias hit: foodId=${foodId}`);

    // 2) Se não encontrou, buscar por nome similar
    if (!foodId) {
      const { data: ilikeFoods } = await supabase
        .from('nutrition_foods')
        .select('*')
        .ilike('canonical_name', `%${searchName}%`)
        .eq('locale', 'pt-BR')
        .limit(5);
      
      console.log(`🔍 ilike foods:`, ilikeFoods?.map(f => `${f.canonical_name} (${f.kcal} kcal)`));
      
      if (ilikeFoods && ilikeFoods.length > 0) {
        // Preferir comidas com macros não zerados
        const nonZero = ilikeFoods.filter(f => (Number(f.kcal)||0) > 0 || (Number(f.protein_g)||0) > 0);
        food = nonZero.length > 0 ? nonZero[0] : ilikeFoods[0];
        console.log(`✅ Selecionado: ${food.canonical_name} (${food.kcal} kcal, ${food.protein_g}g prot)`);
      }
    } else {
      const { data: foods } = await supabase
        .from('nutrition_foods')
        .select('*')
        .eq('id', foodId)
        .limit(1);
      food = foods?.[0];
      console.log(`✅ Food por ID: ${food?.canonical_name} (${food?.kcal} kcal)`);
    }

    if (!food) {
      console.log('❌ Nenhuma comida encontrada!');
      continue;
    }

    // Calcular gramas efetivas
    let grams = Number(item.grams || 0);
    console.log(`⚖️ Gramas: ${grams}g`);

    // Aplicar fator de porção comestível se existir
    if (food.edible_portion_factor && Number(food.edible_portion_factor) > 0) {
      grams = grams * Number(food.edible_portion_factor);
      console.log(`⚖️ Gramas após EPF: ${grams}g`);
    }

    // Calcular nutrientes (por 100g)
    const factor = grams / 100.0;
    console.log(`🧮 Fator (${grams}/100): ${factor}`);
    
    const nutrients = {
      kcal: Number(food.kcal || 0) * factor,
      protein_g: Number(food.protein_g || 0) * factor,
      fat_g: Number(food.fat_g || 0) * factor,
      carbs_g: Number(food.carbs_g || 0) * factor,
      fiber_g: Number(food.fiber_g || 0) * factor,
      sodium_mg: Number(food.sodium_mg || 0) * factor,
    };

    console.log(`📊 Nutrientes calculados:`, nutrients);

    totals.kcal += nutrients.kcal;
    totals.protein_g += nutrients.protein_g;
    totals.fat_g += nutrients.fat_g;
    totals.carbs_g += nutrients.carbs_g;
    totals.fiber_g += nutrients.fiber_g;
    totals.sodium_mg += nutrients.sodium_mg;
  }

  console.log('\n🎯 RESULTADO FINAL:', totals);
  console.log('\n✅ Esperado para 50g ovo: ~78 kcal, ~6.5g prot, ~5.5g gord, ~0.6g carbo');
}

debugNutrition().catch(console.error);
