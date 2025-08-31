import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteSystem() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA DE SESSÕES\n');
  
  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('sessions')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Erro na conexão:', testError.message);
      return;
    }
    console.log('✅ Conexão estabelecida\n');

    // 2. Limpar dados existentes
    console.log('2️⃣ Limpando dados existentes...');
    await supabase.from('user_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Dados limpos\n');

    // 3. Testar criação de sessão (simulando dados do formulário)
    console.log('3️⃣ Testando criação de sessão...');
    const formData = {
      title: 'Sessão de Teste Completo',
      description: 'Descrição da sessão de teste',
      type: 'coaching',
      difficulty: 'intermediate',
      estimated_time: 45,
      content: {
        sections: [
          {
            title: 'Introdução',
            activities: ['Reflexão inicial', 'Definição de objetivos'],
            description: 'Preparação para a sessão'
          },
          {
            title: 'Desenvolvimento',
            activities: ['Exercícios práticos', 'Análise de casos'],
            description: 'Parte principal da sessão'
          }
        ]
      }
    };

    const sessionData = {
      ...formData,
      target_saboteurs: ['perfeccionista', 'controlador'],
      materials_needed: ['Papel', 'Caneta'],
      follow_up_questions: ['Como você se sentiu?', 'O que aprendeu?'],
      created_by: '00000000-0000-0000-0000-000000000000'
    };

    console.log('📝 Dados do formulário:', JSON.stringify(formData, null, 2));
    console.log('💾 Dados para inserção:', JSON.stringify(sessionData, null, 2));

    const { data: createdSession, error: createError } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();

    if (createError) {
      console.log('❌ Erro ao criar sessão:', createError);
      console.log('Detalhes:', {
        message: createError.message,
        details: createError.details,
        hint: createError.hint,
        code: createError.code
      });
      return;
    }
    console.log('✅ Sessão criada com ID:', createdSession.id);
    console.log('📊 Dados da sessão criada:', JSON.stringify(createdSession, null, 2));

    // 4. Testar busca de sessões
    console.log('\n4️⃣ Testando busca de sessões...');
    const { data: sessions, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('❌ Erro ao buscar sessões:', fetchError.message);
      return;
    }
    console.log('✅ Sessões encontradas:', sessions.length);
    console.log('📋 Lista de sessões:', sessions.map(s => ({ id: s.id, title: s.title, type: s.type })));

    // 5. Testar criação de user_session
    console.log('\n5️⃣ Testando criação de user_session...');
    const testUserSession = {
      session_id: createdSession.id,
      user_id: '00000000-0000-0000-0000-000000000000',
      status: 'assigned',
      progress: 0,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: createdUserSession, error: userSessionError } = await supabase
      .from('user_sessions')
      .insert([testUserSession])
      .select()
      .single();

    if (userSessionError) {
      console.log('❌ Erro ao criar user_session:', userSessionError.message);
      return;
    }
    console.log('✅ User session criada com ID:', createdUserSession.id);

    // 6. Testar busca de user_sessions
    console.log('\n6️⃣ Testando busca de user_sessions...');
    const { data: userSessions, error: userSessionsError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        session:sessions(*)
      `)
      .eq('user_id', '00000000-0000-0000-0000-000000000000');

    if (userSessionsError) {
      console.log('❌ Erro ao buscar user_sessions:', userSessionsError.message);
      return;
    }
    console.log('✅ User sessions encontradas:', userSessions.length);

    // 7. Testar atualização de sessão
    console.log('\n7️⃣ Testando atualização de sessão...');
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({ 
        title: 'Sessão Atualizada',
        estimated_time: 60 
      })
      .eq('id', createdSession.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Erro ao atualizar sessão:', updateError.message);
      return;
    }
    console.log('✅ Sessão atualizada:', updatedSession.title);

    // 8. Testar atualização de user_session
    console.log('\n8️⃣ Testando atualização de user_session...');
    const { data: updatedUserSession, error: updateUserError } = await supabase
      .from('user_sessions')
      .update({ 
        status: 'in_progress',
        progress: 50 
      })
      .eq('id', createdUserSession.id)
      .select()
      .single();

    if (updateUserError) {
      console.log('❌ Erro ao atualizar user_session:', updateUserError.message);
      return;
    }
    console.log('✅ User session atualizada:', updatedUserSession.status);

    // 9. Limpeza final
    console.log('\n9️⃣ Limpando dados de teste...');
    await supabase.from('user_sessions').delete().eq('id', createdUserSession.id);
    await supabase.from('sessions').delete().eq('id', createdSession.id);
    console.log('✅ Dados de teste removidos');

    console.log('\n🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL!');
    console.log('\n📊 RESUMO:');
    console.log('✅ Conexão com Supabase');
    console.log('✅ Criação de sessões');
    console.log('✅ Busca de sessões');
    console.log('✅ Criação de user_sessions');
    console.log('✅ Busca de user_sessions');
    console.log('✅ Atualização de sessões');
    console.log('✅ Atualização de user_sessions');
    console.log('✅ Limpeza de dados');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testCompleteSystem(); 