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

async function fixUserSessions() {
  console.log('🔧 Iniciando correção das sessões do usuário...\n');

  try {
    // 1. Verificar usuários na tabela auth.users
    console.log('📋 1. Verificando usuários na tabela auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erro ao buscar usuários auth:', authError);
    } else {
      console.log(`✅ Encontrados ${authUsers.users.length} usuários na auth.users:`);
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (${user.id}) - Criado: ${user.created_at}`);
      });
    }

    // 2. Verificar se há profiles para esses usuários
    console.log('\n📋 2. Verificando profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .limit(10);

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
    } else {
      console.log(`✅ Encontrados ${profiles.length} profiles:`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.full_name} (${profile.email}) - ID: ${profile.user_id}`);
      });
    }

    // 3. Se não há profiles, criar profiles para os usuários auth
    if (profiles.length === 0 && authUsers.users.length > 0) {
      console.log('\n📋 3. Criando profiles para usuários auth...');
      
      const profilesToCreate = authUsers.users.map(user => ({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      const { data: createdProfiles, error: createError } = await supabase
        .from('profiles')
        .insert(profilesToCreate)
        .select();

      if (createError) {
        console.error('❌ Erro ao criar profiles:', createError);
      } else {
        console.log(`✅ Criados ${createdProfiles.length} profiles`);
        profiles.push(...createdProfiles);
      }
    }

    // 4. Verificar sessões disponíveis
    console.log('\n📋 4. Verificando sessões disponíveis...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, title, type, is_active')
      .eq('is_active', true)
      .limit(10);

    if (sessionsError) {
      console.error('❌ Erro ao buscar sessões:', sessionsError);
    } else {
      console.log(`✅ Encontradas ${sessions.length} sessões ativas:`);
      sessions.forEach(session => {
        console.log(`   - ${session.title} (${session.type})`);
      });
    }

    // 5. Atribuir sessões aos usuários
    if (profiles.length > 0 && sessions.length > 0) {
      console.log('\n📋 5. Atribuindo sessões aos usuários...');
      
      const assignments = [];
      
      // Para cada usuário, atribuir todas as sessões ativas
      for (const profile of profiles) {
        for (const session of sessions) {
          assignments.push({
            user_id: profile.user_id,
            session_id: session.id,
            status: 'pending',
            progress: 0,
            assigned_at: new Date().toISOString()
          });
        }
      }

      console.log(`📝 Criando ${assignments.length} atribuições...`);

      const { data: createdAssignments, error: assignError } = await supabase
        .from('user_sessions')
        .insert(assignments)
        .select();

      if (assignError) {
        console.error('❌ Erro ao criar atribuições:', assignError);
      } else {
        console.log(`✅ Criadas ${createdAssignments.length} atribuições de sessões`);
        
        // Verificar se as atribuições foram criadas corretamente
        const { data: verifyAssignments, error: verifyError } = await supabase
          .from('user_sessions')
          .select(`
            *,
            sessions (id, title),
            profiles (full_name, email)
          `)
          .limit(5);

        if (verifyError) {
          console.error('❌ Erro ao verificar atribuições:', verifyError);
        } else {
          console.log('\n📋 6. Verificando atribuições criadas:');
          verifyAssignments.forEach(assignment => {
            console.log(`   - ${assignment.profiles.full_name}: ${assignment.sessions.title} (${assignment.status})`);
          });
        }
      }
    } else {
      console.log('⚠️  Não há usuários ou sessões para atribuir');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar correção
fixUserSessions().then(() => {
  console.log('\n🏁 Correção concluída!');
}); 