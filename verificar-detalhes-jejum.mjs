import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDetalhesJejum() {
  console.log('🔍 Verificando Detalhes do Desafio de Jejum\n');

  try {
    // 1. Buscar desafio de jejum específico
    console.log('1. Buscando desafio de jejum...');
    const { data: jejumChallenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('category', 'jejum')
      .single();

    if (challengeError) {
      console.error('❌ Erro ao buscar desafio de jejum:', challengeError);
      return;
    }

    console.log('✅ Desafio de jejum encontrado:');
    console.log(`   ID: ${jejumChallenge.id}`);
    console.log(`   Título: ${jejumChallenge.title}`);
    console.log(`   Descrição: ${jejumChallenge.description}`);
    console.log(`   Categoria: ${jejumChallenge.category}`);
    console.log(`   Dificuldade: ${jejumChallenge.difficulty}`);
    console.log(`   Ativo: ${jejumChallenge.is_active}`);
    console.log(`   Meta: ${jejumChallenge.daily_log_target} ${jejumChallenge.daily_log_unit}`);
    console.log(`   Pontos: ${jejumChallenge.points_reward}`);
    console.log(`   Duração: ${jejumChallenge.duration_days} dias`);
    console.log(`   Badge: ${jejumChallenge.badge_icon}`);
    console.log(`   Criado em: ${jejumChallenge.created_at}\n`);

    // 2. Verificar participação do usuário
    const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';
    console.log('2. Verificando participação do usuário...');
    
    const { data: participation, error: participationError } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', jejumChallenge.id)
      .single();

    if (participationError) {
      console.error('❌ Erro ao buscar participação:', participationError);
      return;
    }

    console.log('✅ Participação encontrada:');
    console.log(`   ID da participação: ${participation.id}`);
    console.log(`   Progresso: ${participation.progress}%`);
    console.log(`   Concluído: ${participation.is_completed}`);
    console.log(`   Iniciado em: ${participation.started_at}`);
    console.log(`   Meta: ${participation.target_value}\n`);

    // 3. Simular transformação de dados como na interface
    console.log('3. Simulando transformação de dados...');
    const transformedChallenge = {
      id: jejumChallenge.id,
      title: jejumChallenge.title,
      description: jejumChallenge.description,
      category: jejumChallenge.category || 'exercicio',
      difficulty: jejumChallenge.difficulty || 'medio',
      duration_days: jejumChallenge.duration_days || 7,
      points_reward: jejumChallenge.points_reward || 100,
      badge_icon: jejumChallenge.badge_icon || '🏆',
      badge_name: jejumChallenge.badge_name || jejumChallenge.title,
      instructions: jejumChallenge.instructions || jejumChallenge.description,
      tips: jejumChallenge.tips || ['Complete diariamente', 'Mantenha a consistência'],
      is_active: jejumChallenge.is_active ?? true,
      is_featured: jejumChallenge.is_featured ?? false,
      is_group_challenge: jejumChallenge.is_group_challenge ?? false,
      target_value: jejumChallenge.daily_log_target || 1,
      user_participation: {
        id: participation.id,
        progress: participation.progress || 0,
        is_completed: participation.is_completed || false,
        started_at: participation.started_at
      }
    };

    console.log('✅ Dados transformados:');
    console.log(`   Título: ${transformedChallenge.title}`);
    console.log(`   Categoria: ${transformedChallenge.category}`);
    console.log(`   Dificuldade: ${transformedChallenge.difficulty}`);
    console.log(`   Participação: ${transformedChallenge.user_participation ? 'Sim' : 'Não'}`);
    console.log(`   Progresso: ${transformedChallenge.user_participation.progress}%`);
    console.log(`   Concluído: ${transformedChallenge.user_participation.is_completed}`);
    console.log(`   Meta: ${transformedChallenge.target_value} ${jejumChallenge.daily_log_unit || 'unidades'}\n`);

    // 4. Verificar se o desafio deve aparecer na interface
    console.log('4. Verificando visibilidade na interface...');
    
    if (transformedChallenge.is_active) {
      console.log('✅ Desafio está ativo - deve aparecer na interface');
    } else {
      console.log('❌ Desafio não está ativo - NÃO deve aparecer na interface');
    }

    if (transformedChallenge.user_participation) {
      console.log('✅ Usuário está participando - deve mostrar botões de progresso');
      console.log('🎮 Botões que devem aparecer:');
      console.log('   - "Ver Progresso (0%)" (botão verde)');
      console.log('   - "Atualizar Progresso" (botão outline)');
    } else {
      console.log('⚠️ Usuário não está participando - deve mostrar botão de participar');
      console.log('🎮 Botão que deve aparecer:');
      console.log('   - "Participar do Desafio" (botão azul)');
    }

    // 5. Verificar ícone da categoria
    console.log('\n5. Verificando ícone da categoria...');
    const categoryIcons = {
      'jejum': 'Timer',
      'exercicio': 'Dumbbell',
      'hidratacao': 'Droplets',
      'mindfulness': 'Brain',
      'nutricao': 'Apple',
      'sono': 'Moon',
      'medicao': 'Scale'
    };
    
    const icon = categoryIcons[transformedChallenge.category] || 'Target';
    console.log(`   Categoria: ${transformedChallenge.category}`);
    console.log(`   Ícone: ${icon}`);

    // 6. Verificar gradiente de dificuldade
    console.log('\n6. Verificando gradiente de dificuldade...');
    const difficultyGradients = {
      'facil': 'from-green-500 to-green-600',
      'medio': 'from-yellow-500 to-orange-500',
      'dificil': 'from-orange-500 to-red-500',
      'extremo': 'from-red-500 to-pink-500'
    };
    
    const gradient = difficultyGradients[transformedChallenge.difficulty] || 'from-gray-500 to-gray-600';
    console.log(`   Dificuldade: ${transformedChallenge.difficulty}`);
    console.log(`   Gradiente: ${gradient}`);

    // 7. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log(`   - Desafio existe: ✅`);
    console.log(`   - Desafio ativo: ${transformedChallenge.is_active ? '✅' : '❌'}`);
    console.log(`   - Usuário participa: ${transformedChallenge.user_participation ? '✅' : '❌'}`);
    console.log(`   - Progresso: ${transformedChallenge.user_participation.progress}%`);
    console.log(`   - Concluído: ${transformedChallenge.user_participation.is_completed ? '✅' : '❌'}`);
    
    if (transformedChallenge.is_active && transformedChallenge.user_participation) {
      console.log('\n✅ TUDO OK: Desafio de jejum deve aparecer na interface!');
      console.log('🎮 Interface deve mostrar:');
      console.log('   - Card do desafio com ícone Timer');
      console.log('   - Gradiente vermelho (dificuldade extrema)');
      console.log('   - Botão "Ver Progresso (0%)"');
      console.log('   - Botão "Atualizar Progresso"');
    } else if (transformedChallenge.is_active) {
      console.log('\n⚠️ PROBLEMA: Desafio existe mas usuário não participa!');
      console.log('💡 SOLUÇÃO: Usuário precisa clicar em "Participar do Desafio"');
    } else {
      console.log('\n❌ PROBLEMA: Desafio não está ativo!');
      console.log('💡 SOLUÇÃO: Ativar o desafio no banco de dados');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o teste
verificarDetalhesJejum(); 