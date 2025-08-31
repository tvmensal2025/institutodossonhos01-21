import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🎯 TESTE COMPLETO DA IA DE ANÁLISE ALIMENTAR
async function testeCompleto() {
  console.log('🧪 INICIANDO TESTE COMPLETO DA IA ALIMENTAR\n');
  console.log('=' .repeat(60));
  
  const resultados = {
    chatBot: false,
    analiseImagem: false,
    salvarDados: false,
    respostaHumana: false,
    calculoNutricional: false
  };

  try {
    // 1. TESTE DO CHAT BOT (SOFIA)
    console.log('\n1️⃣ TESTANDO CHAT DA SOFIA...');
    
    const testeChat = await supabase.functions.invoke('health-chat-bot', {
      body: {
        message: 'Olá Sofia! Estou com fome, pode me ajudar?',
        userId: 'test-user-completo',
        conversationHistory: []
      }
    });

    if (testeChat.data && testeChat.data.response) {
      console.log('✅ Chat da SOFIA funcionando!');
      console.log('💬 Resposta:', testeChat.data.response);
      resultados.chatBot = true;
      
      // Verificar se resposta é humana e empática
      const resposta = testeChat.data.response.toLowerCase();
      if (resposta.includes('olá') || resposta.includes('oi') || resposta.includes('fome') || resposta.includes('ajudar')) {
        resultados.respostaHumana = true;
        console.log('🧠 Resposta é contextual e humana ✅');
      } else {
        console.log('⚠️ Resposta pode não estar contextual');
      }
    } else {
      console.log('❌ Chat não funcionando:', testeChat.error);
    }

    // 2. TESTE DA ANÁLISE DE IMAGEM
    console.log('\n2️⃣ TESTANDO ANÁLISE DE IMAGEM...');
    
    const imagemTeste = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80';
    
    const testeImagem = await supabase.functions.invoke('sofia-image-analysis', {
      body: {
        imageUrl: imagemTeste,
        userId: 'test-user-completo',
        userContext: {
          currentMeal: 'lunch',
          message: 'Analisando meu almoço'
        }
      }
    });

    if (testeImagem.data && testeImagem.data.success) {
      console.log('✅ Análise de imagem funcionando!');
      console.log('🍽️ Alimentos detectados:', testeImagem.data.food_detection?.foods_detected);
      console.log('🤖 Análise da Sofia:', testeImagem.data.sofia_analysis?.analysis);
      resultados.analiseImagem = true;
      
      // Verificar cálculo nutricional
      if (testeImagem.data.food_detection?.estimated_calories) {
        resultados.calculoNutricional = true;
        console.log('📊 Cálculo nutricional OK - Calorias:', testeImagem.data.food_detection.estimated_calories);
      }
    } else {
      console.log('❌ Análise de imagem não funcionando:', testeImagem.error || testeImagem.data?.message);
    }

    // 3. TESTE DE SALVAMENTO DE DADOS
    console.log('\n3️⃣ TESTANDO SALVAMENTO DE DADOS...');
    
    try {
      const { data: savedData, error: saveError } = await supabase
        .from('food_analysis')
        .insert({
          user_id: 'test-user-completo',
          meal_type: 'test',
          food_items: [{ name: 'Teste', calories: 100 }],
          nutrition_analysis: { totalCalories: 100 },
          sofia_analysis: { analysis: 'Teste da Sofia' },
          emotional_state: 'teste'
        })
        .select();

      if (savedData && !saveError) {
        console.log('✅ Salvamento de dados funcionando!');
        console.log('💾 ID salvo:', savedData[0]?.id);
        resultados.salvarDados = true;
        
        // Limpar dados de teste
        await supabase
          .from('food_analysis')
          .delete()
          .eq('user_id', 'test-user-completo');
      } else {
        console.log('❌ Erro no salvamento:', saveError);
      }
    } catch (error) {
      console.log('❌ Erro no teste de salvamento:', error);
    }

    // 4. TESTE DE DIFERENTES TIPOS DE ENTRADA
    console.log('\n4️⃣ TESTANDO DIFERENTES ENTRADAS...');
    
    const tiposEntrada = [
      'Comi um hambúrguer com batata frita',
      'Estou seguindo uma dieta low carb',
      'Preciso de sugestões para o jantar',
      'Como posso melhorar minha alimentação?'
    ];

    for (const entrada of tiposEntrada) {
      const teste = await supabase.functions.invoke('health-chat-bot', {
        body: {
          message: entrada,
          userId: 'test-user-completo',
          conversationHistory: []
        }
      });

      if (teste.data?.response) {
        console.log(`✅ "${entrada.substring(0, 30)}..." → Resposta gerada`);
      } else {
        console.log(`❌ "${entrada.substring(0, 30)}..." → Falhou`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }

  // 5. RELATÓRIO FINAL
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL DOS TESTES:');
  console.log('='.repeat(60));
  
  const totalTestes = Object.keys(resultados).length;
  const testesPassando = Object.values(resultados).filter(Boolean).length;
  const porcentagemSucesso = Math.round((testesPassando / totalTestes) * 100);

  console.log(`\n🎯 RESULTADO GERAL: ${testesPassando}/${totalTestes} testes passando (${porcentagemSucesso}%)\n`);

  Object.entries(resultados).forEach(([teste, passou]) => {
    const status = passou ? '✅' : '❌';
    const nomes = {
      chatBot: 'Chat da SOFIA',
      analiseImagem: 'Análise de Imagem', 
      salvarDados: 'Salvamento de Dados',
      respostaHumana: 'Resposta Humana',
      calculoNutricional: 'Cálculo Nutricional'
    };
    console.log(`${status} ${nomes[teste]}`);
  });

  console.log('\n' + '='.repeat(60));
  
  if (porcentagemSucesso >= 80) {
    console.log('🎉 IA ALIMENTAR ESTÁ FUNCIONANDO CORRETAMENTE!');
    console.log('✅ Pronta para uso comercial');
  } else if (porcentagemSucesso >= 60) {
    console.log('⚠️ IA funcionando parcialmente - precisa de ajustes');
  } else {
    console.log('❌ IA precisa de correções importantes');
  }

  console.log('\n🔗 Próximos passos:');
  console.log('1. Teste no frontend: http://localhost:8088');
  console.log('2. Envie uma foto de comida para análise');
  console.log('3. Converse com a Sofia via chat');
  console.log('4. Verifique se os dados estão sendo salvos');

  return resultados;
}

// Executar teste
testarCompleto();