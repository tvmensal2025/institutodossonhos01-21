import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarGoalUpdatesAutenticado() {
  console.log('🧪 Testando goal_updates com autenticação...');
  
  try {
    // 1. Tentar fazer login com um usuário existente
    console.log('1. Tentando fazer login...');
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teste@teste.com',
      password: '123456'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError);
      console.log('🔧 Tentando com outro usuário...');
      
      // Tentar com outro usuário
      const { data: { user: user2 }, error: authError2 } = await supabase.auth.signInWithPassword({
        email: 'rafael@teste.com',
        password: '123456'
      });

      if (authError2) {
        console.error('❌ Erro no login com segundo usuário:', authError2);
        console.log('📋 Para testar, você precisa fazer login no dashboard primeiro');
        return;
      }
    }

    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', user?.email);

    // 2. Buscar uma meta existente
    console.log('2. Buscando metas existentes...');
    const { data: goals, error: goalsError } = await supabase
      .from('user_goals')
      .select('*')
      .limit(1);

    if (goalsError) {
      console.error('❌ Erro ao buscar metas:', goalsError);
      return;
    }

    if (!goals || goals.length === 0) {
      console.log('⚠️ Nenhuma meta encontrada');
      console.log('📋 Crie uma meta primeiro no dashboard');
      return;
    }

    const goal = goals[0];
    console.log('✅ Meta encontrada:', goal.title);

    // 3. Testar inserção na goal_updates
    console.log('3. Testando inserção na goal_updates...');
    const { data: insertData, error: insertError } = await supabase
      .from('goal_updates')
      .insert({
        goal_id: goal.id,
        user_id: user?.id,
        previous_value: goal.current_value || 0,
        new_value: (goal.current_value || 0) + 1,
        notes: 'Teste de inserção via script'
      })
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
    } else {
      console.log('✅ Inserção bem-sucedida!');
      console.log('📝 Dados inseridos:', insertData);
    }

    // 4. Verificar se a inserção foi registrada
    console.log('4. Verificando inserção...');
    const { data: updates, error: updatesError } = await supabase
      .from('goal_updates')
      .select('*')
      .eq('goal_id', goal.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (updatesError) {
      console.error('❌ Erro ao buscar atualizações:', updatesError);
    } else {
      console.log('✅ Atualizações encontradas:', updates.length);
      console.table(updates);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarGoalUpdatesAutenticado(); 