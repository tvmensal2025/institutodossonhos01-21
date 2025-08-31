// Criar usuário real usando service role key
import { createClient } from '@supabase/supabase-js';

// Cliente com service role key (tem permissões de admin)
const supabaseAdmin = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

// Cliente normal (para testar login)
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function criarUsuarioReal() {
  try {
    console.log('🔧 CRIANDO USUÁRIO REAL');
    console.log('========================\n');
    
    // 1. Criar usuário usando admin
    console.log('1️⃣ Criando usuário com admin...');
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: 'teste@institutodossonhos.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Usuário Teste',
        role: 'user'
      }
    });
    
    if (userError) {
      console.error('❌ Erro ao criar usuário:', userError);
      return;
    }
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email:', userData.user.email);
    console.log('🆔 User ID:', userData.user.id);
    
    // 2. Criar perfil
    console.log('\n2️⃣ Criando perfil...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userData.user.id,
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
    
    // 3. Testar login
    console.log('\n3️⃣ Testando login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'teste@institutodossonhos.com',
      password: '123456'
    });
    
    if (signInError) {
      console.error('❌ Erro no login:', signInError);
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('🔑 Session:', signInData.session ? 'Ativa' : 'Inativa');
      console.log('🆔 User ID:', signInData.user.id);
    }
    
    // 4. Testar participação em desafio
    console.log('\n4️⃣ Testando participação...');
    const { data: challenges } = await supabase
      .from('challenges')
      .select('id, title')
      .limit(1);
    
    if (challenges && challenges.length > 0 && signInData.user) {
      const challengeId = challenges[0].id;
      
      const { data: participation, error: participationError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: signInData.user.id,
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
    
    console.log('\n🎉 USUÁRIO REAL CRIADO COM SUCESSO!');
    console.log('📝 Para testar no navegador:');
    console.log('   URL: http://localhost:5173');
    console.log('   Email: teste@institutodossonhos.com');
    console.log('   Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

criarUsuarioReal(); 