// Teste final do Google Fit
// Execute este script no console do navegador

async function testFinal() {
  console.log('🧪 TESTE FINAL DO GOOGLE FIT');
  console.log('============================');
  
  try {
    // 1. Verificar se o usuário está logado
    console.log('\n1️⃣ Verificando autenticação...');
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
      console.log('❌ Usuário não está logado');
      console.log('💡 Faça login primeiro em http://localhost:8083/auth');
      return;
    }
    console.log('✅ Usuário logado:', session.user.email);
    
    // 2. Testar a função google-fit-token
    console.log('\n2️⃣ Testando função google-fit-token...');
    const { data, error } = await window.supabase.functions.invoke('google-fit-token', {
      body: {
        testSecrets: true
      }
    });
    
    if (error) {
      console.log('❌ Erro na função:', error.message);
      return;
    }
    
    console.log('✅ Função funcionando:', data);
    
    // 3. Verificar credenciais
    if (data.clientIdDefined && data.clientSecretDefined) {
      console.log('✅ Credenciais configuradas');
    } else {
      console.log('❌ Credenciais não configuradas');
      return;
    }
    
    // 4. Verificar tabelas
    console.log('\n3️⃣ Verificando tabelas...');
    
    const { data: tokensData, error: tokensError } = await window.supabase
      .from('google_fit_tokens')
      .select('count')
      .limit(1);
    
    if (tokensError) {
      console.log('❌ Erro na tabela google_fit_tokens:', tokensError.message);
    } else {
      console.log('✅ Tabela google_fit_tokens OK');
    }
    
    const { data: fitData, error: fitError } = await window.supabase
      .from('google_fit_data')
      .select('count')
      .limit(1);
    
    if (fitError) {
      console.log('❌ Erro na tabela google_fit_data:', fitError.message);
    } else {
      console.log('✅ Tabela google_fit_data OK');
    }
    
    console.log('\n🎯 RESUMO FINAL:');
    console.log('- Usuário logado:', !!session);
    console.log('- Credenciais configuradas:', data.clientIdDefined && data.clientSecretDefined);
    console.log('- Tabela tokens:', !tokensError);
    console.log('- Tabela dados:', !fitError);
    
    if (data.clientIdDefined && data.clientSecretDefined && !tokensError && !fitError) {
      console.log('\n✅ TUDO PRONTO! Pode testar o OAuth agora:');
      console.log('🌐 Vá em: http://localhost:8083/google-fit-test');
      console.log('🔗 Clique em: "Conectar OAuth"');
    } else {
      console.log('\n❌ Há problemas para resolver antes de testar o OAuth.');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste final:', error);
  }
}

// Executar o teste
testFinal();
