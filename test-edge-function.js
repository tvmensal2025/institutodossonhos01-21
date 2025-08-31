// Teste detalhado da Edge Function google-fit-token
// Execute este script no console do navegador

async function testEdgeFunction() {
  console.log('🧪 Teste detalhado da Edge Function...');
  
  try {
    // 1. Verificar se o usuário está logado
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
      console.log('❌ Usuário não está logado');
      return;
    }
    
    console.log('✅ Usuário logado:', session.user.email);
    
    // 2. Testar a Edge Function com um código fake
    const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/google-fit-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token
      },
      body: JSON.stringify({
        code: '4/0AeanS0b1234567890_fake_code_for_testing'
      })
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Resposta completa:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('📄 Resposta JSON:', responseJson);
    } catch (e) {
      console.log('📄 Resposta não é JSON válido');
    }
    
    if (response.ok) {
      console.log('✅ Edge Function funcionou!');
    } else {
      console.log('❌ Edge Function falhou com status:', response.status);
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar o teste
testEdgeFunction();
