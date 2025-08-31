// Teste da Edge Function google-fit-token
// Execute este script no navegador console

async function testGoogleFitToken() {
  console.log('🧪 Testando Edge Function google-fit-token...');
  
  try {
    // Teste 1: Verificar se a função responde
    const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/google-fit-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (await window.supabase.auth.getSession()).data.session?.access_token
      },
      body: JSON.stringify({
        testSecrets: true
      })
    });
    
    console.log('📊 Status da resposta:', response.status);
    const data = await response.text();
    console.log('📄 Resposta:', data);
    
    if (response.ok) {
      console.log('✅ Edge Function está funcionando!');
    } else {
      console.log('❌ Edge Function retornou erro:', response.status);
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar o teste
testGoogleFitToken();
