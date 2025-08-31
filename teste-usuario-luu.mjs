// Teste do usuário luu@gmail.com
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testeUsuarioLuu() {
  try {
    console.log('🧪 TESTE DO USUÁRIO LUU');
    console.log('========================\n');
    
    // 1. Verificar se o usuário existe no banco
    console.log('1️⃣ Verificando usuário no banco...');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'luu@gmail.com');
    
    if (profiles && profiles.length > 0) {
      console.log('✅ Usuário encontrado:', profiles[0].full_name);
      console.log('🆔 User ID:', profiles[0].user_id);
    } else {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    // 2. Testar participação em desafio
    console.log('\n2️⃣ Testando participação...');
    const { data: challenges } = await supabase
      .from('challenges')
      .select('id, title')
      .limit(1);
    
    if (challenges && challenges.length > 0) {
      const challengeId = challenges[0].id;
      const userId = '3e01afcf-03c4-43ce-bd4e-b9748ed0caf5';
      
      // Remover participação existente para evitar conflito
      await supabase
        .from('challenge_participations')
        .delete()
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);
      
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
    
    // 3. Verificar participações
    console.log('\n3️⃣ Verificando participações...');
    const { data: participations } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', '3e01afcf-03c4-43ce-bd4e-b9748ed0caf5');
    
    console.log('✅ Participações encontradas:', participations?.length || 0);
    
    // 4. Resumo final
    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('📝 Para testar no navegador:');
    console.log('   URL: http://localhost:8080');
    console.log('   Email: luu@gmail.com');
    console.log('   Senha: 123456');
    console.log('\n💡 Agora o botão "Participar do Desafio" deve funcionar!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testeUsuarioLuu(); 