// ========================================
// TESTE DA SOFIA MELHORADA
// ========================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarSofiaMelhorada() {
  console.log('🧪 Testando Sofia melhorada...');
  
  try {
    // Teste 1: Imagem com alimentos claros
    console.log('\n📸 Teste 1: Imagem com alimentos claros');
    const resultado1 = await supabase.functions.invoke('sofia-image-analysis', {
      body: {
        imageUrl: 'https://exemplo.com/imagem-comida-clara.jpg',
        userId: 'test-user-id',
        userContext: {
          currentMeal: 'lunch',
          message: 'Teste de análise'
        }
      }
    });
    
    console.log('✅ Resultado 1:', resultado1.data);
    
    // Teste 2: Imagem sem alimentos claros
    console.log('\n📸 Teste 2: Imagem sem alimentos claros');
    const resultado2 = await supabase.functions.invoke('sofia-image-analysis', {
      body: {
        imageUrl: 'https://exemplo.com/imagem-sem-comida.jpg',
        userId: 'test-user-id',
        userContext: {
          currentMeal: 'lunch',
          message: 'Teste de análise'
        }
      }
    });
    
    console.log('✅ Resultado 2:', resultado2.data);
    
    // Teste 3: Imagem com detecção incorreta
    console.log('\n📸 Teste 3: Imagem com detecção incorreta');
    const resultado3 = await supabase.functions.invoke('sofia-image-analysis', {
      body: {
        imageUrl: 'https://exemplo.com/imagem-omelete.jpg',
        userId: 'test-user-id',
        userContext: {
          currentMeal: 'lunch',
          message: 'Teste de análise'
        }
      }
    });
    
    console.log('✅ Resultado 3:', resultado3.data);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarSofiaMelhorada();