// 🧪 Teste de Integração da Sofia (sem YOLO)
// Testa se a Edge Function está funcionando corretamente

const { createClient } = require('@supabase/supabase-js');

// Configuração (substitua pelas suas credenciais)
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = 'your-service-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testSofiaImageAnalysis() {
  console.log('🧪 Testando Sofia Image Analysis...');
  
  try {
    // Imagem de teste (pizza)
    const testImageUrl = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800';
    
    console.log('📸 Enviando imagem para análise...');
    
    const { data, error } = await supabase.functions.invoke('sofia-image-analysis', {
      body: {
        imageUrl: testImageUrl,
        userId: 'test-user',
        userContext: {
          currentMeal: 'refeicao',
          userName: 'Teste'
        }
      }
    });
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      return false;
    }
    
    console.log('✅ Sofia respondeu com sucesso!');
    console.log('📊 Dados da resposta:', JSON.stringify(data, null, 2));
    
    // Verificar se a resposta tem a estrutura esperada
    if (data && typeof data === 'object') {
      console.log('✅ Estrutura da resposta válida');
      
      if (data.success !== undefined) {
        console.log('✅ Campo "success" presente');
      }
      
      if (data.food_detection || data.sofia_analysis) {
        console.log('✅ Análise de alimentos presente');
      }
      
      return true;
    } else {
      console.log('⚠️ Resposta não tem estrutura esperada');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

async function testHealthChatBot() {
  console.log('🧪 Testando Health Chat Bot...');
  
  try {
    console.log('💬 Enviando mensagem de teste...');
    
    const { data, error } = await supabase.functions.invoke('health-chat-bot', {
      body: {
        message: 'Olá Sofia! Como você está?',
        userId: 'test-user',
        userName: 'Teste',
        hasImage: false
      }
    });
    
    if (error) {
      console.error('❌ Erro no Health Chat Bot:', error);
      return false;
    }
    
    console.log('✅ Health Chat Bot respondeu!');
    console.log('📊 Resposta:', data);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de integração da Sofia...');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Sofia Image Analysis', func: testSofiaImageAnalysis },
    { name: 'Health Chat Bot', func: testHealthChatBot }
  ];
  
  let passed = 0;
  
  for (const test of tests) {
    console.log(`\n🔬 ${test.name}`);
    console.log('-'.repeat(30));
    
    const startTime = Date.now();
    const success = await test.func();
    const duration = Date.now() - startTime;
    
    const status = success ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`⏱️ Duração: ${duration}ms`);
    console.log(`📊 Status: ${status}`);
    
    if (success) passed++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(50));
  console.log(`📈 Resultado: ${passed}/${tests.length} testes passaram`);
  
  if (passed === tests.length) {
    console.log('🎉 Todos os testes passaram! Sofia está funcionando perfeitamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique as configurações.');
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testSofiaImageAnalysis, testHealthChatBot };
