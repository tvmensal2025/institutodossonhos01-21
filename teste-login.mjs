// Teste de login e verificação de usuário
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testeLogin() {
  try {
    console.log('🔐 TESTE DE LOGIN');
    console.log('==================\n');
    
    // 1. Tentar fazer login
    console.log('1️⃣ Fazendo login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'teste@institutodossonhos.com',
      password: '123456'
    });
    
    if (signInError) {
      console.error('❌ Erro no login:', signInError);
      
      // 2. Se falhar, tentar registrar
      console.log('\n2️⃣ Tentando registrar usuário...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'teste@institutodossonhos.com',
        password: '123456',
        options: {
          data: {
            full_name: 'Usuário Teste',
            role: 'user'
          }
        }
      });
      
      if (signUpError) {
        console.error('❌ Erro no registro:', signUpError);
        return;
      }
      
      console.log('✅ Usuário registrado com sucesso!');
      console.log('📧 Email:', signUpData.user?.email);
      console.log('🆔 User ID:', signUpData.user?.id);
      
      // 3. Criar perfil
      if (signUpData.user) {
        console.log('\n3️⃣ Criando perfil...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: signUpData.user.id,
            full_name: 'Usuário Teste',
            email: 'teste@institutodossonhos.com',
            role: 'user',
            points: 0
          })
          .select()
          .single();
        
        if (profileError) {
          console.error('❌ Erro ao criar perfil:', profileError);
        } else {
          console.log('✅ Perfil criado com sucesso!');
        }
      }
      
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('📧 Email:', signInData.user?.email);
      console.log('🆔 User ID:', signInData.user?.id);
      console.log('🔑 Session:', signInData.session ? 'Ativa' : 'Inativa');
    }
    
    // 4. Verificar usuário atual
    console.log('\n4️⃣ Verificando usuário atual...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('✅ Usuário logado:', user.email);
      console.log('🆔 User ID:', user.id);
      
      // 5. Testar participação em desafio
      console.log('\n5️⃣ Testando participação em desafio...');
      const { data: challenges } = await supabase
        .from('challenges')
        .select('id, title')
        .limit(1);
      
      if (challenges && challenges.length > 0) {
        const challengeId = challenges[0].id;
        
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

testeLogin(); 