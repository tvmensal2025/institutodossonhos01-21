import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testarRankingSemErro() {
  console.log('🧪 Testando ranking sem JOIN problemático...');

  try {
    // Testar consulta do ranking sem profiles
    console.log('1. Testando consulta ranking...');
    const { data: rankingData, error: rankingError } = await supabase
      .from('challenge_participations')
      .select(`
        user_id,
        progress,
        is_completed,
        challenges(points_reward)
      `)
      .eq('is_completed', true)
      .order('progress', { ascending: false })
      .limit(10);

    if (rankingError) {
      console.log('❌ Erro ao carregar ranking:', rankingError.message);
    } else {
      console.log(`✅ Ranking carregado com sucesso: ${rankingData.length} participações`);
      rankingData.forEach((item, index) => {
        console.log(`${index + 1}. User: ${item.user_id.slice(0, 8)} | Progress: ${item.progress} | Points: ${item.challenges?.points_reward || 0}`);
      });
    }

    // Testar consulta de desafios com participações
    console.log('\n2. Testando consulta desafios...');
    const { data: desafiosData, error: desafiosError } = await supabase
      .from('challenges')
      .select(`
        *,
        challenge_participations(
          id,
          progress,
          is_completed,
          started_at
        )
      `)
      .eq('is_active', true)
      .limit(3);

    if (desafiosError) {
      console.log('❌ Erro ao carregar desafios:', desafiosError.message);
    } else {
      console.log(`✅ Desafios carregados com sucesso: ${desafiosData.length} desafios`);
      desafiosData.forEach((desafio, index) => {
        console.log(`${index + 1}. ${desafio.title} | Participações: ${desafio.challenge_participations?.length || 0}`);
      });
    }

    console.log('\n🎉 Teste concluído!');
    console.log('📱 Agora teste no dashboard: http://localhost:8081/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testarRankingSemErro(); 