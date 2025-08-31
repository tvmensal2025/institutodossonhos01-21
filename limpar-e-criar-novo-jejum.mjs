import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function limparECriarNovoJejum() {
  console.log('🧹 LIMPANDO E CRIANDO NOVO DESAFIO DE JEJUM\n');
  console.log('='.repeat(50));

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

  try {
    // 1. LIMPAR PARTICIPAÇÕES ANTIGAS
    console.log('1. 🧹 LIMPANDO PARTICIPAÇÕES ANTIGAS');
    console.log('-'.repeat(40));

    const { data: oldParticipations, error: fetchError } = await supabase
      .from('challenge_participations')
      .select('*, challenges(*)')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('❌ Erro ao buscar participações:', fetchError);
      return;
    }

    console.log(`📊 Total de participações encontradas: ${oldParticipations.length}`);

    // Mostrar participações antigas
    oldParticipations.forEach((participation, index) => {
      const challengeTitle = participation.challenges?.title || 'Desafio não encontrado';
      console.log(`   ${index + 1}. ${challengeTitle} (${participation.challenges?.category || 'sem categoria'})`);
    });

    // Deletar todas as participações
    const { error: deleteError } = await supabase
      .from('challenge_participations')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('❌ Erro ao deletar participações:', deleteError);
      return;
    }

    console.log('✅ Todas as participações antigas foram removidas!');

    // 2. DESATIVAR DESAFIOS ANTIGOS DE JEJUM
    console.log('\n2. 🔄 DESATIVANDO DESAFIOS ANTIGOS DE JEJUM');
    console.log('-'.repeat(40));

    const { data: oldJejumChallenges, error: jejumError } = await supabase
      .from('challenges')
      .select('*')
      .eq('category', 'jejum');

    if (jejumError) {
      console.error('❌ Erro ao buscar desafios de jejum:', jejumError);
      return;
    }

    console.log(`📊 Desafios de jejum encontrados: ${oldJejumChallenges.length}`);

    for (const challenge of oldJejumChallenges) {
      console.log(`   Desativando: ${challenge.title}`);
      
      const { error: deactivateError } = await supabase
        .from('challenges')
        .update({ is_active: false })
        .eq('id', challenge.id);

      if (deactivateError) {
        console.error(`❌ Erro ao desativar ${challenge.title}:`, deactivateError);
      } else {
        console.log(`   ✅ ${challenge.title} desativado`);
      }
    }

    // 3. CRIAR NOVO DESAFIO DE JEJUM
    console.log('\n3. 🆕 CRIANDO NOVO DESAFIO DE JEJUM');
    console.log('-'.repeat(40));

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
    console.log(`   Dificuldade: ${newChallenge.difficulty}`);

    // 4. CRIAR PARTICIPAÇÃO NO NOVO DESAFIO
    console.log('\n4. 👤 CRIANDO PARTICIPAÇÃO NO NOVO DESAFIO');
    console.log('-'.repeat(40));

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
    console.log(`   Iniciado em: ${newParticipation.started_at}`);

    // 5. VERIFICAÇÃO FINAL
    console.log('\n5. ✅ VERIFICAÇÃO FINAL');
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
        console.log(`      Dificuldade: ${challenge.difficulty}`);
        console.log(`      Pontos: ${challenge.points_reward}`);
      });
    }

    // 6. INSTRUÇÕES PARA O USUÁRIO
    console.log('\n6. 📋 INSTRUÇÕES PARA O USUÁRIO');
    console.log('-'.repeat(40));

    console.log('✅ NOVO DESAFIO DE JEJUM CRIADO COM SUCESSO!');
    console.log('');
    console.log('Para ver o novo desafio na interface:');
    console.log('1. Recarregue a página (Ctrl+F5 ou Cmd+Shift+R)');
    console.log('2. Vá para a seção "Desafios Individuais"');
    console.log('3. Procure pelo card "Jejum Intermitente 16/8"');
    console.log('4. Clique em "Atualizar Progresso" para testar');
    console.log('');
    console.log('🎯 Detalhes do novo desafio:');
    console.log('   - Título: Jejum Intermitente 16/8');
    console.log('   - Dificuldade: Médio');
    console.log('   - Pontos: 150');
    console.log('   - Duração: 7 dias');
    console.log('   - Meta: 16 horas de jejum por dia');

    // 7. RESUMO FINAL
    console.log('\n7. 🎯 RESUMO FINAL');
    console.log('-'.repeat(40));

    console.log('✅ Ações executadas:');
    console.log('   - Removidas todas as participações antigas');
    console.log('   - Desativados desafios antigos de jejum');
    console.log('   - Criado novo desafio de jejum limpo');
    console.log('   - Criada participação no novo desafio');
    console.log('');
    console.log('🎮 PRÓXIMOS PASSOS:');
    console.log('1. Recarregar a página da interface');
    console.log('2. Verificar seção "Desafios Individuais"');
    console.log('3. Procurar pelo novo desafio "Jejum Intermitente 16/8"');
    console.log('4. Testar funcionalidade de atualização');

  } catch (error) {
    console.error('💥 Erro ao limpar e criar novo desafio:', error);
  }
}

// Executar limpeza e criação
limparECriarNovoJejum(); 