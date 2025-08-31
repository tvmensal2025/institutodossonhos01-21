import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase para web
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

// Cliente Supabase para web (sem localStorage)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarConexaoWeb() {
  console.log('🌐 Testando conexão via web...');
  console.log('URL:', supabaseUrl);

  try {
    // 1. Testar conexão básica
    console.log('\n1. Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('challenges')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Erro na conexão básica:', testError.message);
      return;
    } else {
      console.log('✅ Conexão básica funcionando!');
    }

    // 2. Testar consulta de desafios
    console.log('\n2. Testando consulta de desafios...');
    const { data: desafiosData, error: desafiosError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .limit(5);

    if (desafiosError) {
      console.log('❌ Erro ao consultar desafios:', desafiosError.message);
    } else {
      console.log(`✅ Consulta de desafios funcionando: ${desafiosData.length} desafios`);
      desafiosData.forEach((desafio, index) => {
        console.log(`${index + 1}. ${desafio.badge_icon || '🏆'} ${desafio.title}`);
      });
    }

    // 3. Testar consulta com participações
    console.log('\n3. Testando consulta com participações...');
    const { data: desafiosComParticipacao, error: participacaoError } = await supabase
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

    if (participacaoError) {
      console.log('❌ Erro ao consultar participações:', participacaoError.message);
    } else {
      console.log(`✅ Consulta com participações funcionando: ${desafiosComParticipacao.length} desafios`);
      desafiosComParticipacao.forEach((desafio, index) => {
        console.log(`${index + 1}. ${desafio.title} - Participações: ${desafio.challenge_participations?.length || 0}`);
      });
    }

    // 4. Testar ranking simplificado
    console.log('\n4. Testando ranking simplificado...');
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
      .limit(5);

    if (rankingError) {
      console.log('❌ Erro ao consultar ranking:', rankingError.message);
    } else {
      console.log(`✅ Ranking funcionando: ${rankingData.length} participações`);
      rankingData.forEach((item, index) => {
        console.log(`${index + 1}. User: ${item.user_id.slice(0, 8)} | Progress: ${item.progress} | Points: ${item.challenges?.points_reward || 0}`);
      });
    }

    console.log('\n🎉 Teste de conexão web concluído com sucesso!');
    console.log('📱 Agora teste no dashboard: http://localhost:8081/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testarConexaoWeb(); 