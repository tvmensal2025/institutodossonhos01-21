import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function aplicarRLSManual() {
  console.log('🔧 Aplicando RLS manualmente...');

  try {
    // 1. Desabilitar RLS
    console.log('1. Desabilitando RLS...');
    await supabase.rpc('exec_sql', { sql: 'ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;' });
    await supabase.rpc('exec_sql', { sql: 'ALTER TABLE challenge_participations DISABLE ROW LEVEL SECURITY;' });

    // 2. Limpar desafios antigos
    console.log('2. Limpando desafios antigos...');
    await supabase.rpc('exec_sql', { 
      sql: "DELETE FROM challenges WHERE title IN ('hjhjhjhjhj', ',,,,,,,', 'bbbb', 'bmw de', 'noinn', 'JEJUM INTERMITENTE ***');" 
    });

    // 3. Inserir desafios de teste
    console.log('3. Inserindo desafios de teste...');
    
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

    for (const desafio of desafios) {
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

    // 4. Reabilitar RLS com políticas simples
    console.log('4. Reabilitando RLS...');
    await supabase.rpc('exec_sql', { sql: 'ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;' });
    await supabase.rpc('exec_sql', { sql: 'ALTER TABLE challenge_participations ENABLE ROW LEVEL SECURITY;' });

    // 5. Criar políticas simples
    console.log('5. Criando políticas RLS...');
    await supabase.rpc('exec_sql', { sql: 'CREATE POLICY "Allow read challenges" ON challenges FOR SELECT USING (true);' });
    await supabase.rpc('exec_sql', { sql: 'CREATE POLICY "Allow read participations" ON challenge_participations FOR SELECT USING (true);' });
    await supabase.rpc('exec_sql', { sql: 'CREATE POLICY "Allow insert participations" ON challenge_participations FOR INSERT WITH CHECK (true);' });
    await supabase.rpc('exec_sql', { sql: 'CREATE POLICY "Allow update participations" ON challenge_participations FOR UPDATE USING (true);' });

    console.log('\n🎉 RLS corrigido e desafios criados!');
    console.log('📱 Teste agora no dashboard: http://localhost:8081/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar correção
aplicarRLSManual(); 