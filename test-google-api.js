// Teste direto da API do Google
async function testGoogleAPI() {
  console.log('🧪 Testando API do Google com a nova chave...');
  
  const GOOGLE_AI_API_KEY = 'AIzaSyCOdeLu7T_uhCcXlTzZgat5wbo8Y-0DbNc';
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Olá, como você está?' }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 100,
        }
      })
    });

    console.log('📡 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta:', data.candidates?.[0]?.content?.parts?.[0]?.text);
      console.log('🎉 API do Google funcionando!');
    } else {
      const errorText = await response.text();
      console.log('❌ Erro:', errorText);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testGoogleAPI(); 