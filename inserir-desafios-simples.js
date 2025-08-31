import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inserirDesafiosSimples() {
  console.log('📝 Inserindo desafios simples...');

  try {
    // Primeiro, vamos verificar se já existem desafios
    const { data: desafiosExistentes, error: errorCheck } = await supabase
      .from('challenges')
      .select('title')
      .eq('is_active', true);

    if (errorCheck) {
      console.log('❌ Erro ao verificar desafios existentes:', errorCheck.message);
      return;
    }

    console.log(`📊 Encontrados ${desafiosExistentes.length} desafios existentes`);

    // Se já temos desafios suficientes, não inserir mais
    if (desafiosExistentes.length >= 5) {
      console.log('✅ Já existem desafios suficientes no banco!');
      console.log('📱 Teste agora no dashboard: http://localhost:8081/dashboard');
      return;
    }

    // Desafios para inserir
    const desafios = [
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
      }
    ];

    // Inserir desafios
    for (const desafio of desafios) {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('challenges')
        .select('id')
        .eq('title', desafio.title)
        .single();

      if (existing) {
        console.log(`⏭️ Desafio já existe: "${desafio.title}"`);
        continue;
      }

      const { data, error } = await supabase
        .from('challenges')
        .insert(desafio)
        .select();

      if (error) {
        console.log(`❌ Erro ao criar desafio "${desafio.title}":`, error.message);
      } else {
        console.log(`✅ Desafio criado: "${desafio.title}"`);
      }
    }

    console.log('\n🎉 Desafios inseridos com sucesso!');
    console.log('📱 Teste agora no dashboard: http://localhost:8081/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar inserção
inserirDesafiosSimples(); 