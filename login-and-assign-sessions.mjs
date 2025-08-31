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

async function loginAndAssignSessions() {
  console.log('🔧 Fazendo login e atribuindo sessões...\n');

  try {
    // 1. Fazer login com usuário existente
    console.log('📋 1. Fazendo login...');
    const testEmail = 'teste@institutodossonhos.com';
    const testPassword = 'teste123456';
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError);
      return;
    }

    console.log('✅ Login bem-sucedido:', loginData.user?.email);
    const userId = loginData.user?.id;

    // 2. Verificar se já existe profile
    console.log('\n📋 2. Verificando profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.log('⚠️  Profile não encontrado, criando...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: 'Usuário Teste',
          email: testEmail,
          avatar_url: null
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar profile:', createError);
      } else {
        console.log('✅ Profile criado:', newProfile.full_name);
      }
    } else {
      console.log('✅ Profile encontrado:', profileData.full_name);
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

    // 4. Verificar se já existem atribuições para este usuário
    console.log('\n📋 4. Verificando atribuições existentes...');
    const { data: existingAssignments, error: existingError } = await supabase
      .from('user_sessions')
      .select('session_id, status')
      .eq('user_id', userId);

    if (existingError) {
      console.error('❌ Erro ao verificar atribuições existentes:', existingError);
    } else {
      console.log(`✅ Encontradas ${existingAssignments.length} atribuições existentes`);
    }

    // 5. Atribuir sessões que ainda não foram atribuídas
    console.log('\n📋 5. Atribuindo novas sessões...');
    const existingSessionIds = existingAssignments.map(a => a.session_id);
    const newSessions = sessions.filter(session => !existingSessionIds.includes(session.id));

    if (newSessions.length === 0) {
      console.log('✅ Todas as sessões já foram atribuídas');
    } else {
      console.log(`📝 Atribuindo ${newSessions.length} novas sessões...`);
      
      const assignments = newSessions.map(session => ({
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
        console.log(`✅ Atribuídas ${assignmentData.length} novas sessões`);
      }
    }

    // 6. Verificar todas as sessões do usuário
    console.log('\n📋 6. Verificando todas as sessões do usuário...');
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
      console.log(`✅ Total de sessões para o usuário: ${userSessions.length}`);
      userSessions.forEach(session => {
        console.log(`   - ${session.sessions.title} (Status: ${session.status})`);
      });
    }

    // 7. Testar acesso como usuário logado
    console.log('\n📋 7. Testando acesso como usuário logado...');
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
      userSessionsLogged.forEach(session => {
        console.log(`   - ${session.sessions.title} (Status: ${session.status})`);
      });
    }

    console.log('\n📋 Informações do usuário:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Total de sessões atribuídas: ${userSessions.length}`);

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar processo
loginAndAssignSessions().then(() => {
  console.log('\n🏁 Processo concluído!');
}); 