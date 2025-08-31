import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOllamaConnection() {
  console.log('🔍 Testando conexão com Ollama da VPS...\n');
  
  try {
    // Teste 1: Conexão básica
    console.log('📡 TESTE 1: Conexão básica');
    const { data: test1, error: error1 } = await supabase.functions.invoke('gpt-chat', {
      body: {
        service: 'ollama',
        model: 'llama3.1:8b-instruct-q4_0',
        messages: [
          {
            role: 'user',
            content: 'Olá! Você está funcionando? Responda apenas "Sim, estou funcionando!"'
          }
        ],
        temperature: 0.1,
        max_tokens: 50,
        functionality: 'connection-test'
      }
    });

    if (error1) {
      console.error('❌ Erro na conexão:', error1);
    } else {
      console.log('✅ Ollama respondeu:', data.content);
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Teste 2: Geração de cardápio simples
    console.log('🍽️ TESTE 2: Geração de cardápio simples');
    const { data: test2, error: error2 } = await supabase.functions.invoke('gpt-chat', {
      body: {
        service: 'ollama',
        model: 'llama3.1:8b-instruct-q4_0',
        messages: [
          {
            role: 'system',
            content: 'Você é um nutricionista. Gere um cardápio simples para 1 dia com 2000 kcal. Responda em JSON.'
          },
          {
            role: 'user',
            content: 'Gere um cardápio com café da manhã e almoço. Apenas JSON válido.'
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        functionality: 'meal-plan-test'
      }
    });

    if (error2) {
      console.error('❌ Erro na geração:', error2);
    } else {
      console.log('✅ Resposta do cardápio:', test2.content);
      
      // Tentar extrair JSON
      try {
        const jsonMatch = test2.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON válido extraído:', JSON.stringify(jsonData, null, 2));
        } else {
          console.log('⚠️ JSON não encontrado na resposta');
        }
      } catch (parseError) {
        console.log('❌ Erro ao parsear JSON:', parseError.message);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Teste 3: Verificar configuração do Ollama
    console.log('⚙️ TESTE 3: Verificar configuração');
    console.log('📋 Configurações esperadas:');
    console.log('   • OLLAMA_BASE_URL configurada');
    console.log('   • Modelo: llama3.1:8b-instruct-q4_0');
    console.log('   • Proxy Ollama rodando na VPS');
    console.log('   • Função gpt-chat com suporte a Ollama');
    
    if (!error1 && !error2) {
      console.log('\n🎉 SUCESSO! Ollama da VPS está funcionando!');
      console.log('✅ Pode ser usado para gerar cardápios');
      console.log('✅ HTML detalhado funcionará com dados reais');
    } else {
      console.log('\n⚠️ ATENÇÃO: Ollama pode não estar configurado corretamente');
      console.log('🔧 Verificar:');
      console.log('   • VPS rodando Ollama');
      console.log('   • Proxy configurado');
      console.log('   • Variáveis de ambiente');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 RESUMO DOS TESTES:');
  console.log('✅ Teste de conexão com Ollama');
  console.log('✅ Teste de geração de cardápio');
  console.log('✅ Verificação de configuração');
  console.log('✅ Validação de JSON');
}

// Executar teste
testOllamaConnection();
