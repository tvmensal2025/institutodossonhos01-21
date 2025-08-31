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

async function aplicarCorrecaoSessoes() {
  console.log('🔧 Aplicando correção das sessões...\n');

  try {
    // 1. Verificar estado atual
    console.log('📋 1. Verificando estado atual...');
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, title, type')
      .eq('is_active', true)
      .limit(5);

    if (sessionsError) {
      console.error('❌ Erro ao buscar sessões:', sessionsError);
    } else {
      console.log(`✅ Encontradas ${sessions.length} sessões ativas`);
    }

    // 2. Tentar criar profile diretamente (pode falhar devido ao RLS)
    console.log('\n📋 2. Tentando criar profile...');
    
    const testProfile = {
      user_id: '109a2a65-9e2e-4723-8543-fbbf68bdc085',
      full_name: 'Administrador Principal',
      email: 'teste@institutodossonhos.com',
      avatar_url: null
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .upsert(testProfile, { onConflict: 'user_id' })
      .select()
      .single();

    if (createError) {
      console.log('⚠️  Erro ao criar profile (RLS pode estar bloqueando):', createError.message);
    } else {
      console.log('✅ Profile criado/atualizado:', createdProfile.full_name);
    }

    // 3. Tentar atribuir sessões diretamente
    console.log('\n📋 3. Atribuindo sessões...');
    
    if (sessions.length > 0) {
      const assignments = sessions.map(session => ({
        user_id: '109a2a65-9e2e-4723-8543-fbbf68bdc085',
        session_id: session.id,
        status: 'pending',
        progress: 0,
        assigned_at: new Date().toISOString()
      }));

      console.log(`📝 Criando ${assignments.length} atribuições...`);

      const { data: assignmentData, error: assignmentError } = await supabase
        .from('user_sessions')
        .upsert(assignments, { onConflict: 'user_id,session_id' })
        .select();

      if (assignmentError) {
        console.error('❌ Erro ao criar atribuições:', assignmentError);
      } else {
        console.log(`✅ Criadas/atualizadas ${assignmentData.length} atribuições`);
      }
    }

    // 4. Verificar resultado
    console.log('\n📋 4. Verificando resultado...');
    const { data: userSessions, error: verifyError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        sessions (id, title, description)
      `)
      .eq('user_id', '109a2a65-9e2e-4723-8543-fbbf68bdc085');

    if (verifyError) {
      console.error('❌ Erro ao verificar sessões do usuário:', verifyError);
    } else {
      console.log(`✅ Sessões para o usuário: ${userSessions.length}`);
      userSessions.forEach(session => {
        console.log(`   - ${session.sessions.title} (Status: ${session.status})`);
      });
    }

    // 5. Testar acesso como usuário autenticado
    console.log('\n📋 5. Testando acesso autenticado...');
    
    // Fazer login com o usuário
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'teste@institutodossonhos.com',
      password: 'teste123456'
    });

    if (loginError) {
      console.log('⚠️  Não foi possível fazer login, mas vamos testar o acesso direto');
      
      // Testar acesso direto mesmo sem login
      const { data: directAccess, error: directError } = await supabase
        .from('user_sessions')
        .select('count')
        .eq('user_id', '109a2a65-9e2e-4723-8543-fbbf68bdc085');

      if (directError) {
        console.error('❌ Erro de acesso direto:', directError);
      } else {
        console.log('✅ Acesso direto funcionando');
      }
    } else {
      console.log('✅ Login bem-sucedido:', loginData.user?.email);
      
      // Verificar sessões como usuário logado
      const { data: userSessionsLogged, error: loggedError } = await supabase
        .from('user_sessions')
        .select(`
          *,
          sessions (id, title, description)
        `)
        .eq('user_id', '109a2a65-9e2e-4723-8543-fbbf68bdc085');

      if (loggedError) {
        console.error('❌ Erro ao verificar sessões logado:', loggedError);
      } else {
        console.log(`✅ Sessões visíveis para usuário logado: ${userSessionsLogged.length}`);
        userSessionsLogged.forEach(session => {
          console.log(`   - ${session.sessions.title} (Status: ${session.status})`);
        });
      }
    }

    console.log('\n📋 Resumo da correção:');
    console.log(`   - Sessões ativas: ${sessions.length}`);
    console.log(`   - Sessões atribuídas: ${userSessions.length}`);
    console.log(`   - User ID: 109a2a65-9e2e-4723-8543-fbbf68bdc085`);

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar correção
aplicarCorrecaoSessoes().then(() => {
  console.log('\n🏁 Correção aplicada!');
}); 