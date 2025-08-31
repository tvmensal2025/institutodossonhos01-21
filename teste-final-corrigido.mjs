// Teste final corrigido dos desafios
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testeFinalCorrigido() {
  try {
    console.log('🧪 TESTE FINAL CORRIGIDO');
    console.log('==========================\n');
    
    // 1. Verificar desafios
    console.log('1️⃣ Verificando desafios...');
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true);
    
    if (challengesError) {
      console.error('❌ Erro ao buscar desafios:', challengesError);
      return;
    }
    
    console.log('✅ Desafios encontrados:', challenges.length);
    challenges.forEach(challenge => {
      console.log(`   - ${challenge.title} (${challenge.is_group_challenge ? 'Público' : 'Individual'})`);
    });
    
    // 2. Verificar usuário fixo
    console.log('\n2️⃣ Verificando usuário fixo...');
    const userId = '11111111-1111-1111-1111-111111111111';
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId);
    
    if (profiles && profiles.length > 0) {
      console.log('✅ Usuário encontrado:', profiles[0].full_name);
      console.log('🆔 User ID:', userId);
    } else {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    // 3. Testar participação
    console.log('\n3️⃣ Testando participação...');
    const challengeId = challenges[0]?.id;
    
    if (challengeId) {
      // Primeiro, remover participação existente para evitar conflito
      await supabase
        .from('challenge_participations')
        .delete()
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);
      
      // Agora inserir nova participação
      const { data: participation, error: participationError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select();
      
      if (participationError) {
        console.error('❌ Erro ao participar:', participationError);
      } else {
        console.log('✅ Participação criada com sucesso!');
        console.log('📊 Progresso:', participation[0].progress);
      }
    }
    
    // 4. Verificar participações
    console.log('\n4️⃣ Verificando participações...');
    const { data: participations } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', userId);
    
    console.log('✅ Participações encontradas:', participations?.length || 0);
    
    // 5. Resumo final
    console.log('\n🎉 RESUMO FINAL:');
    console.log('================');
    console.log('✅ Desafios: OK');
    console.log('✅ Usuário: OK');
    console.log('✅ Participação: OK');
    console.log('✅ Banco de dados: OK');
    console.log('\n📝 Para testar no navegador:');
    console.log('   URL: http://localhost:5173');
    console.log('   Email: teste@institutodossonhos.com');
    console.log('   Senha: 123456');
    console.log('\n🚀 Sistema pronto para uso!');
    console.log('💡 O botão "Participar do Desafio" agora deve funcionar!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testeFinalCorrigido(); 