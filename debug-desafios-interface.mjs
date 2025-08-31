import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDesafiosInterface() {
  console.log('🔍 Debugando Desafios na Interface\n');

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

  try {
    // 1. Buscar TODOS os desafios (sem filtro)
    console.log('1. Buscando TODOS os desafios (sem filtro)...');
    const { data: allChallenges, error: allError } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Erro ao buscar todos os desafios:', allError);
      return;
    }

    console.log(`✅ Total de desafios no banco: ${allChallenges.length}\n`);

    // 2. Mostrar todos os desafios
    console.log('2. Todos os desafios no banco:');
    allChallenges.forEach((challenge, index) => {
      console.log(`   ${index + 1}. ${challenge.title}`);
      console.log(`      ID: ${challenge.id}`);
      console.log(`      Categoria: ${challenge.category}`);
      console.log(`      Ativo: ${challenge.is_active}`);
      console.log(`      Dificuldade: ${challenge.difficulty}`);
      console.log(`      Criado em: ${challenge.created_at}`);
      console.log('');
    });

    // 3. Buscar desafios ativos (como na interface)
    console.log('3. Buscando desafios ativos (como na interface)...');
    const { data: activeChallenges, error: activeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (activeError) {
      console.error('❌ Erro ao buscar desafios ativos:', activeError);
      return;
    }

    console.log(`✅ Desafios ativos encontrados: ${activeChallenges.length}\n`);

    // 4. Mostrar desafios ativos
    console.log('4. Desafios ativos:');
    activeChallenges.forEach((challenge, index) => {
      console.log(`   ${index + 1}. ${challenge.title}`);
      console.log(`      ID: ${challenge.id}`);
      console.log(`      Categoria: ${challenge.category}`);
      console.log(`      Dificuldade: ${challenge.difficulty}`);
      console.log('');
    });

    // 5. Verificar participações do usuário
    console.log('5. Verificando participações do usuário...');
    const { data: participations, error: participationsError } = await supabase
      .from('challenge_participations')
      .select('*, challenges(*)')
      .eq('user_id', userId);

    if (participationsError) {
      console.error('❌ Erro ao buscar participações:', participationsError);
      return;
    }

    console.log(`✅ Participações do usuário: ${participations.length}\n`);

    // 6. Mostrar participações
    console.log('6. Participações do usuário:');
    participations.forEach((participation, index) => {
      const challenge = participation.challenges;
      console.log(`   ${index + 1}. ${challenge.title}`);
      console.log(`      ID da participação: ${participation.id}`);
      console.log(`      Progresso: ${participation.progress}%`);
      console.log(`      Concluído: ${participation.is_completed}`);
      console.log('');
    });

    // 7. Simular transformação de dados (exatamente como na interface)
    console.log('7. Simulando transformação de dados (exatamente como na interface)...');
    const transformedChallenges = activeChallenges.map(challenge => {
      const userParticipation = participations.find(p => p.challenge_id === challenge.id);
      
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category || 'exercicio',
        difficulty: challenge.difficulty || 'medio',
        duration_days: challenge.duration_days || 7,
        points_reward: challenge.points_reward || 100,
        badge_icon: challenge.badge_icon || '🏆',
        badge_name: challenge.badge_name || challenge.title,
        instructions: challenge.instructions || challenge.description,
        tips: challenge.tips || ['Complete diariamente', 'Mantenha a consistência'],
        is_active: challenge.is_active ?? true,
        is_featured: challenge.is_featured ?? false,
        is_group_challenge: challenge.is_group_challenge ?? false,
        target_value: challenge.daily_log_target || 1,
        user_participation: userParticipation ? {
          id: userParticipation.id,
          progress: userParticipation.progress || 0,
          is_completed: userParticipation.is_completed || false,
          started_at: userParticipation.started_at
        } : null
      };
    });

    console.log(`✅ Desafios transformados: ${transformedChallenges.length}\n`);

    // 8. Mostrar desafios transformados
    console.log('8. Desafios transformados (como aparecem na interface):');
    transformedChallenges.forEach((challenge, index) => {
      console.log(`   ${index + 1}. ${challenge.title}`);
      console.log(`      Categoria: ${challenge.category}`);
      console.log(`      Dificuldade: ${challenge.difficulty}`);
      console.log(`      Participação: ${challenge.user_participation ? 'Sim' : 'Não'}`);
      if (challenge.user_participation) {
        console.log(`      Progresso: ${challenge.user_participation.progress}%`);
        console.log(`      Concluído: ${challenge.user_participation.is_completed}`);
      }
      console.log(`      Em grupo: ${challenge.is_group_challenge}`);
      console.log('');
    });

    // 9. Verificar desafios de jejum especificamente
    console.log('9. Verificando desafios de jejum...');
    const jejumChallenges = transformedChallenges.filter(challenge => 
      challenge.category === 'jejum' || 
      challenge.title.toLowerCase().includes('jejum')
    );

    console.log(`📊 Desafios de jejum encontrados: ${jejumChallenges.length}`);
    
    if (jejumChallenges.length > 0) {
      jejumChallenges.forEach((challenge, index) => {
        console.log(`   ${index + 1}. ${challenge.title}`);
        console.log(`      Categoria: ${challenge.category}`);
        console.log(`      Participação: ${challenge.user_participation ? 'Sim' : 'Não'}`);
        console.log(`      Progresso: ${challenge.user_participation?.progress || 0}%`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhum desafio de jejum encontrado na lista transformada!');
    }

    // 10. Verificar se há problemas específicos
    console.log('10. Verificando possíveis problemas...');
    
    // Verificar se o desafio de jejum está sendo filtrado incorretamente
    const jejumInActive = activeChallenges.filter(challenge => 
      challenge.category === 'jejum' || 
      challenge.title.toLowerCase().includes('jejum')
    );
    
    console.log(`📊 Desafios de jejum nos ativos: ${jejumInActive.length}`);
    
    if (jejumInActive.length === 0) {
      console.log('❌ PROBLEMA: Desafio de jejum não está nos desafios ativos!');
      console.log('💡 POSSÍVEIS CAUSAS:');
      console.log('   - Desafio não está marcado como ativo');
      console.log('   - Problema na categoria');
      console.log('   - Problema no título');
    } else {
      console.log('✅ Desafio de jejum está nos desafios ativos');
    }

    // 11. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log(`   - Total de desafios no banco: ${allChallenges.length}`);
    console.log(`   - Desafios ativos: ${activeChallenges.length}`);
    console.log(`   - Desafios transformados: ${transformedChallenges.length}`);
    console.log(`   - Participações do usuário: ${participations.length}`);
    console.log(`   - Desafios de jejum ativos: ${jejumInActive.length}`);
    console.log(`   - Desafios de jejum transformados: ${jejumChallenges.length}`);

    if (jejumChallenges.length === 0) {
      console.log('\n❌ PROBLEMA: Desafio de jejum não aparece na interface!');
      console.log('💡 POSSÍVEIS SOLUÇÕES:');
      console.log('   1. Verificar se o desafio está ativo no banco');
      console.log('   2. Verificar se a categoria está correta');
      console.log('   3. Verificar se há problemas na transformação de dados');
      console.log('   4. Recarregar a página da interface');
    } else {
      console.log('\n✅ TUDO OK: Desafio de jejum deve aparecer na interface!');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o debug
debugDesafiosInterface(); 