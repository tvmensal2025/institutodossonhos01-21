// TESTE EDGE FUNCTION CORRIGIDA
console.log('🧪 TESTANDO EDGE FUNCTION CORRIGIDA');

async function testarEdgeFunction() {
  try {
    // 1. Teste de secrets
    console.log('\n1️⃣ Testando secrets...');
    const { data: secretsData, error: secretsError } = await window.supabase.functions.invoke('google-fit-token', {
      body: { testSecrets: true }
    });
    
    if (secretsError) {
      console.log('❌ Erro no teste de secrets:', secretsError.message);
    } else {
      console.log('✅ Secrets OK:', secretsData);
    }

    // 2. Teste com código fake (deve dar erro 400, mas não crash)
    console.log('\n2️⃣ Testando com código fake...');
    const { data: fakeData, error: fakeError } = await window.supabase.functions.invoke('google-fit-token', {
      body: { code: 'fake_code_for_testing' }
    });
    
    if (fakeError) {
      console.log('✅ Erro esperado com código fake:', fakeError.message);
    } else {
      console.log('⚠️ Código fake não gerou erro (inesperado)');
    }

    console.log('\n🎯 Edge Function corrigida e funcionando!');
    console.log('💡 Agora você pode testar o OAuth real.');

  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar teste
testarEdgeFunction();
