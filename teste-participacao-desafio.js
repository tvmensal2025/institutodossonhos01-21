const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarParticipacaoDesafio() {
  console.log('🔍 Iniciando teste de participação em desafio...\n');

  try {
    // 1. Verificar se há desafios disponíveis
    console.log('1. Verificando desafios disponíveis...');
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (challengesError) {
      console.error('❌ Erro ao buscar desafios:', challengesError);
      return;
    }

    if (!challenges || challenges.length === 0) {
      console.log('⚠️ Nenhum desafio ativo encontrado');
      return;
    }

    const challenge = challenges[0];
    console.log(`✅ Desafio encontrado: ${challenge.title} (ID: ${challenge.id})\n`);

    // 2. Verificar usuários disponíveis
    console.log('2. Verificando usuários disponíveis...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado');
      return;
    }

    const userId = users[0].user_id;
    console.log(`✅ Usuário encontrado: ${userId}\n`);

    // 3. Verificar se já participa do desafio
    console.log('3. Verificando participação existente...');
    const { data: existingParticipation, error: participationError } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challenge.id)
      .maybeSingle();

    if (participationError) {
      console.error('❌ Erro ao verificar participação:', participationError);
      return;
    }

    if (existingParticipation) {
      console.log('⚠️ Usuário já participa deste desafio');
      console.log('📊 Progresso atual:', existingParticipation.progress);
      return;
    }

    console.log('✅ Usuário não participa ainda\n');

    // 4. Tentar participar usando a função RPC
    console.log('4. Tentando participar do desafio...');
    const { data: joinResult, error: joinError } = await supabase
      .rpc('join_challenge', {
        user_uuid: userId,
        challenge_uuid: challenge.id
      });

    if (joinError) {
      console.error('❌ Erro ao participar do desafio:', joinError);
      
      // Verificar se é problema de permissão
      console.log('\n🔍 Verificando permissões...');
      const { data: policies, error: policiesError } = await supabase
        .from('challenge_participations')
        .select('*')
        .limit(1);

      if (policiesError) {
        console.error('❌ Erro ao verificar políticas RLS:', policiesError);
      } else {
        console.log('✅ Políticas RLS parecem estar funcionando');
      }
      
      return;
    }

    console.log('✅ Participação criada com sucesso!');
    console.log('📊 Resultado:', joinResult);

    // 5. Verificar se a participação foi realmente criada
    console.log('\n5. Verificando participação criada...');
    const { data: newParticipation, error: checkError } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challenge.id)
      .single();

    if (checkError) {
      console.error('❌ Erro ao verificar participação criada:', checkError);
    } else {
      console.log('✅ Participação confirmada no banco de dados');
      console.log('📊 Dados da participação:', newParticipation);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o teste
testarParticipacaoDesafio(); 