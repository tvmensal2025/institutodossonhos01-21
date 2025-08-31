import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function dashboardDebugDesafios() {
  console.log('🔧 DASHBOARD DE DEBUG - SISTEMA DE DESAFIOS\n');
  console.log('='.repeat(60));

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

  try {
    // 1. STATUS GERAL DO SISTEMA
    console.log('\n📊 1. STATUS GERAL DO SISTEMA');
    console.log('-'.repeat(40));

    const { data: allChallenges, error: allError } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: allParticipations, error: partError } = await supabase
      .from('challenge_participations')
      .select('*, challenges(*)')
      .eq('user_id', userId);

    if (allError || partError) {
      console.error('❌ Erro ao buscar dados:', allError || partError);
      return;
    }

    console.log(`✅ Total de desafios no banco: ${allChallenges.length}`);
    console.log(`✅ Total de participações do usuário: ${allParticipations.length}`);
    console.log(`✅ Desafios ativos: ${allChallenges.filter(c => c.is_active).length}`);
    console.log(`✅ Participações ativas: ${allParticipations.filter(p => !p.is_completed).length}`);

    // 2. ANÁLISE POR CATEGORIA
    console.log('\n📋 2. ANÁLISE POR CATEGORIA');
    console.log('-'.repeat(40));

    const categories = {};
    allChallenges.forEach(challenge => {
      if (!categories[challenge.category]) {
        categories[challenge.category] = {
          total: 0,
          active: 0,
          participations: 0
        };
      }
      categories[challenge.category].total++;
      if (challenge.is_active) categories[challenge.category].active++;
    });

    allParticipations.forEach(participation => {
      const category = participation.challenges.category;
      if (categories[category]) {
        categories[category].participations++;
      }
    });

    Object.entries(categories).forEach(([category, stats]) => {
      console.log(`📊 ${category.toUpperCase()}:`);
      console.log(`   - Total: ${stats.total}`);
      console.log(`   - Ativos: ${stats.active}`);
      console.log(`   - Participações: ${stats.participations}`);
      console.log('');
    });

    // 3. DESAFIOS PROBLEMÁTICOS
    console.log('\n⚠️ 3. DESAFIOS PROBLEMÁTICOS');
    console.log('-'.repeat(40));

    const problematicChallenges = allChallenges.filter(challenge => {
      const participation = allParticipations.find(p => p.challenge_id === challenge.id);
      return challenge.is_active && !participation;
    });

    if (problematicChallenges.length > 0) {
      console.log(`❌ ${problematicChallenges.length} desafios ativos sem participação:`);
      problematicChallenges.forEach(challenge => {
        console.log(`   - ${challenge.title} (${challenge.category})`);
      });
    } else {
      console.log('✅ Todos os desafios ativos têm participação');
    }

    // 4. SIMULAÇÃO DA INTERFACE
    console.log('\n🖥️ 4. SIMULAÇÃO DA INTERFACE');
    console.log('-'.repeat(40));

    const activeChallenges = allChallenges.filter(c => c.is_active);
    const transformedChallenges = activeChallenges.map(challenge => {
      const participation = allParticipations.find(p => p.challenge_id === challenge.id);
      return {
        ...challenge,
        user_participation: participation ? {
          id: participation.id,
          progress: participation.progress || 0,
          is_completed: participation.is_completed || false,
          started_at: participation.started_at
        } : null
      };
    });

    const individuais = transformedChallenges.filter(d => !d.is_group_challenge);
    const publicos = transformedChallenges.filter(d => d.is_group_challenge);

    console.log(`📊 Desafios Individuais: ${individuais.length}`);
    individuais.forEach((challenge, index) => {
      const status = challenge.user_participation ? '✅ Participando' : '❌ Não participando';
      console.log(`   ${index + 1}. ${challenge.title} - ${status}`);
    });

    console.log(`\n📊 Desafios Públicos: ${publicos.length}`);
    publicos.forEach((challenge, index) => {
      const status = challenge.user_participation ? '✅ Participando' : '❌ Não participando';
      console.log(`   ${index + 1}. ${challenge.title} - ${status}`);
    });

    // 5. VERIFICAÇÃO ESPECÍFICA DO JEJUM
    console.log('\n⏰ 5. VERIFICAÇÃO ESPECÍFICA DO JEJUM');
    console.log('-'.repeat(40));

    const jejumChallenge = allChallenges.find(c => c.category === 'jejum');
    const jejumParticipation = allParticipations.find(p => p.challenges.category === 'jejum');

    if (jejumChallenge) {
      console.log('✅ Desafio de jejum encontrado:');
      console.log(`   - Título: ${jejumChallenge.title}`);
      console.log(`   - ID: ${jejumChallenge.id}`);
      console.log(`   - Ativo: ${jejumChallenge.is_active ? 'Sim' : 'Não'}`);
      console.log(`   - Em grupo: ${jejumChallenge.is_group_challenge ? 'Sim' : 'Não'}`);
      console.log(`   - Criado em: ${jejumChallenge.created_at}`);
      
      if (jejumParticipation) {
        console.log('✅ Participação encontrada:');
        console.log(`   - Progresso: ${jejumParticipation.progress}%`);
        console.log(`   - Concluído: ${jejumParticipation.is_completed ? 'Sim' : 'Não'}`);
        console.log(`   - Iniciado em: ${jejumParticipation.started_at}`);
      } else {
        console.log('❌ NENHUMA PARTICIPAÇÃO ENCONTRADA!');
      }
    } else {
      console.log('❌ DESAFIO DE JEJUM NÃO ENCONTRADO!');
    }

    // 6. AÇÕES CORRETIVAS
    console.log('\n🔧 6. AÇÕES CORRETIVAS DISPONÍVEIS');
    console.log('-'.repeat(40));

    console.log('1. 🔄 Recriar desafio de jejum');
    console.log('2. 👤 Forçar participação do usuário');
    console.log('3. 🗑️ Limpar cache da interface');
    console.log('4. 📊 Verificar logs de erro');
    console.log('5. 🔍 Debug completo da interface');

    // 7. RECOMENDAÇÕES
    console.log('\n💡 7. RECOMENDAÇÕES');
    console.log('-'.repeat(40));

    if (!jejumChallenge) {
      console.log('❌ PROBLEMA: Desafio de jejum não existe');
      console.log('💡 SOLUÇÃO: Criar novo desafio de jejum');
    } else if (!jejumChallenge.is_active) {
      console.log('❌ PROBLEMA: Desafio de jejum não está ativo');
      console.log('💡 SOLUÇÃO: Ativar o desafio');
    } else if (!jejumParticipation) {
      console.log('❌ PROBLEMA: Usuário não participa do desafio de jejum');
      console.log('💡 SOLUÇÃO: Criar participação manualmente');
    } else {
      console.log('✅ TUDO OK: Desafio de jejum deve aparecer na interface');
      console.log('💡 SOLUÇÃO: Recarregar página e limpar cache');
    }

    // 8. COMANDOS DE DEBUG
    console.log('\n🛠️ 8. COMANDOS DE DEBUG DISPONÍVEIS');
    console.log('-'.repeat(40));

    console.log('Para executar ações específicas, use:');
    console.log('node debug-desafios-interface.mjs');
    console.log('node verificar-filtros-interface.mjs');
    console.log('node forcar-atualizacao-interface.mjs');

    // 9. RESUMO FINAL
    console.log('\n🎯 9. RESUMO FINAL');
    console.log('-'.repeat(40));

    console.log(`📊 Status do Sistema:`);
    console.log(`   - Desafios totais: ${allChallenges.length}`);
    console.log(`   - Desafios ativos: ${activeChallenges.length}`);
    console.log(`   - Participações: ${allParticipations.length}`);
    console.log(`   - Desafio de jejum: ${jejumChallenge ? '✅' : '❌'}`);
    console.log(`   - Participação em jejum: ${jejumParticipation ? '✅' : '❌'}`);

    if (jejumChallenge && jejumChallenge.is_active && jejumParticipation) {
      console.log('\n✅ SISTEMA FUNCIONAL: Desafio de jejum deve aparecer na interface');
      console.log('🎮 Próximos passos:');
      console.log('   1. Recarregar a página (Ctrl+F5)');
      console.log('   2. Verificar seção "Desafios Individuais"');
      console.log('   3. Procurar por "Jejum 40 horas"');
      console.log('   4. Testar botão "Atualizar Progresso"');
    } else {
      console.log('\n❌ PROBLEMA DETECTADO: Desafio de jejum não está funcionando');
      console.log('🔧 Ações necessárias:');
      if (!jejumChallenge) console.log('   - Criar desafio de jejum');
      if (jejumChallenge && !jejumChallenge.is_active) console.log('   - Ativar desafio de jejum');
      if (!jejumParticipation) console.log('   - Criar participação do usuário');
    }

  } catch (error) {
    console.error('💥 Erro no dashboard:', error);
  }
}

// Executar o dashboard
dashboardDebugDesafios(); 