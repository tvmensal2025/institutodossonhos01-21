import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDI5NzI5NiwiZXhwIjoyMDUwNTczMjk2fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTacoBase() {
  try {
    console.log('🧪 Testando base TACO...');
    
    // Testar busca por alimentos específicos
    const testFoods = [
      'arroz',
      'frango',
      'ovo',
      'batata',
      'queijo',
      'pão',
      'macarrão',
      'lasanha'
    ];
    
    for (const food of testFoods) {
      console.log(`\n🔍 Testando: ${food}`);
      
      const { data, error } = await supabase
        .from('valores_nutricionais_completos')
        .select('alimento_nome, kcal, proteina, gorduras, carboidratos, fibras, sodio')
        .ilike('alimento_nome', `%${food}%`)
        .limit(3);
      
      if (error) {
        console.error(`❌ Erro ao buscar ${food}:`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Encontrados ${data.length} resultados para ${food}:`);
        data.forEach((item, i) => {
          console.log(`  ${i + 1}. ${item.alimento_nome}`);
          console.log(`     Calorias: ${item.kcal} kcal`);
          console.log(`     Proteína: ${item.proteina}g`);
          console.log(`     Carboidratos: ${item.carboidratos}g`);
          console.log(`     Gorduras: ${item.gorduras}g`);
        });
      } else {
        console.log(`⚠️ Nenhum resultado encontrado para ${food}`);
      }
    }
    
    // Testar cálculo nutricional
    console.log('\n🧮 Testando cálculo nutricional...');
    
    const testItems = [
      { name: 'arroz', grams: 100 },
      { name: 'frango', grams: 150 },
      { name: 'ovo', grams: 50 }
    ];
    
    let totals = { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
    
    for (const item of testItems) {
      const { data } = await supabase
        .from('valores_nutricionais_completos')
        .select('alimento_nome, kcal, proteina, gorduras, carboidratos, fibras, sodio')
        .ilike('alimento_nome', `%${item.name}%`)
        .limit(1);
      
      if (data && data.length > 0) {
        const food = data[0];
        const factor = item.grams / 100.0;
        
        const nutrients = {
          kcal: Number(food.kcal || 0) * factor,
          protein_g: Number(food.proteina || 0) * factor,
          fat_g: Number(food.gorduras || 0) * factor,
          carbs_g: Number(food.carboidratos || 0) * factor,
          fiber_g: Number(food.fibras || 0) * factor,
          sodium_mg: Number(food.sodio || 0) * factor,
        };
        
        totals.kcal += nutrients.kcal;
        totals.protein_g += nutrients.protein_g;
        totals.fat_g += nutrients.fat_g;
        totals.carbs_g += nutrients.carbs_g;
        totals.fiber_g += nutrients.fiber_g;
        totals.sodium_mg += nutrients.sodium_mg;
        
        console.log(`✅ ${item.name} (${item.grams}g): ${Math.round(nutrients.kcal)} kcal`);
      }
    }
    
    console.log('\n📊 Totais do prato teste:');
    console.log(`   Calorias: ${Math.round(totals.kcal)} kcal`);
    console.log(`   Proteína: ${Math.round(totals.protein_g)}g`);
    console.log(`   Carboidratos: ${Math.round(totals.carbs_g)}g`);
    console.log(`   Gorduras: ${Math.round(totals.fat_g)}g`);
    console.log(`   Fibras: ${Math.round(totals.fiber_g)}g`);
    console.log(`   Sódio: ${Math.round(totals.sodium_mg)}mg`);
    
    // Verificar total de alimentos na base
    const { count } = await supabase
      .from('valores_nutricionais_completos')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📈 Total de alimentos na base TACO: ${count}`);
    
    console.log('\n✅ Teste da base TACO concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testTacoBase();
