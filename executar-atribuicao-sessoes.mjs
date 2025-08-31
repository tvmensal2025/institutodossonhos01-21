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

async function executarAtribuicaoSessoes() {
  console.log('🔧 Executando atribuição de sessões...\n');

  try {
    // 1. Verificar profiles existentes
    console.log('📋 1. Verificando profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .limit(5);

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
    } else {
      console.log(`✅ Encontrados ${profiles.length} profiles`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.full_name} (${profile.email})`);
      });
    }

    // 2. Se não há profiles, criar um profile de teste
    if (profiles.length === 0) {
      console.log('\n📋 2. Criando profile de teste...');
      
      const testProfile = {
        user_id: '109a2a65-9e2e-4723-8543-fbbf68bdc085', // ID do usuário que aparece no console
        full_name: 'Administrador Principal',
        email: 'teste@institutodossonhos.com',
        avatar_url: null
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(testProfile)
        .select()
        .single();

      if (createError) {
        console.log('⚠️  Profile já existe ou erro:', createError.message);
      } else {
        console.log('✅ Profile criado:', createdProfile.full_name);
        profiles.push(createdProfile);
      }
    }

    // 3. Verificar sessões ativas
    console.log('\n📋 3. Verificando sessões ativas...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, title, type')
      .eq('is_active', true)
      .limit(10);

    if (sessionsError) {
      console.error('❌ Erro ao buscar sessões:', sessionsError);
    } else {
      console.log(`✅ Encontradas ${sessions.length} sessões ativas`);
      sessions.forEach(session => {
        console.log(`   - ${session.title} (${session.type})`);
      });
    }

    // 4. Atribuir sessões aos usuários
    console.log('\n📋 4. Atribuindo sessões...');
    
    if (profiles.length > 0 && sessions.length > 0) {
      const assignments = [];
      
      // Para cada profile, atribuir todas as sessões ativas
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

      const { data: assignmentData, error: assignmentError } = await supabase
        .from('user_sessions')
        .insert(assignments)
        .select();

      if (assignmentError) {
        console.error('❌ Erro ao criar atribuições:', assignmentError);
      } else {
        console.log(`✅ Criadas ${assignmentData.length} atribuições`);
      }
    }

    // 5. Verificar resultado
    console.log('\n📋 5. Verificando resultado...');
    const { data: userSessions, error: verifyError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        sessions (id, title),
        profiles (full_name, email)
      `)
      .limit(10);

    if (verifyError) {
      console.error('❌ Erro ao verificar atribuições:', verifyError);
    } else {
      console.log(`✅ Total de atribuições: ${userSessions.length}`);
      userSessions.forEach(assignment => {
        console.log(`   - ${assignment.profiles.full_name}: ${assignment.sessions.title} (${assignment.status})`);
      });
    }

    // 6. Testar com usuário específico
    console.log('\n📋 6. Testando com usuário específico...');
    const testUserId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';
    
    const { data: userSessionsTest, error: testError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        sessions (id, title, description)
      `)
      .eq('user_id', testUserId);

    if (testError) {
      console.error('❌ Erro ao verificar sessões do usuário:', testError);
    } else {
      console.log(`✅ Sessões para usuário ${testUserId}: ${userSessionsTest.length}`);
      userSessionsTest.forEach(session => {
        console.log(`   - ${session.sessions.title} (Status: ${session.status})`);
      });
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar processo
executarAtribuicaoSessoes().then(() => {
  console.log('\n🏁 Processo concluído!');
}); 