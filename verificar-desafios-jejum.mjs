import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDesafiosJejum() {
  console.log('🔍 VERIFICANDO DESAFIOS DE JEJUM\n');
  console.log('='.repeat(50));

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

  try {
    // 1. BUSCAR TODOS OS DESAFIOS DE JEJUM
    console.log('1. 🔍 BUSCANDO TODOS OS DESAFIOS DE JEJUM');
    console.log('-'.repeat(40));

    const { data: jejumChallenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('category', 'jejum')
      .order('created_at', { ascending: false });

    if (challengesError) {
      console.error('❌ Erro ao buscar desafios de jejum:', challengesError);
      return;
    }

    console.log(`📊 Total de desafios de jejum encontrados: ${jejumChallenges.length}`);

    if (jejumChallenges.length > 0) {
      console.log('\n📋 Desafios de jejum existentes:');
      jejumChallenges.forEach((challenge, index) => {
        console.log(`\n${index + 1}. ${challenge.title}`);
        console.log(`   ID: ${challenge.id}`);
        console.log(`   Ativo: ${challenge.is_active ? '✅' : '❌'}`);
        console.log(`   Em grupo: ${challenge.is_group_challenge ? '✅' : '❌'}`);
        console.log(`   Dificuldade: ${challenge.difficulty}`);
        console.log(`   Pontos: ${challenge.points_reward}`);
        console.log(`   Criado em: ${challenge.created_at}`);
        console.log(`   Descrição: ${challenge.description}`);
      });
    } else {
      console.log('❌ NENHUM DESAFIO DE JEJUM ENCONTRADO!');
    }

    // 2. VERIFICAR PARTICIPAÇÕES
    console.log('\n2. 👤 VERIFICANDO PARTICIPAÇÕES');
    console.log('-'.repeat(40));

    const { data: jejumParticipations, error: participationsError } = await supabase
      .from('challenge_participations')
      .select('*, challenges(*)')
      .eq('user_id', userId)
      .eq('challenges.category', 'jejum');

    if (participationsError) {
      console.error('❌ Erro ao buscar participações:', participationsError);
      return;
    }

    console.log(`📊 Total de participações em jejum: ${jejumParticipations.length}`);

    if (jejumParticipations.length > 0) {
      console.log('\n📋 Participações em jejum:');
      jejumParticipations.forEach((participation, index) => {
        const challengeTitle = participation.challenges?.title || 'Desafio não encontrado';
        console.log(`\n${index + 1}. Participação em: ${challengeTitle}`);
        console.log(`   ID da participação: ${participation.id}`);
        console.log(`   Progresso: ${participation.progress}%`);
        console.log(`   Concluído: ${participation.is_completed ? '✅' : '❌'}`);
        console.log(`   Iniciado em: ${participation.started_at}`);
        console.log(`   ID do desafio: ${participation.challenge_id}`);
        if (participation.challenges) {
          console.log(`   Desafio ativo: ${participation.challenges.is_active ? '✅' : '❌'}`);
        } else {
          console.log(`   ⚠️ Desafio não encontrado (pode ter sido excluído)`);
        }
      });
    } else {
      console.log('❌ NENHUMA PARTICIPAÇÃO EM JEJUM ENCONTRADA!');
    }

    // 3. DECIDIR AÇÃO
    console.log('\n3. 🎯 DECIDINDO AÇÃO');
    console.log('-'.repeat(40));

    const activeJejumChallenges = jejumChallenges.filter(c => c.is_active);
    const userJejumParticipations = jejumParticipations.filter(p => !p.is_completed);

    console.log(`📊 Desafios ativos de jejum: ${activeJejumChallenges.length}`);
    console.log(`📊 Participações ativas em jejum: ${userJejumParticipations.length}`);

    if (activeJejumChallenges.length === 0) {
      console.log('❌ NENHUM DESAFIO ATIVO DE JEJUM!');
      console.log('💡 AÇÃO: Criar novo desafio de jejum');
      
      // Criar novo desafio
      const { data: newChallenge, error: createError } = await supabase
        .from('challenges')
        .insert({
          title: 'Jejum Intermitente 16/8',
          description: 'Faça jejum de 16 horas por dia por uma semana. Jante às 20h e só coma novamente às 12h do dia seguinte.',
          category: 'jejum',
          difficulty: 'medio',
          duration_days: 7,
          points_reward: 150,
          badge_icon: '⏰',
          badge_name: 'Mestre do Jejum',
          instructions: 'Faça jejum de 16 horas por dia. Por exemplo: jante às 20h e só coma novamente às 12h do dia seguinte. Beba muita água durante o jejum.',
          tips: ['Beba muita água durante o jejum', 'Mantenha-se ocupado para não pensar na comida', 'Comece gradualmente', 'Escute seu corpo'],
          is_active: true,
          is_featured: false,
          is_group_challenge: false,
          daily_log_target: 16,
          daily_log_unit: 'horas'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar desafio:', createError);
        return;
      }

      console.log('✅ Novo desafio de jejum criado!');
      console.log(`   Título: ${newChallenge.title}`);
      console.log(`   ID: ${newChallenge.id}`);
      console.log(`   Pontos: ${newChallenge.points_reward}`);

      // Criar participação
      const { data: newParticipation, error: participationError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: newChallenge.id,
          target_value: newChallenge.daily_log_target,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (participationError) {
        console.error('❌ Erro ao criar participação:', participationError);
        return;
      }

      console.log('✅ Participação criada!');
      console.log(`   ID da participação: ${newParticipation.id}`);
      console.log(`   Progresso: ${newParticipation.progress}%`);

    } else if (userJejumParticipations.length === 0) {
      console.log('❌ USUÁRIO NÃO PARTICIPA DE NENHUM DESAFIO ATIVO!');
      console.log('💡 AÇÃO: Criar participação no desafio existente');

      const challengeToJoin = activeJejumChallenges[0];
      console.log(`🎯 Criando participação no desafio: ${challengeToJoin.title}`);

      const { data: newParticipation, error: participationError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: challengeToJoin.id,
          target_value: challengeToJoin.daily_log_target || 16,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (participationError) {
        if (participationError.code === '23505') {
          console.log('⚠️ Participação já existe (erro de chave duplicada)');
        } else {
          console.error('❌ Erro ao criar participação:', participationError);
          return;
        }
      } else {
        console.log('✅ Participação criada!');
        console.log(`   ID da participação: ${newParticipation.id}`);
      }

    } else {
      console.log('✅ TUDO OK: Desafio ativo e usuário participando!');
      console.log('💡 AÇÃO: Nenhuma ação necessária');
    }

    // 4. VERIFICAÇÃO FINAL
    console.log('\n4. ✅ VERIFICAÇÃO FINAL');
    console.log('-'.repeat(40));

    const { data: finalChallenges } = await supabase
      .from('challenges')
      .select('*')
      .eq('category', 'jejum')
      .eq('is_active', true);

    const { data: finalParticipations } = await supabase
      .from('challenge_participations')
      .select('*, challenges(*)')
      .eq('user_id', userId)
      .eq('challenges.category', 'jejum');

    console.log('📊 Status final:');
    console.log(`   - Desafios ativos de jejum: ${finalChallenges?.length || 0}`);
    console.log(`   - Participações em jejum: ${finalParticipations?.length || 0}`);

    if (finalChallenges && finalChallenges.length > 0) {
      console.log('\n🎯 Desafio(s) ativo(s) de jejum:');
      finalChallenges.forEach((challenge, index) => {
        const participation = finalParticipations?.find(p => p.challenge_id === challenge.id);
        console.log(`   ${index + 1}. ${challenge.title}`);
        console.log(`      Participação: ${participation ? '✅' : '❌'}`);
        console.log(`      Progresso: ${participation?.progress || 0}%`);
      });
    }

    // 5. INSTRUÇÕES PARA O USUÁRIO
    console.log('\n5. 📋 INSTRUÇÕES PARA O USUÁRIO');
    console.log('-'.repeat(40));

    console.log('Para ver o desafio de jejum na interface:');
    console.log('1. Recarregue a página (Ctrl+F5 ou Cmd+Shift+R)');
    console.log('2. Vá para a seção "Desafios Individuais"');
    console.log('3. Procure pelo card do desafio de jejum');
    console.log('4. Clique em "Atualizar Progresso" para testar');

    // 6. RESUMO FINAL
    console.log('\n6. 🎯 RESUMO FINAL');
    console.log('-'.repeat(40));

    if (finalChallenges && finalChallenges.length > 0 && finalParticipations && finalParticipations.length > 0) {
      console.log('✅ SISTEMA FUNCIONAL: Desafio de jejum deve aparecer na interface');
      console.log('🎮 Próximos passos:');
      console.log('   1. Recarregar a página');
      console.log('   2. Verificar seção "Desafios Individuais"');
      console.log('   3. Procurar pelo desafio de jejum');
      console.log('   4. Testar funcionalidade de atualização');
    } else {
      console.log('❌ PROBLEMA DETECTADO: Desafio de jejum não está funcionando');
      console.log('🔧 Verifique os logs acima para mais detalhes');
    }

  } catch (error) {
    console.error('💥 Erro ao verificar desafios de jejum:', error);
  }
}

// Executar verificação
verificarDesafiosJejum(); 