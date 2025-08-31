import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Carregar variáveis de ambiente do env.example
function loadEnvFromExample() {
  try {
    const envContent = readFileSync('env.example', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Erro ao carregar env.example:', error.message);
    return {};
  }
}

const envVars = loadEnvFromExample();

// Configuração do Supabase
const supabaseUrl = envVars.VITE_SUPABASE_URL_MAIN || process.env.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY_MAIN || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUserAndSessions() {
  console.log('🔧 Criando usuário de teste e atribuindo sessões...\n');

  try {
    // 1. Criar um usuário de teste
    console.log('📋 1. Criando usuário de teste...');
    const testEmail = 'teste@institutodossonhos.com';
    const testPassword = 'teste123456';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Usuário Teste',
          avatar_url: null
        }
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError);
      return;
    }

    console.log('✅ Usuário criado:', authData.user?.email);
    const userId = authData.user?.id;

    // 2. Criar profile para o usuário
    console.log('\n📋 2. Criando profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: 'Usuário Teste',
        email: testEmail,
        avatar_url: null
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Erro ao criar profile:', profileError);
    } else {
      console.log('✅ Profile criado:', profileData.full_name);
    }

    // 3. Verificar sessões disponíveis
    console.log('\n📋 3. Verificando sessões disponíveis...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, title, type, is_active')
      .eq('is_active', true)
      .limit(5);

    if (sessionsError) {
      console.error('❌ Erro ao buscar sessões:', sessionsError);
      return;
    }

    console.log(`✅ Encontradas ${sessions.length} sessões ativas:`);
    sessions.forEach(session => {
      console.log(`   - ${session.title} (${session.type})`);
    });

    // 4. Atribuir sessões ao usuário
    console.log('\n📋 4. Atribuindo sessões ao usuário...');
    const assignments = sessions.map(session => ({
      user_id: userId,
      session_id: session.id,
      status: 'pending',
      progress: 0,
      assigned_at: new Date().toISOString()
    }));

    const { data: assignmentData, error: assignmentError } = await supabase
      .from('user_sessions')
      .insert(assignments)
      .select();

    if (assignmentError) {
      console.error('❌ Erro ao atribuir sessões:', assignmentError);
    } else {
      console.log(`✅ Atribuídas ${assignmentData.length} sessões ao usuário`);
    }

    // 5. Verificar se as atribuições foram criadas
    console.log('\n📋 5. Verificando atribuições...');
    const { data: userSessions, error: verifyError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        sessions (id, title, description)
      `)
      .eq('user_id', userId);

    if (verifyError) {
      console.error('❌ Erro ao verificar sessões do usuário:', verifyError);
    } else {
      console.log(`✅ Sessões encontradas para o usuário: ${userSessions.length}`);
      userSessions.forEach(session => {
        console.log(`   - ${session.sessions.title} (Status: ${session.status})`);
      });
    }

    // 6. Fazer login com o usuário para testar
    console.log('\n📋 6. Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError);
    } else {
      console.log('✅ Login bem-sucedido:', loginData.user?.email);
      
      // Verificar sessões como usuário logado
      const { data: userSessionsLogged, error: loggedError } = await supabase
        .from('user_sessions')
        .select(`
          *,
          sessions (id, title, description)
        `)
        .eq('user_id', userId);

      if (loggedError) {
        console.error('❌ Erro ao verificar sessões logado:', loggedError);
      } else {
        console.log(`✅ Sessões visíveis para usuário logado: ${userSessionsLogged.length}`);
      }
    }

    console.log('\n📋 Informações do usuário de teste:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Senha: ${testPassword}`);
    console.log(`   User ID: ${userId}`);

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar criação
createTestUserAndSessions().then(() => {
  console.log('\n🏁 Processo concluído!');
}); 