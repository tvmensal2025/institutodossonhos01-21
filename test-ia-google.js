import { createClient } from '@supabase/supabase-js';

// Configurar cliente Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI2NzAsImV4cCI6MjA1MTI0ODY3MH0.80f8f319d66e7e9e0ab9bc4deb8201d07649b9327356caaa441b7603d1f4358a';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGoogleAI() {
  console.log('🧪 Testando IA do Google...');
  
  try {
    // Testar com diferentes tipos de mensagens
    const testMessages = [
      'Oi, como me chamo?',
      'Estou com fome',
      'Como está meu peso?',
      'Quero fazer exercícios',
      'Tenho uma meta'
    ];

    for (const message of testMessages) {
      console.log(`\n📤 Testando: "${message}"`);
      
      const { data, error } = await supabase.functions.invoke('health-chat-bot', {
        body: {
          message: message,
          userId: 'dd77ccfd-bc48-493d-9a01-257f5e8a1f2d', // Larissa
          conversationHistory: []
        }
      });

      if (error) {
        console.log('❌ Erro:', error);
      } else {
        console.log('✅ Resposta:', data.response);
        console.log('🤖 IA ativa:', data.response.includes('Sofia') || data.response.includes('Sof.ia'));
      }
      
      // Aguardar entre testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testGoogleAI(); 