// Usando fetch nativo do Node.js

async function testarSofiaPrincipal() {
  console.log('🔍 TESTANDO SOFIA PRINCIPAL');
  console.log('=====================================');
  
  try {
    // Testar a função principal da Sofia
    const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/sofia-image-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI'
      },
      body: JSON.stringify({
        imageUrl: 'https://example.com/test-image.jpg',
        userId: 'test-user-123',
        userProfile: {
          goals: ['perda_peso'],
          age: 30,
          activity_level: 'moderate'
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sofia principal funcionando!');
      console.log('📊 Resposta:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Erro na Sofia principal:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('📝 Detalhes do erro:', errorText);
    }
  } catch (error) {
    console.log('❌ Erro ao testar Sofia principal:', error.message);
  }
}

testarSofiaPrincipal();
