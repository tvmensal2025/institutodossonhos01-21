import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarSofiaErro() {
  console.log('🧪 TESTANDO ERRO DA SOFIA...\n');

  try {
    // Testar com userId genérico
    const testImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
    
    console.log('📸 Testando com imagem:', testImageUrl);
    
    const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/sofia-image-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        imageUrl: testImageUrl,
        userId: 'test-user-123',
        userContext: {
          currentMeal: 'lunch',
          foodItems: []
        }
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const responseText = await response.text();
    console.log('\nResposta completa:', responseText);

    if (!response.ok) {
      console.error('\n❌ ERRO DETALHADO:');
      try {
        const errorData = JSON.parse(responseText);
        console.error(errorData);
      } catch {
        console.error(responseText);
      }
    } else {
      console.log('\n✅ SUCESSO!');
      const data = JSON.parse(responseText);
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

// Executar teste
testarSofiaErro();