const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

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

    // 4. Verificar políticas RLS
    console.log('\n📋 4. Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'user_sessions' })
      .catch(() => ({ data: null, error: 'Função não disponível' }));

    if (policiesError) {
      console.log('⚠️  Não foi possível verificar políticas RLS diretamente');
    } else {
      console.log('✅ Políticas RLS encontradas:', policies);
    }

    // 5. Testar inserção de uma sessão de teste
    console.log('\n📋 5. Testando inserção de sessão...');
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

    // 6. Verificar função is_admin_user
    console.log('\n📋 6. Verificando função is_admin_user...');
    const { data: adminTest, error: adminError } = await supabase
      .rpc('is_admin_user')
      .catch(() => ({ data: null, error: 'Função não disponível' }));

    if (adminError) {
      console.log('⚠️  Não foi possível testar função is_admin_user');
    } else {
      console.log('✅ Resultado da função is_admin_user:', adminTest);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar diagnóstico
diagnoseUserSessions().then(() => {
  console.log('\n🏁 Diagnóstico concluído!');
}); 