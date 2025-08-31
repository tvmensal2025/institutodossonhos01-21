// Script para criar usuário real no sistema de autenticação
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function criarUsuarioReal() {
  try {
    console.log('🔧 Criando usuário real no sistema de autenticação...');
    
    // 1. Registrar usuário via auth.signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'teste@institutodossonhos.com',
      password: '123456',
      options: {
        data: {
          full_name: 'Usuário Teste',
          role: 'user'
        }
      }
    });
    
    if (authError) {
      console.error('❌ Erro ao registrar usuário:', authError);
      return;
    }
    
    console.log('✅ Usuário registrado com sucesso!');
    console.log('📧 Email:', authData.user?.email);
    console.log('🆔 User ID:', authData.user?.id);
    
    // 2. Fazer login para obter a sessão
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'teste@institutodossonhos.com',
      password: '123456'
    });
    
    if (signInError) {
      console.error('❌ Erro ao fazer login:', signInError);
      return;
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('🔑 Session:', signInData.session ? 'Ativa' : 'Inativa');
    
    // 3. Verificar se o perfil foi criado automaticamente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', signInData.user?.id)
      .single();
    
    if (profileError) {
      console.log('⚠️ Perfil não encontrado, criando...');
      
      // Criar perfil manualmente
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          user_id: signInData.user?.id,
          full_name: 'Usuário Teste',
          email: 'teste@institutodossonhos.com',
          role: 'user',
          points: 0
        })
        .select()
        .single();
      
      if (createProfileError) {
        console.error('❌ Erro ao criar perfil:', createProfileError);
        return;
      }
      
      console.log('✅ Perfil criado com sucesso!');
    } else {
      console.log('✅ Perfil já existe!');
    }
    
    // 4. Testar participação em desafio
    console.log('\n🧪 Testando participação em desafio...');
    
    const { data: challenges } = await supabase
      .from('challenges')
      .select('id, title')
      .limit(1);
    
    if (challenges && challenges.length > 0) {
      const challengeId = challenges[0].id;
      
      const { data: participation, error: participationError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: signInData.user?.id,
          challenge_id: challengeId,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select();
      
      if (participationError) {
        console.error('❌ Erro ao participar do desafio:', participationError);
      } else {
        console.log('✅ Participação em desafio criada com sucesso!');
      }
    }
    
    console.log('\n🎉 Usuário criado e testado com sucesso!');
    console.log('📝 Credenciais para login:');
    console.log('   Email: teste@institutodossonhos.com');
    console.log('   Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

criarUsuarioReal(); 