import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resolverProblemaJejum() {
  console.log('🔧 RESOLVENDO PROBLEMA DO DESAFIO DE JEJUM\n');
  console.log('='.repeat(50));

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

  try {
    // 1. DIAGNÓSTICO INICIAL
    console.log('1. 🔍 DIAGNÓSTICO INICIAL');
    console.log('-'.repeat(30));

    const { data: jejumChallenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('category', 'jejum')
      .single();

    const { data: jejumParticipation, error: participationError } = await supabase
      .from('challenge_participations')
      .select('*, challenges(*)')
      .eq('user_id', userId)
      .eq('challenges.category', 'jejum')
      .maybeSingle();

    console.log('📊 Status atual:');
    console.log(`   - Desafio de jejum: ${jejumChallenge ? '✅ Existe' : '❌ Não existe'}`);
    console.log(`   - Participação: ${jejumParticipation ? '✅ Existe' : '❌ Não existe'}`);
    
    if (jejumChallenge) {
      console.log(`   - Ativo: ${jejumChallenge.is_active ? '✅' : '❌'}`);
      console.log(`   - Em grupo: ${jejumChallenge.is_group_challenge ? '✅' : '❌'}`);
    }

    // 2. AÇÕES CORRETIVAS
    console.log('\n2. 🔧 AÇÕES CORRETIVAS');
    console.log('-'.repeat(30));

    let actionsTaken = [];

    // Verificar se o desafio existe
    if (!jejumChallenge) {
      console.log('❌ Desafio de jejum não existe. Criando...');
      
      const { data: newChallenge, error: createError } = await supabase
        .from('challenges')
        .insert({
          title: 'Jejum Intermitente',
          description: 'Faça jejum de 16 horas por dia por uma semana',
          category: 'jejum',
          difficulty: 'medio',
          duration_days: 7,
          points_reward: 120,
          badge_icon: '⏰',
          badge_name: 'Mestre do Jejum',
          instructions: 'Faça jejum de 16 horas por dia. Por exemplo: jante às 20h e só coma novamente às 12h do dia seguinte.',
          tips: ['Beba muita água durante o jejum', 'Mantenha-se ocupado para não pensar na comida', 'Comece gradualmente'],
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

      console.log('✅ Desafio de jejum criado!');
      actionsTaken.push('Criou desafio de jejum');
    }

    // Verificar se está ativo
    if (jejumChallenge && !jejumChallenge.is_active) {
      console.log('❌ Desafio de jejum não está ativo. Ativando...');
      
      const { error: activateError } = await supabase
        .from('challenges')
        .update({ is_active: true })
        .eq('id', jejumChallenge.id);

      if (activateError) {
        console.error('❌ Erro ao ativar desafio:', activateError);
        return;
      }

      console.log('✅ Desafio de jejum ativado!');
      actionsTaken.push('Ativou desafio de jejum');
    }

    // Verificar participação
    if (!jejumParticipation) {
      console.log('❌ Usuário não participa do desafio de jejum. Criando participação...');
      
      const challengeId = jejumChallenge?.id;
      if (!challengeId) {
        console.error('❌ Não foi possível obter ID do desafio');
        return;
      }

      const { data: newParticipation, error: participationError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          target_value: jejumChallenge?.daily_log_target || 16,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (participationError) {
        if (participationError.code === '23505') {
          console.log('⚠️ Participação já existe (erro de chave duplicada)');
          console.log('✅ Tentando buscar participação existente...');
          
          // Buscar participação existente
          const { data: existingParticipation, error: fetchError } = await supabase
            .from('challenge_participations')
            .select('*, challenges(*)')
            .eq('user_id', userId)
            .eq('challenge_id', challengeId)
            .single();

          if (existingParticipation) {
            console.log('✅ Participação existente encontrada!');
            actionsTaken.push('Encontrou participação existente');
          } else {
            console.error('❌ Erro ao buscar participação existente:', fetchError);
            return;
          }
        } else {
          console.error('❌ Erro ao criar participação:', participationError);
          return;
        }
      } else {
        console.log('✅ Participação criada!');
        actionsTaken.push('Criou participação do usuário');
      }
    }

    // 3. VERIFICAÇÃO FINAL
    console.log('\n3. ✅ VERIFICAÇÃO FINAL');
    console.log('-'.repeat(30));

    const { data: finalChallenge, error: finalChallengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('category', 'jejum')
      .eq('is_active', true)
      .single();

    const { data: finalParticipation, error: finalParticipationError } = await supabase
      .from('challenge_participations')
      .select('*, challenges(*)')
      .eq('user_id', userId)
      .eq('challenges.category', 'jejum')
      .maybeSingle();

    console.log('📊 Status final:');
    console.log(`   - Desafio existe: ${finalChallenge ? '✅' : '❌'}`);
    console.log(`   - Desafio ativo: ${finalChallenge?.is_active ? '✅' : '❌'}`);
    console.log(`   - Participação existe: ${finalParticipation ? '✅' : '❌'}`);
    console.log(`   - Progresso: ${finalParticipation?.progress || 0}%`);

    if (finalChallenge && finalParticipation) {
      console.log('\n✅ PROBLEMA RESOLVIDO!');
      console.log('🎮 O desafio de jejum deve aparecer na interface agora.');
      console.log('📋 Detalhes:');
      console.log(`   - Título: ${finalChallenge.title}`);
      console.log(`   - Categoria: ${finalChallenge.category}`);
      console.log(`   - Dificuldade: ${finalChallenge.difficulty}`);
      console.log(`   - Progresso: ${finalParticipation.progress}%`);
      console.log(`   - Seção: Desafios Individuais`);
    } else {
      console.log('\n❌ PROBLEMA PERSISTE');
      console.log('🔧 Ações tomadas:', actionsTaken.join(', '));
    }

    // 4. INSTRUÇÕES PARA O USUÁRIO
    console.log('\n4. 📋 INSTRUÇÕES PARA O USUÁRIO');
    console.log('-'.repeat(30));

    console.log('Para ver o desafio de jejum na interface:');
    console.log('1. Recarregue a página (Ctrl+F5 ou Cmd+Shift+R)');
    console.log('2. Vá para a seção "Desafios Individuais"');
    console.log('3. Procure pelo card "Jejum Intermitente" ou "Jejum 40 horas"');
    console.log('4. Clique em "Atualizar Progresso" para testar');
    console.log('5. Se não aparecer, tente:');
    console.log('   - Limpar cache do navegador');
    console.log('   - Fechar e abrir o navegador');
    console.log('   - Verificar console do navegador para erros');

    // 5. COMANDOS DE DEBUG ADICIONAIS
    console.log('\n5. 🛠️ COMANDOS DE DEBUG ADICIONAIS');
    console.log('-'.repeat(30));

    console.log('Para monitoramento contínuo:');
    console.log('node monitor-tempo-real.mjs');
    console.log('');
    console.log('Para dashboard completo:');
    console.log('node dashboard-debug-desafios.mjs');
    console.log('');
    console.log('Para verificar interface:');
    console.log('node verificar-filtros-interface.mjs');

    // 6. RESUMO FINAL
    console.log('\n6. 🎯 RESUMO FINAL');
    console.log('-'.repeat(30));

    if (actionsTaken.length > 0) {
      console.log('✅ Ações executadas:');
      actionsTaken.forEach(action => console.log(`   - ${action}`));
    } else {
      console.log('✅ Nenhuma ação necessária - sistema já estava funcionando');
    }

    console.log('\n🎮 PRÓXIMOS PASSOS:');
    console.log('1. Recarregar a página da interface');
    console.log('2. Verificar seção "Desafios Individuais"');
    console.log('3. Procurar pelo desafio de jejum');
    console.log('4. Testar funcionalidade de atualização');

  } catch (error) {
    console.error('💥 Erro ao resolver problema:', error);
  }
}

// Executar resolução
resolverProblemaJejum(); 