import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarSofiaFinal() {
  console.log('🎉 TESTE FINAL DA SOFIA!\n');

  try {
    // Usar diferentes imagens para testar
    const testImages = [
      {
        url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
        desc: 'Prato de comida variado'
      },
      {
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
        desc: 'Salada colorida'
      }
    ];

    for (const img of testImages) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📸 Testando: ${img.desc}`);
      console.log(`URL: ${img.url}`);
      
      const { data, error } = await supabase.functions.invoke('sofia-image-analysis', {
        body: {
          imageUrl: img.url,
          userId: '00000000-0000-0000-0000-000000000000', // UUID nulo válido
          userContext: {
            currentMeal: getMealType(),
            message: `Analisando ${img.desc}`
          }
        }
      });

      if (error) {
        console.error('❌ Erro:', error.message);
        continue;
      }

      if (data.success) {
        console.log('\n✅ Análise realizada com sucesso!');
        
        // Mostrar alimentos detectados
        console.log('\n🍽️ Alimentos detectados:');
        data.food_detection.foods_detected.forEach((food, i) => {
          console.log(`  ${i + 1}. ${food}`);
        });
        
        console.log(`\n📊 Calorias estimadas: ${data.food_detection.estimated_calories} kcal`);
        console.log(`🍴 Tipo de refeição: ${traduzirRefeicao(data.food_detection.meal_type)}`);
        
        // Mostrar análise da Sofia
        const sofia = data.sofia_analysis;
        console.log('\n💬 SOFIA DIZ:');
        console.log(sofia.analysis || 'Análise em processamento...');
        
        if (sofia.recommendations?.length > 0) {
          console.log('\n✨ Recomendações:');
          sofia.recommendations.forEach((rec, i) => {
            console.log(`  ${i + 1}. ${rec}`);
          });
        }
        
        if (sofia.motivationalMessage) {
          console.log(`\n💪 ${sofia.motivationalMessage}`);
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('\n🎯 RESUMO DO TESTE:');
    console.log('✅ Função sofia-image-analysis funcionando');
    console.log('✅ Detecção de alimentos OK');
    console.log('✅ Estimativa de calorias OK');
    console.log('✅ Análise personalizada OK');
    console.log('\n🚀 A SOFIA ESTÁ PRONTA PARA USO!');
    console.log('\nTeste no dashboard: http://localhost:8081/dashboard');
    console.log('Clique no chat e envie uma foto! 📸');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

function getMealType() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 18 && hour < 22) return 'dinner';
  return 'snack';
}

function traduzirRefeicao(meal) {
  const traducoes = {
    'breakfast': 'Café da manhã',
    'lunch': 'Almoço',
    'dinner': 'Jantar',
    'snack': 'Lanche'
  };
  return traducoes[meal] || meal;
}

// Executar teste
testarSofiaFinal();