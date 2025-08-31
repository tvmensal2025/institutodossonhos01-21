import { createClient } from '@supabase/supabase-js';

// Configurar cliente Supabase com autenticação
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI2NzAsImV4cCI6MjA1MTI0ODY3MH0.80f8f319d66e7e9e0ab9bc4deb8201d07649b9327356caaa441b7603d1f4358a';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGoogleAIDetailed() {
  console.log('🧪 Testando IA da Sofia com nova chave...');
  
  try {
    // Primeiro, fazer login como usuário
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fa@gmail.com',
      password: '123456' // Senha de teste
    });

    if (authError) {
      console.log('⚠️ Erro de autenticação:', authError.message);
      console.log('📤 Testando sem autenticação...');
    } else {
      console.log('✅ Autenticado como:', authData.user.email);
    }

    console.log('📤 Enviando mensagem: "fome"');
    
    const { data, error } = await supabase.functions.invoke('health-chat-bot', {
      body: {
        message: 'fome',
        userId: 'dd77ccfd-bc48-493d-9a01-257f5e8a1f2d', // Larissa
        conversationHistory: []
      }
    });

    if (error) {
      console.log('❌ Erro:', error);
    } else {
      console.log('✅ Resposta:', data.response);
      console.log('🤖 IA ativa:', !data.response.includes('temporariamente indisponível'));
      
      if (!data.response.includes('temporariamente indisponível')) {
        console.log('🎉 SUCESSO! IA da Sofia funcionando!');
      } else {
        console.log('⚠️ IA ainda retornando fallback');
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testGoogleAIDetailed(); 