import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testarDesafiosDashboard() {
  console.log('🧪 Testando carregamento de desafios no dashboard...');

  try {
    // 1. Verificar desafios individuais
    console.log('\n📊 Testando desafios individuais...');
    const { data: desafiosIndividuais, error: errorIndividuais } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .eq('is_group_challenge', false);

    if (errorIndividuais) {
      console.log('❌ Erro ao buscar desafios individuais:', errorIndividuais.message);
    } else {
      console.log(`✅ Encontrados ${desafiosIndividuais.length} desafios individuais:`);
      desafiosIndividuais.forEach((desafio, index) => {
        console.log(`${index + 1}. ${desafio.badge_icon || '🏆'} ${desafio.title}`);
      });
    }

    // 2. Verificar desafios públicos
    console.log('\n👥 Testando desafios públicos...');
    const { data: desafiosPublicos, error: errorPublicos } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .eq('is_group_challenge', true);

    if (errorPublicos) {
      console.log('❌ Erro ao buscar desafios públicos:', errorPublicos.message);
    } else {
      console.log(`✅ Encontrados ${desafiosPublicos.length} desafios públicos:`);
      desafiosPublicos.forEach((desafio, index) => {
        console.log(`${index + 1}. ${desafio.badge_icon || '🏆'} ${desafio.title}`);
      });
    }

    // 3. Verificar participações
    console.log('\n🎯 Testando participações...');
    const { data: participacoes, error: errorParticipacoes } = await supabase
      .from('challenge_participations')
      .select('*')
      .limit(5);

    if (errorParticipacoes) {
      console.log('❌ Erro ao buscar participações:', errorParticipacoes.message);
    } else {
      console.log(`✅ Encontradas ${participacoes.length} participações`);
    }

    // 4. Testar consulta com join (como no DesafiosSection)
    console.log('\n🔗 Testando consulta com join...');
    const { data: desafiosComParticipacao, error: errorJoin } = await supabase
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

    if (errorJoin) {
      console.log('❌ Erro na consulta com join:', errorJoin.message);
    } else {
      console.log(`✅ Consulta com join funcionando: ${desafiosComParticipacao.length} desafios`);
      desafiosComParticipacao.forEach((desafio, index) => {
        console.log(`${index + 1}. ${desafio.title} - Participações: ${desafio.challenge_participations?.length || 0}`);
      });
    }

    console.log('\n🎉 Teste concluído!');
    console.log('📱 Agora teste no dashboard: http://localhost:8081/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testarDesafiosDashboard(); 