// Teste completo do Google Fit
// Execute este script no console do navegador

async function testCompleteGoogleFit() {
  console.log('🧪 TESTE COMPLETO DO GOOGLE FIT');
  console.log('================================');
  
  try {
    // 1. Verificar se o usuário está logado
    console.log('\n1️⃣ Verificando autenticação...');
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
      console.log('❌ Usuário não está logado');
      return;
    }
    console.log('✅ Usuário logado:', session.user.email);
    
    // 2. Testar a função simplificada
    console.log('\n2️⃣ Testando Edge Function simplificada...');
    const testResponse = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/google-fit-token-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token
      },
      body: JSON.stringify({
        testSecrets: true
      })
    });
    
    console.log('📊 Status do teste:', testResponse.status);
    const testData = await testResponse.text();
    console.log('📄 Resposta do teste:', testData);
    
    // 3. Verificar se as credenciais estão configuradas
    let testResult;
    try {
      testResult = JSON.parse(testData);
    } catch (e) {
      console.log('❌ Resposta não é JSON válido');
      return;
    }
    
    if (testResult.clientIdDefined && testResult.clientSecretDefined) {
      console.log('✅ Credenciais configuradas corretamente');
    } else {
      console.log('❌ Credenciais não configuradas');
      return;
    }
    
    // 4. Simular OAuth com código fake
    console.log('\n3️⃣ Testando troca de token com código fake...');
    const oauthResponse = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/google-fit-token-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token
      },
      body: JSON.stringify({
        code: '4/0AeanS0b1234567890_fake_code_for_testing'
      })
    });
    
    console.log('📊 Status do OAuth:', oauthResponse.status);
    const oauthData = await oauthResponse.text();
    console.log('📄 Resposta do OAuth:', oauthData);
    
    // 5. Verificar se a tabela existe
    console.log('\n4️⃣ Verificando tabela google_fit_tokens...');
    const { data: tableData, error: tableError } = await window.supabase
      .from('google_fit_tokens')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Erro ao acessar tabela:', tableError.message);
    } else {
      console.log('✅ Tabela google_fit_tokens acessível');
    }
    
    // 6. Verificar tabela google_fit_data
    console.log('\n5️⃣ Verificando tabela google_fit_data...');
    const { data: dataTableData, error: dataTableError } = await window.supabase
      .from('google_fit_data')
      .select('count')
      .limit(1);
    
    if (dataTableError) {
      console.log('❌ Erro ao acessar tabela google_fit_data:', dataTableError.message);
    } else {
      console.log('✅ Tabela google_fit_data acessível');
    }
    
    console.log('\n🎯 RESUMO DO TESTE:');
    console.log('- Usuário logado:', !!session);
    console.log('- Credenciais configuradas:', testResult.clientIdDefined && testResult.clientSecretDefined);
    console.log('- Tabela tokens acessível:', !tableError);
    console.log('- Tabela dados acessível:', !dataTableError);
    console.log('- Edge Function responde:', testResponse.status === 200);
    
    if (testResult.clientIdDefined && testResult.clientSecretDefined && !tableError && !dataTableError) {
      console.log('\n✅ TUDO PRONTO! Pode testar o OAuth real agora.');
    } else {
      console.log('\n❌ Há problemas para resolver antes de testar o OAuth.');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste completo:', error);
  }
}

// Executar o teste
testCompleteGoogleFit();
