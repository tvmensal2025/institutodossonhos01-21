import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarSofiaDetalhado() {
  console.log('🧪 TESTE DETALHADO DA SOFIA...\n');

  try {
    // 1. Primeiro, vamos fazer login para ter um userId válido
    console.log('1️⃣ Fazendo login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'rafaeldossantos2026@gmail.com',
      password: 'Senha123!'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError);
      return;
    }

    console.log('✅ Login realizado! User ID:', authData.user.id);

    // 2. Testar com uma imagem simples
    console.log('\n2️⃣ Testando análise de imagem...');
    
    // Usar uma imagem de teste mais simples
    const testImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'; // Salada
    
    console.log('📸 Imagem:', testImageUrl);
    
    const { data, error } = await supabase.functions.invoke('sofia-image-analysis', {
      body: {
        imageUrl: testImageUrl,
        userId: authData.user.id,
        userContext: {
          currentMeal: 'lunch',
          foodItems: []
        }
      }
    });

    if (error) {
      console.error('\n❌ ERRO NA FUNÇÃO:', error);
      console.error('Status:', error.context?.status);
      console.error('Status Text:', error.context?.statusText);
      
      // Tentar obter mais detalhes do erro
      if (error.context?.body) {
        try {
          const errorBody = await error.context.body.text();
          console.error('Detalhes do erro:', errorBody);
        } catch (e) {
          console.error('Não foi possível ler o corpo do erro');
        }
      }
      
      return;
    }

    console.log('\n✅ SUCESSO! Resposta recebida:');
    console.log(JSON.stringify(data, null, 2));

    if (data.sofia_analysis) {
      const analysis = typeof data.sofia_analysis === 'string' 
        ? JSON.parse(data.sofia_analysis) 
        : data.sofia_analysis;
      
      console.log('\n🎉 ANÁLISE DA SOFIA:');
      console.log('💬', analysis.analysis);
      console.log('\n✨ Recomendações:', analysis.recommendations);
      console.log('💪 Motivação:', analysis.motivationalMessage);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    // Fazer logout
    await supabase.auth.signOut();
  }
}

// Executar teste
testarSofiaDetalhado();