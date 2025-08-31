// Teste de login com usuário real
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testeLoginReal() {
  try {
    console.log('🔐 TESTE DE LOGIN REAL');
    console.log('======================\n');
    
    // 1. Tentar fazer login
    console.log('1️⃣ Fazendo login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'teste@institutodossonhos.com',
      password: '123456'
    });
    
    if (signInError) {
      console.error('❌ Erro no login:', signInError);
      return;
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('📧 Email:', signInData.user?.email);
    console.log('🆔 User ID:', signInData.user?.id);
    console.log('🔑 Session:', signInData.session ? 'Ativa' : 'Inativa');
    
    // 2. Verificar usuário atual
    console.log('\n2️⃣ Verificando usuário atual...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('✅ Usuário logado:', user.email);
      console.log('🆔 User ID:', user.id);
      
      // 3. Testar participação em desafio
      console.log('\n3️⃣ Testando participação...');
      const { data: challenges } = await supabase
        .from('challenges')
        .select('id, title')
        .limit(1);
      
      if (challenges && challenges.length > 0) {
        const challengeId = challenges[0].id;
        
        // Remover participação existente para evitar conflito
        await supabase
          .from('challenge_participations')
          .delete()
          .eq('user_id', user.id)
          .eq('challenge_id', challengeId);
        
        const { data: participation, error: participationError } = await supabase
          .from('challenge_participations')
          .insert({
            user_id: user.id,
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
    } else {
      console.log('❌ Nenhum usuário logado');
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('📝 Para testar no navegador:');
    console.log('   URL: http://localhost:5173');
    console.log('   Email: teste@institutodossonhos.com');
    console.log('   Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testeLoginReal(); 