// Teste do banco de dados
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testarBanco() {
  try {
    console.log('🔍 Testando conexão com o banco...');
    
    // Testar busca de desafios
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .limit(5);
    
    if (challengesError) {
      console.error('❌ Erro ao buscar desafios:', challengesError);
      return;
    }
    
    console.log('✅ Desafios encontrados:', challenges.length);
    challenges.forEach(challenge => {
      console.log(`  - ${challenge.title} (${challenge.is_group_challenge ? 'Público' : 'Individual'})`);
    });
    
    // Testar inserção de participação
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const testChallengeId = challenges[0]?.id;
    
    if (testChallengeId) {
      console.log('\n🧪 Testando inserção de participação...');
      
      const { data: participation, error: participationError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: testUserId,
          challenge_id: testChallengeId,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select();
      
      if (participationError) {
        console.error('❌ Erro ao inserir participação:', participationError);
      } else {
        console.log('✅ Participação inserida com sucesso!');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarBanco(); 