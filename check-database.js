import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlrkoyywjpckdotimtik.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzE4NjU5MiwiZXhwIjoyMDMyNzYyNTkyfQ.WQRmY7TDo5_rPkh_dqJZJlBBcjkqfI4R4sQrZBCYzro';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkDatabase() {
  console.log('🔍 Verificando estado das tabelas...\n');

  // 1) Verificar se tabela nutrition_foods existe e tem dados
  console.log('1️⃣ TABELA nutrition_foods:');
  const { data: nutritionFoods, error: nutritionError } = await supabase
    .from('nutrition_foods')
    .select('count(*)', { count: 'exact' });
    
  if (nutritionError) {
    console.log('❌ Erro:', nutritionError.message);
  } else {
    console.log(`📊 Total de registros: ${nutritionFoods?.[0]?.count || 0}`);
  }

  // 2) Verificar tabela nutrition_aliases
  console.log('\n2️⃣ TABELA nutrition_aliases:');
  const { data: aliases, error: aliasError } = await supabase
    .from('nutrition_aliases')
    .select('count(*)', { count: 'exact' });
    
  if (aliasError) {
    console.log('❌ Erro:', aliasError.message);
  } else {
    console.log(`📊 Total de aliases: ${aliases?.[0]?.count || 0}`);
  }

  // 3) Verificar se tabela alimentos ainda existe (antiga)
  console.log('\n3️⃣ TABELA alimentos (antiga):');
  const { data: alimentos, error: alimentosError } = await supabase
    .from('alimentos')
    .select('count(*)', { count: 'exact' });
    
  if (alimentosError) {
    console.log('❌ Erro:', alimentosError.message);
  } else {
    console.log(`📊 Total de alimentos: ${alimentos?.[0]?.count || 0}`);
  }

  // 4) Listar algumas amostras de nutrition_foods
  console.log('\n4️⃣ AMOSTRAS nutrition_foods:');
  const { data: samples } = await supabase
    .from('nutrition_foods')
    .select('canonical_name, kcal, protein_g, fat_g, carbs_g')
    .limit(5);
    
  if (samples && samples.length > 0) {
    samples.forEach(food => {
      console.log(`📍 ${food.canonical_name}: ${food.kcal} kcal, ${food.protein_g}g prot`);
    });
  } else {
    console.log('❌ Nenhuma amostra encontrada');
  }

  // 5) Verificar tabela valores_nutricionais_completos (pode ser a que tem dados)
  console.log('\n5️⃣ TABELA valores_nutricionais_completos:');
  const { data: valoresNutricionais, error: valoresError } = await supabase
    .from('valores_nutricionais_completos')
    .select('count(*)', { count: 'exact' });
    
  if (valoresError) {
    console.log('❌ Erro:', valoresError.message);
  } else {
    console.log(`📊 Total de valores: ${valoresNutricionais?.[0]?.count || 0}`);
  }

  // 6) Amostras da tabela valores_nutricionais_completos
  console.log('\n6️⃣ AMOSTRAS valores_nutricionais_completos:');
  const { data: valoresSamples } = await supabase
    .from('valores_nutricionais_completos')
    .select('alimento_nome, kcal, proteina, gorduras, carboidratos')
    .limit(5);
    
  if (valoresSamples && valoresSamples.length > 0) {
    valoresSamples.forEach(food => {
      console.log(`📍 ${food.alimento_nome}: ${food.kcal} kcal, ${food.proteina}g prot, ${food.gorduras}g gord, ${food.carboidratos}g carbo`);
    });
  } else {
    console.log('❌ Nenhuma amostra encontrada');
  }

  // 7) Buscar dados específicos do ovo na tabela antiga
  console.log('\n7️⃣ BUSCAR OVO na tabela valores_nutricionais_completos:');
  const { data: ovosAntigos } = await supabase
    .from('valores_nutricionais_completos')
    .select('*')
    .ilike('alimento_nome', '%ovo%')
    .limit(3);
    
  if (ovosAntigos && ovosAntigos.length > 0) {
    ovosAntigos.forEach(ovo => {
      console.log(`🥚 ${ovo.alimento_nome}: ${ovo.kcal} kcal, ${ovo.proteina}g prot, ${ovo.gorduras}g gord, ${ovo.carboidratos}g carbo`);
    });
  } else {
    console.log('❌ Nenhum ovo encontrado na tabela antiga');
  }
}

checkDatabase().catch(console.error);
