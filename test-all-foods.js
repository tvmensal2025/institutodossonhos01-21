// Teste rápido para verificar se o sistema melhorado detecta todos os tipos de alimentos
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAllFoods() {
  console.log('🧪 TESTANDO DETECÇÃO MELHORADA DE ALIMENTOS');
  console.log('='.repeat(50));
  
  const testImages = [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591', // Pizza
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add', // Burger
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3', // Bolo
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'  // Salada
  ];
  
  for (let i = 0; i < testImages.length; i++) {
    console.log(`\n📸 Teste ${i + 1}:`, testImages[i]);
    
    try {
      const { data, error } = await supabase.functions.invoke('sofia-image-analysis', {
        body: {
          imageUrl: testImages[i],
          userId: 'test-user',
          userContext: { currentMeal: 'refeicao', userName: 'Teste' }
        }
      });
      
      if (error) {
        console.error('❌ Erro:', error);
      } else {
        console.log('✅ Sucesso!');
        console.log('🍽️ Alimentos:', data?.sofia_analysis?.foods_detected || 'Nenhum');
        console.log('🔥 Calorias:', data?.sofia_analysis?.estimated_calories || 0);
      }
    } catch (err) {
      console.error('❌ Erro no teste:', err.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Pausa entre testes
  }
  
  console.log('\n🎉 Teste concluído!');
}

testAllFoods().catch(console.error);