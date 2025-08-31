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
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurado' : '❌ Não configurado');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseUserSessions() {
  console.log('🔍 Iniciando diagnóstico das sessões do usuário...\n');

  try {
    // 1. Verificar se há sessões na tabela sessions
    console.log('📋 1. Verificando sessões disponíveis...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, title, type, is_active')
      .limit(10);

    if (sessionsError) {
      console.error('❌ Erro ao buscar sessões:', sessionsError);
    } else {
      console.log(`✅ Encontradas ${sessions.length} sessões:`);
      sessions.forEach(session => {
        console.log(`   - ${session.title} (${session.type}) - Ativa: ${session.is_active}`);
      });
    }

    // 2. Verificar se há user_sessions na tabela
    console.log('\n📋 2. Verificando user_sessions existentes...');
    const { data: userSessions, error: userSessionsError } = await supabase
      .from('user_sessions')
      .select('id, user_id, session_id, status, created_at')
      .limit(10);

    if (userSessionsError) {
      console.error('❌ Erro ao buscar user_sessions:', userSessionsError);
    } else {
      console.log(`✅ Encontradas ${userSessions.length} atribuições de sessões:`);
      userSessions.forEach(us => {
        console.log(`   - User: ${us.user_id} | Session: ${us.session_id} | Status: ${us.status}`);
      });
    }

    // 3. Verificar usuários na tabela profiles
    console.log('\n📋 3. Verificando usuários...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .limit(5);

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
    } else {
      console.log(`✅ Encontrados ${profiles.length} usuários:`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.full_name} (${profile.email}) - ID: ${profile.user_id}`);
      });
    }

    // 4. Testar inserção de uma sessão de teste
    console.log('\n📋 4. Testando inserção de sessão...');
    if (profiles.length > 0 && sessions.length > 0) {
      const testUser = profiles[0];
      const testSession = sessions[0];
      
      console.log(`🧪 Testando atribuição para usuário: ${testUser.full_name}`);
      console.log(`🧪 Sessão: ${testSession.title}`);

      const { data: insertData, error: insertError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: testUser.user_id,
          session_id: testSession.id,
          status: 'pending',
          progress: 0
        })
        .select();

      if (insertError) {
        console.error('❌ Erro ao inserir sessão de teste:', insertError);
      } else {
        console.log('✅ Inserção de teste bem-sucedida:', insertData);
        
        // Verificar se a sessão aparece para o usuário
        const { data: userSessionsTest, error: testError } = await supabase
          .from('user_sessions')
          .select(`
            *,
            sessions (id, title, description)
          `)
          .eq('user_id', testUser.user_id);

        if (testError) {
          console.error('❌ Erro ao verificar sessões do usuário:', testError);
        } else {
          console.log(`✅ Sessões encontradas para o usuário: ${userSessionsTest.length}`);
          userSessionsTest.forEach(session => {
            console.log(`   - ${session.sessions.title} (Status: ${session.status})`);
          });
        }
      }
    }

    // 5. Verificar se há problemas com RLS
    console.log('\n📋 5. Verificando acesso direto à tabela...');
    const { data: directAccess, error: directError } = await supabase
      .from('user_sessions')
      .select('count')
      .limit(1);

    if (directError) {
      console.error('❌ Erro de acesso direto (possível problema RLS):', directError);
    } else {
      console.log('✅ Acesso direto funcionando');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar diagnóstico
diagnoseUserSessions().then(() => {
  console.log('\n🏁 Diagnóstico concluído!');
}); 