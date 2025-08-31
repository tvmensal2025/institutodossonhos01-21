import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSofiaDeterministic() {
  console.log('🧪 TESTANDO SOFIA DETERMINÍSTICA');
  console.log('================================');
  
  try {
    // Teste: Prato executivo (arroz + frango + batata frita + salada)
    const testFoods = [
      { name: 'arroz branco cozido', grams: 150 },
      { name: 'frango grelhado', grams: 120 },
      { name: 'batata frita', grams: 80 },
      { name: 'salada', grams: 50 }
    ];
    
    console.log('📋 Alimentos de teste:');
    testFoods.forEach(food => {
      console.log(`   • ${food.name}: ${food.grams}g`);
    });
    
    console.log('\n🔍 Chamando sofia-deterministic...');
    
    const { data, error } = await supabase.functions.invoke('sofia-deterministic', {
      body: {
        detected_foods: testFoods,
        user_id: 'test-user-123',
        analysis_type: 'nutritional_sum'
      }
    });
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }
    
    console.log('\n✅ RESULTADO:');
    console.log('=============');
    console.log(data.sofia_response);
    console.log('\n📊 DADOS NUTRICIONAIS:');
    console.log(data.nutrition_data);
    
    // Validar se os valores estão corretos
    const nutrition = data.nutrition_data;
    console.log('\n🎯 VALIDAÇÃO:');
    console.log(`Calorias: ${nutrition.total_kcal} kcal (esperado ~600-800)`);
    console.log(`Proteínas: ${nutrition.total_proteina}g (esperado ~35-45g)`);
    console.log(`Carboidratos: ${nutrition.total_carbo}g (esperado ~60-80g)`);
    console.log(`Gorduras: ${nutrition.total_gordura}g (esperado ~15-25g)`);
    console.log(`Itens encontrados: ${nutrition.matched_count}/${nutrition.total_count}`);
    
    if (nutrition.matched_count === nutrition.total_count) {
      console.log('\n🎉 SUCESSO! Todos os alimentos foram encontrados na tabelataco.');
    } else {
      console.log('\n⚠️ Alguns alimentos não foram encontrados:', nutrition.unmatched_items);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testSofiaDeterministic();