// 🧪 Teste Sofia Versátil
// Testa se a Sofia reconhece diferentes tipos de conteúdo

import { createClient } from '@supabase/supabase-js';

// Configuração
const SUPABASE_URL = 'https://hlrkoyywjpckdotimtik.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testSofiaVersatil() {
  console.log('🧪 Testando Sofia Versátil...');
  
  const testCases = [
    {
      name: '🍕 Comida (Pizza)',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
      expectedType: 'food'
    },
    {
      name: '📄 Documento',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
      expectedType: 'document'
    },
    {
      name: '🏠 Lugar',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
      expectedType: 'place'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📸 Testando: ${testCase.name}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('sofia-image-analysis', {
        body: {
          imageUrl: testCase.imageUrl,
          userId: 'test-user',
          userContext: {
            currentMeal: 'refeicao',
            userName: 'Teste'
          }
        }
      });
      
      if (error) {
        console.error('❌ Erro:', error);
        continue;
      }
      
      console.log('✅ Sofia respondeu!');
      console.log('📊 Tipo detectado:', data?.food_detection?.is_food ? 'Comida' : 'Outro');
      console.log('🤖 Análise:', data?.sofia_analysis?.analysis?.substring(0, 100) + '...');
      
      // Verificar se a resposta é apropriada para o tipo
      const isFood = data?.food_detection?.is_food || false;
      const isExpected = (testCase.expectedType === 'food' && isFood) || 
                        (testCase.expectedType !== 'food' && !isFood);
      
      console.log(`📊 Resultado: ${isExpected ? '✅ CORRETO' : '❌ INCORRETO'}`);
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  }
}

async function runTest() {
  console.log('🚀 Teste Sofia Versátil');
  console.log('='.repeat(50));
  
  await testSofiaVersatil();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Teste concluído!');
  console.log('A Sofia agora deve ser mais versátil e reconhecer diferentes tipos de conteúdo.');
}

// Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().catch(console.error);
}
