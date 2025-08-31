// Teste simples das Edge Functions
// Execute este script no console do navegador

async function testSimple() {
  console.log('🧪 TESTE SIMPLES DAS EDGE FUNCTIONS');
  console.log('====================================');
  
  try {
    // 1. Testar função básica
    console.log('\n1️⃣ Testando função google-fit-test...');
    const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/google-fit-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log('📊 Status:', response.status);
    const data = await response.text();
    console.log('📄 Resposta:', data);
    
    if (response.ok) {
      console.log('✅ Função básica funcionando!');
    } else {
      console.log('❌ Função básica falhou');
    }
    
    // 2. Testar função simplificada
    console.log('\n2️⃣ Testando função google-fit-token-simple...');
    const response2 = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/google-fit-token-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        testSecrets: true
      })
    });
    
    console.log('📊 Status:', response2.status);
    const data2 = await response2.text();
    console.log('📄 Resposta:', data2);
    
    if (response2.ok) {
      console.log('✅ Função simplificada funcionando!');
    } else {
      console.log('❌ Função simplificada falhou');
    }
    
    // 3. Testar função original
    console.log('\n3️⃣ Testando função google-fit-token original...');
    const response3 = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/google-fit-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        testSecrets: true
      })
    });
    
    console.log('📊 Status:', response3.status);
    const data3 = await response3.text();
    console.log('📄 Resposta:', data3);
    
    if (response3.ok) {
      console.log('✅ Função original funcionando!');
    } else {
      console.log('❌ Função original falhou');
    }
    
    console.log('\n🎯 RESUMO:');
    console.log('- Função básica:', response.ok ? '✅' : '❌');
    console.log('- Função simplificada:', response2.ok ? '✅' : '❌');
    console.log('- Função original:', response3.ok ? '✅' : '❌');
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar o teste
testSimple();
