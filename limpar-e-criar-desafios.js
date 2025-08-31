import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function limparECriarDesafios() {
  console.log('🧹 Limpando e criando desafios limpos...');

  try {
    // 1. Limpar desafios antigos com nomes estranhos
    console.log('1. Removendo desafios antigos...');
    const { error: deleteError } = await supabase
      .from('challenges')
      .delete()
      .in('title', ['hjhjhjhjhj', ',,,,,,,', 'bbbb', 'bmw de', 'noinn', 'JEJUM INTERMITENTE ***']);

    if (deleteError) {
      console.log('❌ Erro ao remover desafios antigos:', deleteError.message);
    } else {
      console.log('✅ Desafios antigos removidos');
    }

    // 2. Criar desafios individuais limpos
    console.log('2. Criando desafios individuais...');
    const desafiosIndividuais = [
      {
        title: 'Beber 2L de Água Diariamente',
        description: 'Mantenha-se hidratado bebendo pelo menos 2 litros de água por dia',
        category: 'Hidratação',
        difficulty: 'facil',
        duration_days: 30,
        points_reward: 50,
        badge_icon: '💧',
        badge_name: 'Hidratação Master',
        instructions: 'Beba água regularmente ao longo do dia.',
        tips: ['Tenha sempre uma garrafa de água por perto', 'Beba um copo ao acordar'],
        is_active: true,
        is_featured: true,
        is_group_challenge: false,
        daily_log_target: 2000,
        daily_log_unit: 'ml'
      },
      {
        title: 'Caminhar 8000 Passos',
        description: 'Dê pelo menos 8000 passos todos os dias para manter-se ativo',
        category: 'Atividade Física',
        difficulty: 'medio',
        duration_days: 30,
        points_reward: 75,
        badge_icon: '🚶‍♂️',
        badge_name: 'Caminhador Dedicado',
        instructions: 'Use um contador de passos ou app no celular.',
        tips: ['Estacione mais longe', 'Use escadas'],
        is_active: true,
        is_featured: true,
        is_group_challenge: false,
        daily_log_target: 8000,
        daily_log_unit: 'passos'
      },
      {
        title: 'Exercitar-se 30 Minutos',
        description: 'Faça pelo menos 30 minutos de exercício físico moderado',
        category: 'Atividade Física',
        difficulty: 'dificil',
        duration_days: 30,
        points_reward: 120,
        badge_icon: '💪',
        badge_name: 'Atleta Dedicado',
        instructions: 'Pode ser academia, corrida, natação, dança ou esportes.',
        tips: ['Escolha atividade prazerosa', 'Comece gradualmente'],
        is_active: true,
        is_featured: true,
        is_group_challenge: false,
        daily_log_target: 30,
        daily_log_unit: 'minutos'
      },
      {
        title: 'Meditar 10 Minutos',
        description: 'Pratique meditação ou mindfulness por 10 minutos diários',
        category: 'Bem-estar Mental',
        difficulty: 'facil',
        duration_days: 21,
        points_reward: 60,
        badge_icon: '🧘‍♀️',
        badge_name: 'Mente Zen',
        instructions: 'Use apps como Headspace, Calm ou pratique respiração profunda.',
        tips: ['Comece com 5 minutos', 'Use apps guiados'],
        is_active: true,
        is_featured: false,
        is_group_challenge: false,
        daily_log_target: 10,
        daily_log_unit: 'minutos'
      },
      {
        title: 'Dormir 8 Horas',
        description: 'Tenha uma noite de sono reparador com pelo menos 8 horas',
        category: 'Sono',
        difficulty: 'medio',
        duration_days: 30,
        points_reward: 80,
        badge_icon: '😴',
        badge_name: 'Dorminhoco Saudável',
        instructions: 'Estabeleça uma rotina noturna, evite telas 1h antes de dormir.',
        tips: ['Desligue telas 1h antes', 'Mantenha horário fixo'],
        is_active: true,
        is_featured: true,
        is_group_challenge: false,
        daily_log_target: 8,
        daily_log_unit: 'horas'
      }
    ];

    for (const desafio of desafiosIndividuais) {
      const { data, error } = await supabase
        .from('challenges')
        .insert(desafio)
        .select();

      if (error) {
        console.log(`❌ Erro ao criar desafio "${desafio.title}":`, error.message);
      } else {
        console.log(`✅ Desafio individual criado: "${desafio.title}"`);
      }
    }

    // 3. Criar desafios públicos limpos
    console.log('3. Criando desafios públicos...');
    const desafiosPublicos = [
      {
        title: '💧 Hidratação em Grupo - Janeiro 2025',
        description: 'Desafio comunitário: Vamos todos beber 2.5L de água por dia!',
        category: 'Hidratação',
        difficulty: 'facil',
        duration_days: 31,
        points_reward: 150,
        badge_icon: '💧',
        badge_name: 'Hidratação Comunitária',
        instructions: 'Junte-se à comunidade e mantenha-se hidratado.',
        tips: ['Beba um copo ao acordar', 'Use uma garrafa marcada'],
        is_active: true,
        is_featured: true,
        is_group_challenge: true,
        daily_log_target: 2500,
        daily_log_unit: 'ml'
      },
      {
        title: '🚶‍♀️ Caminhada Matinal Coletiva',
        description: 'Desafio: 30 minutos de caminhada toda manhã. Vamos começar o dia com energia!',
        category: 'Atividade Física',
        difficulty: 'facil',
        duration_days: 21,
        points_reward: 200,
        badge_icon: '🚶‍♀️',
        badge_name: 'Caminhador Matinal',
        instructions: 'Caminhe 30 minutos todas as manhãs e compartilhe sua energia!',
        tips: ['Acorde 30min mais cedo', 'Convide um amigo'],
        is_active: true,
        is_featured: true,
        is_group_challenge: true,
        daily_log_target: 30,
        daily_log_unit: 'minutos'
      },
      {
        title: '💪 Guerreiros do Treino',
        description: 'Desafio hardcore: 1 hora de exercício intenso por dia. Apenas para guerreiros!',
        category: 'Atividade Física',
        difficulty: 'dificil',
        duration_days: 30,
        points_reward: 300,
        badge_icon: '💪',
        badge_name: 'Guerreiro Fitness',
        instructions: 'Treino intenso de 1 hora. Compartilhe seus resultados!',
        tips: ['Varie os exercícios', 'Respeite o descanso'],
        is_active: true,
        is_featured: true,
        is_group_challenge: true,
        daily_log_target: 60,
        daily_log_unit: 'minutos'
      },
      {
        title: '🧘‍♀️ Meditação Coletiva',
        description: 'Vamos meditar juntos! 15 minutos diários de paz e tranquilidade.',
        category: 'Bem-estar Mental',
        difficulty: 'medio',
        duration_days: 21,
        points_reward: 180,
        badge_icon: '🧘‍♀️',
        badge_name: 'Mente Zen Coletiva',
        instructions: 'Medite 15 minutos por dia e compartilhe suas reflexões.',
        tips: ['Mesmo horário todos os dias', 'Local silencioso'],
        is_active: true,
        is_featured: false,
        is_group_challenge: true,
        daily_log_target: 15,
        daily_log_unit: 'minutos'
      },
      {
        title: '🏆 Mega Desafio da Saúde Total',
        description: 'O desafio mais completo: 4 metas de saúde todos os dias por 30 dias!',
        category: 'Saúde Integral',
        difficulty: 'dificil',
        duration_days: 30,
        points_reward: 500,
        badge_icon: '🏆',
        badge_name: 'Mestre da Saúde',
        instructions: 'Complete 4 metas diárias: água, exercício, alimentação e sono.',
        tips: ['Planeje com antecedência', 'Use checklist'],
        is_active: true,
        is_featured: true,
        is_group_challenge: true,
        daily_log_target: 4,
        daily_log_unit: 'metas'
      }
    ];

    for (const desafio of desafiosPublicos) {
      const { data, error } = await supabase
        .from('challenges')
        .insert(desafio)
        .select();

      if (error) {
        console.log(`❌ Erro ao criar desafio "${desafio.title}":`, error.message);
      } else {
        console.log(`✅ Desafio público criado: "${desafio.title}"`);
      }
    }

    console.log('\n🎉 Desafios limpos criados com sucesso!');
    console.log('📱 Teste agora no dashboard: http://localhost:8081/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar limpeza e criação
limparECriarDesafios(); 