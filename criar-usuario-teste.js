import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function criarUsuarioTeste() {
  console.log('👤 Criando usuário de teste...');
  
  try {
    // 1. Criar usuário
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'teste-desafio@teste.com',
      password: '123456',
      options: {
        data: {
          full_name: 'Usuário Teste Desafio',
          role: 'user'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Erro ao criar usuário:', signUpError);
      return;
    }
    
    console.log('✅ Usuário criado:', user.email);
    console.log('🆔 User ID:', user.id);
    
    // 2. Fazer login
    console.log('🔐 Fazendo login...');
    const { data: { user: loggedUser }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'teste-desafio@teste.com',
      password: '123456'
    });
    
    if (signInError) {
      console.error('❌ Erro no login:', signInError);
      return;
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('📧 Email:', loggedUser.email);
    console.log('🆔 ID:', loggedUser.id);
    
    // 3. Criar perfil
    console.log('👤 Criando perfil...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: loggedUser.id,
        full_name: 'Usuário Teste Desafio',
        email: loggedUser.email,
        points: 0,
        role: 'user'
      });
    
    if (profileError) {
      console.log('⚠️ Erro ao criar perfil:', profileError.message);
    } else {
      console.log('✅ Perfil criado com sucesso!');
    }
    
    console.log('\n🎉 Usuário de teste criado com sucesso!');
    console.log('📧 Email: teste-desafio@teste.com');
    console.log('🔑 Senha: 123456');
    console.log('🆔 User ID:', loggedUser.id);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

criarUsuarioTeste(); 