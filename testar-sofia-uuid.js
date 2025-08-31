import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarSofiaUUID() {
  console.log('🧪 TESTANDO SOFIA COM UUID VÁLIDO...\n');

  try {
    // Gerar UUID válido
    const testUserId = crypto.randomUUID();
    const testImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
    
    console.log('📸 Testando com:');
    console.log('- User ID:', testUserId);
    console.log('- Imagem:', testImageUrl);
    
    const { data, error } = await supabase.functions.invoke('sofia-image-analysis', {
      body: {
        imageUrl: testImageUrl,
        userId: testUserId,
        userContext: {
          currentMeal: 'lunch',
          foodItems: []
        }
      }
    });

    if (error) {
      console.error('\n❌ ERRO:', error);
      
      // Tentar obter mais detalhes
      if (error.context?.body) {
        try {
          const errorBody = await error.context.body.text();
          console.error('Detalhes:', errorBody);
          
          // Verificar se é erro de API key
          if (errorBody.includes('GOOGLE_AI_API_KEY') || errorBody.includes('OPENAI_API_KEY')) {
            console.log('\n⚠️ ERRO DE CONFIGURAÇÃO DE API KEYS!');
            console.log('\nVERIFIQUE NO SUPABASE DASHBOARD:');
            console.log('1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/functions');
            console.log('2. Clique em "sofia-image-analysis"');
            console.log('3. Vá em "Logs" para ver o erro completo');
            console.log('\nOU acesse direto as variáveis de ambiente:');
            console.log('https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/functions');
          }
        } catch (e) {
          console.error('Não foi possível ler o erro');
        }
      }
      return;
    }

    console.log('\n✅ SUCESSO! Resposta:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success === false) {
      console.log('\n⚠️ Nenhum alimento detectado');
      console.log('Mensagem:', data.message);
    } else if (data.sofia_analysis) {
      const analysis = typeof data.sofia_analysis === 'string' 
        ? JSON.parse(data.sofia_analysis) 
        : data.sofia_analysis;
      
      console.log('\n🎉 ANÁLISE DA SOFIA:');
      console.log('\n💬 Análise:');
      console.log(analysis.analysis);
      
      console.log('\n✨ Recomendações:');
      analysis.recommendations?.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
      
      console.log('\n💪 Mensagem motivacional:');
      console.log(analysis.motivationalMessage);
      
      console.log('\n❓ Pergunta de follow-up:');
      console.log(analysis.followUpQuestion);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testarSofiaUUID();