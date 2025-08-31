import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarJejumInterface() {
  console.log('🔍 Verificando Desafio de Jejum na Interface\n');

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

  try {
    // 1. Simular busca de desafios como na interface
    console.log('1. Simulando busca de desafios (como na interface)...');
    const { data: challengesData, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (challengesError) {
      console.error('❌ Erro ao buscar desafios:', challengesError);
      return;
    }

    console.log(`✅ Encontrados ${challengesData.length} desafios ativos\n`);

    // 2. Simular busca de participações do usuário
    console.log('2. Simulando busca de participações do usuário...');
    const { data: participationsData, error: participationsError } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', userId);

    if (participationsError) {
      console.error('❌ Erro ao buscar participações:', participationsError);
      return;
    }

    console.log(`✅ Encontradas ${participationsData.length} participações do usuário\n`);

    // 3. Simular transformação de dados como na interface
    console.log('3. Simulando transformação de dados (como na interface)...');
    const transformedChallenges = challengesData.map(challenge => {
      const userParticipation = participationsData.find(p => p.challenge_id === challenge.id);
      
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

    // 4. Verificar desafios de jejum
    console.log('4. Verificando desafios de jejum na lista transformada...');
    const jejumChallenges = transformedChallenges.filter(challenge => 
      challenge.category === 'jejum' || 
      challenge.title.toLowerCase().includes('jejum')
    );

    console.log(`📊 Desafios de jejum encontrados: ${jejumChallenges.length}`);

    if (jejumChallenges.length > 0) {
      console.log('\n📋 Detalhes dos desafios de jejum:');
      jejumChallenges.forEach((challenge, index) => {
        console.log(`   ${index + 1}. ${challenge.title}`);
        console.log(`      Categoria: ${challenge.category}`);
        console.log(`      Dificuldade: ${challenge.difficulty}`);
        console.log(`      Participação: ${challenge.user_participation ? 'Sim' : 'Não'}`);
        if (challenge.user_participation) {
          console.log(`      Progresso: ${challenge.user_participation.progress}%`);
          console.log(`      Concluído: ${challenge.user_participation.is_completed ? 'Sim' : 'Não'}`);
        }
        console.log(`      Meta: ${challenge.target_value} ${challenge.daily_log_unit || 'unidades'}`);
        console.log('');
      });
    }

    // 5. Verificar se o desafio de jejum está aparecendo corretamente
    console.log('5. Verificando visibilidade do desafio de jejum...');
    
    const jejumChallenge = jejumChallenges[0];
    if (jejumChallenge) {
      console.log(`✅ Desafio de jejum encontrado: ${jejumChallenge.title}`);
      
      if (jejumChallenge.user_participation) {
        console.log('✅ Usuário está participando do desafio de jejum');
        console.log(`📊 Progresso atual: ${jejumChallenge.user_participation.progress}%`);
        console.log(`🎯 Status: ${jejumChallenge.user_participation.is_completed ? 'Concluído' : 'Em andamento'}`);
        
        // Simular botões que devem aparecer
        console.log('\n🎮 Botões que devem aparecer na interface:');
        console.log('   - "Ver Progresso (X%)" (botão verde)');
        console.log('   - "Atualizar Progresso" (botão outline)');
      } else {
        console.log('⚠️ Usuário NÃO está participando do desafio de jejum');
        console.log('🎮 Botão que deve aparecer na interface:');
        console.log('   - "Participar do Desafio" (botão azul)');
      }
    } else {
      console.log('❌ Desafio de jejum NÃO encontrado na lista transformada!');
    }

    // 6. Verificar todos os desafios por categoria
    console.log('\n6. Resumo por categoria:');
    const categories = {};
    transformedChallenges.forEach(challenge => {
      if (!categories[challenge.category]) {
        categories[challenge.category] = [];
      }
      categories[challenge.category].push(challenge);
    });

    Object.entries(categories).forEach(([category, challenges]) => {
      const participating = challenges.filter(c => c.user_participation).length;
      console.log(`   ${category}: ${challenges.length} desafios (${participating} participando)`);
    });

    // 7. Verificar se há problemas na interface
    console.log('\n7. Verificando possíveis problemas na interface...');
    
    const jejumParticipations = participationsData.filter(p => {
      const challenge = challengesData.find(c => c.id === p.challenge_id);
      return challenge && (challenge.category === 'jejum' || challenge.title.toLowerCase().includes('jejum'));
    });

    if (jejumParticipations.length === 0) {
      console.log('⚠️ PROBLEMA: Usuário não tem participação em desafio de jejum!');
      console.log('💡 SOLUÇÃO: Criar participação manualmente');
    } else {
      console.log('✅ Usuário tem participação em desafio de jejum');
      console.log(`📊 Participações em jejum: ${jejumParticipations.length}`);
    }

    // 8. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log(`   - Total de desafios ativos: ${challengesData.length}`);
    console.log(`   - Desafios de jejum: ${jejumChallenges.length}`);
    console.log(`   - Participações do usuário: ${participationsData.length}`);
    console.log(`   - Participações em jejum: ${jejumParticipations.length}`);
    
    if (jejumChallenges.length > 0 && jejumChallenges[0].user_participation) {
      console.log('\n✅ TUDO OK: Desafio de jejum está disponível e o usuário está participando!');
      console.log('🎮 Na interface deve aparecer:');
      console.log('   - Card do desafio de jejum');
      console.log('   - Botão "Ver Progresso"');
      console.log('   - Botão "Atualizar Progresso"');
    } else if (jejumChallenges.length > 0) {
      console.log('\n⚠️ PROBLEMA: Desafio de jejum existe mas usuário não participa!');
      console.log('💡 SOLUÇÃO: Usuário precisa clicar em "Participar do Desafio"');
    } else {
      console.log('\n❌ PROBLEMA: Desafio de jejum não está aparecendo!');
      console.log('💡 SOLUÇÃO: Verificar se o desafio está ativo no banco');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o teste
verificarJejumInterface(); 