import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlrkoyywjpckdotimtik.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTgzODA0MSwiZXhwIjoyMDUxNDE0MDQxfQ.u6hCHzOY3m5ELvG6WY7Lbt7TnoYgEFXVWA8Fm2E7EWU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testRobustBase() {
  console.log('🧪 TESTANDO BASE ROBUSTA TACO...\n');
  
  try {
    // 1. Verificar quantos alimentos temos
    const { data: count } = await supabase
      .from('valores_nutricionais_completos')
      .select('*', { count: 'exact' });
    
    console.log(`📊 Total de alimentos na base: ${count?.length || 0}`);
    
    // 2. Testar busca por ovo
    const { data: ovos } = await supabase
      .from('valores_nutricionais_completos')
      .select('alimento_nome, kcal, proteina, gorduras, carboidratos')
      .ilike('alimento_nome', '%ovo%');
    
    console.log('\n🥚 DADOS DE OVOS:');
    ovos?.forEach(ovo => {
      console.log(`  - ${ovo.alimento_nome}: ${ovo.kcal} kcal, ${ovo.proteina}g prot, ${ovo.gorduras}g gord, ${ovo.carboidratos}g carbs`);
    });
    
    // 3. Testar busca por arroz
    const { data: arroz } = await supabase
      .from('valores_nutricionais_completos')
      .select('alimento_nome, kcal, proteina, gorduras, carboidratos')
      .ilike('alimento_nome', '%arroz%');
    
    console.log('\n🍚 DADOS DE ARROZ:');
    arroz?.forEach(a => {
      console.log(`  - ${a.alimento_nome}: ${a.kcal} kcal, ${a.proteina}g prot, ${a.gorduras}g gord, ${a.carboidratos}g carbs`);
    });
    
    // 4. Testar busca por frango
    const { data: frango } = await supabase
      .from('valores_nutricionais_completos')
      .select('alimento_nome, kcal, proteina, gorduras, carboidratos')
      .ilike('alimento_nome', '%frango%');
    
    console.log('\n🍗 DADOS DE FRANGO:');
    frango?.forEach(f => {
      console.log(`  - ${f.alimento_nome}: ${f.kcal} kcal, ${f.proteina}g prot, ${f.gorduras}g gord, ${f.carboidratos}g carbs`);
    });
    
    // 5. Teste de cálculo simples: 50g de ovo
    console.log('\n🧮 TESTE DE CÁLCULO:');
    if (ovos && ovos.length > 0) {
      const ovo = ovos[0];
      const grams = 50;
      const kcalPor100g = ovo.kcal;
      const kcalPor50g = (kcalPor100g * grams) / 100;
      
      console.log(`  📊 50g de ${ovo.alimento_nome}:`);
      console.log(`     - Dados base: ${kcalPor100g} kcal/100g`);
      console.log(`     - Cálculo: (${kcalPor100g} × 50) ÷ 100 = ${kcalPor50g.toFixed(1)} kcal`);
      console.log(`     - ✅ RESULTADO ESPERADO: ~77.5 kcal (deve estar próximo)`);
    }
    
    console.log('\n✅ TESTE CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testRobustBase();
