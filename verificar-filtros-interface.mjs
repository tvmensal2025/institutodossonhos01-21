import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarFiltrosInterface() {
  console.log('🔍 Verificando Filtros da Interface\n');

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

  try {
    // 1. Simular exatamente o que a interface faz
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

    // 2. Simular busca de participações
    console.log('2. Simulando busca de participações...');
    const { data: participationsData, error: participationsError } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', userId);

    if (participationsError) {
      console.error('❌ Erro ao buscar participações:', participationsError);
      return;
    }

    console.log(`✅ Encontradas ${participationsData.length} participações\n`);

    // 3. Simular transformação de dados (exatamente como na interface)
    console.log('3. Simulando transformação de dados...');
    const transformedDesafios = challengesData.map(challenge => {
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
        daily_log_target: challenge.daily_log_target || 1,
        daily_log_unit: challenge.daily_log_unit || 'unidade',
        user_participation: userParticipation ? {
          id: userParticipation.id,
          progress: userParticipation.progress || 0,
          is_completed: userParticipation.is_completed || false,
          started_at: userParticipation.started_at
        } : null
      };
    });

    console.log(`✅ Desafios transformados: ${transformedDesafios.length}\n`);

    // 4. Aplicar filtros como na interface
    console.log('4. Aplicando filtros como na interface...');
    
    const desafiosIndividuais = transformedDesafios.filter(d => !d.is_group_challenge);
    const desafiosPublicos = transformedDesafios.filter(d => d.is_group_challenge);

    console.log(`📊 Desafios Individuais: ${desafiosIndividuais.length}`);
    console.log(`📊 Desafios Públicos: ${desafiosPublicos.length}\n`);

    // 5. Mostrar desafios individuais
    console.log('5. Desafios Individuais (onde o jejum deveria aparecer):');
    desafiosIndividuais.forEach((desafio, index) => {
      console.log(`   ${index + 1}. ${desafio.title}`);
      console.log(`      Categoria: ${desafio.category}`);
      console.log(`      Em grupo: ${desafio.is_group_challenge}`);
      console.log(`      Participação: ${desafio.user_participation ? 'Sim' : 'Não'}`);
      if (desafio.user_participation) {
        console.log(`      Progresso: ${desafio.user_participation.progress}%`);
      }
      console.log('');
    });

    // 6. Mostrar desafios públicos
    console.log('6. Desafios Públicos:');
    desafiosPublicos.forEach((desafio, index) => {
      console.log(`   ${index + 1}. ${desafio.title}`);
      console.log(`      Categoria: ${desafio.category}`);
      console.log(`      Em grupo: ${desafio.is_group_challenge}`);
      console.log(`      Participação: ${desafio.user_participation ? 'Sim' : 'Não'}`);
      if (desafio.user_participation) {
        console.log(`      Progresso: ${desafio.user_participation.progress}%`);
      }
      console.log('');
    });

    // 7. Verificar especificamente o desafio de jejum
    console.log('7. Verificando desafio de jejum especificamente...');
    const jejumDesafio = transformedDesafios.find(d => d.category === 'jejum');
    
    if (jejumDesafio) {
      console.log(`✅ Desafio de jejum encontrado: ${jejumDesafio.title}`);
      console.log(`   Categoria: ${jejumDesafio.category}`);
      console.log(`   Em grupo: ${jejumDesafio.is_group_challenge}`);
      console.log(`   Participação: ${jejumDesafio.user_participation ? 'Sim' : 'Não'}`);
      console.log(`   Progresso: ${jejumDesafio.user_participation?.progress || 0}%`);
      
      if (!jejumDesafio.is_group_challenge) {
        console.log('✅ Deve aparecer em "Desafios Individuais"');
      } else {
        console.log('✅ Deve aparecer em "Desafios Públicos"');
      }
    } else {
      console.log('❌ Desafio de jejum NÃO encontrado!');
    }

    // 8. Verificar se o desafio de jejum está nos individuais
    const jejumNosIndividuais = desafiosIndividuais.find(d => d.category === 'jejum');
    const jejumNosPublicos = desafiosPublicos.find(d => d.category === 'jejum');

    console.log('\n8. Verificando onde o desafio de jejum aparece:');
    console.log(`   Nos Desafios Individuais: ${jejumNosIndividuais ? '✅' : '❌'}`);
    console.log(`   Nos Desafios Públicos: ${jejumNosPublicos ? '✅' : '❌'}`);

    if (jejumNosIndividuais) {
      console.log(`   ✅ Desafio de jejum está nos individuais: ${jejumNosIndividuais.title}`);
    }
    if (jejumNosPublicos) {
      console.log(`   ✅ Desafio de jejum está nos públicos: ${jejumNosPublicos.title}`);
    }

    // 9. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log(`   - Total de desafios: ${transformedDesafios.length}`);
    console.log(`   - Desafios Individuais: ${desafiosIndividuais.length}`);
    console.log(`   - Desafios Públicos: ${desafiosPublicos.length}`);
    console.log(`   - Desafio de jejum encontrado: ${jejumDesafio ? '✅' : '❌'}`);
    console.log(`   - Desafio de jejum nos individuais: ${jejumNosIndividuais ? '✅' : '❌'}`);
    console.log(`   - Desafio de jejum nos públicos: ${jejumNosPublicos ? '✅' : '❌'}`);

    if (jejumNosIndividuais) {
      console.log('\n✅ TUDO OK: Desafio de jejum deve aparecer na seção "Desafios Individuais"!');
      console.log('🎮 Na interface deve aparecer:');
      console.log('   - Seção: Desafios Individuais');
      console.log('   - Card: Jejum 40 horas');
      console.log('   - Botão: "Atualizar Progresso"');
    } else if (jejumNosPublicos) {
      console.log('\n✅ TUDO OK: Desafio de jejum deve aparecer na seção "Desafios Públicos"!');
      console.log('🎮 Na interface deve aparecer:');
      console.log('   - Seção: Desafios Públicos');
      console.log('   - Card: Jejum 40 horas');
      console.log('   - Botão: "Atualizar Progresso"');
    } else {
      console.log('\n❌ PROBLEMA: Desafio de jejum não aparece em nenhuma seção!');
      console.log('💡 POSSÍVEIS CAUSAS:');
      console.log('   1. Problema na transformação de dados');
      console.log('   2. Problema no filtro is_group_challenge');
      console.log('   3. Problema na renderização da interface');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o teste
verificarFiltrosInterface(); 