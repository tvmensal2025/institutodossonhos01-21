import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forcarAtualizacaoInterface() {
  console.log('🔄 Forçando Atualização da Interface\n');

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

  try {
    // 1. Verificar se o desafio de jejum existe e está ativo
    console.log('1. Verificando desafio de jejum no banco...');
    const { data: jejumChallenge, error: jejumError } = await supabase
      .from('challenges')
      .select('*')
      .eq('category', 'jejum')
      .eq('is_active', true)
      .single();

    if (jejumError) {
      console.error('❌ Erro ao buscar desafio de jejum:', jejumError);
      return;
    }

    console.log('✅ Desafio de jejum encontrado:');
    console.log(`   Título: ${jejumChallenge.title}`);
    console.log(`   ID: ${jejumChallenge.id}`);
    console.log(`   Ativo: ${jejumChallenge.is_active}`);
    console.log(`   Em grupo: ${jejumChallenge.is_group_challenge}\n`);

    // 2. Verificar participação do usuário
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
    console.log(`   Concluído: ${participation.is_completed}\n`);

    // 3. Forçar atualização do desafio (marcar como inativo e depois ativo novamente)
    console.log('3. Forçando atualização do desafio...');
    
    // Primeiro, marcar como inativo
    const { error: deactivateError } = await supabase
      .from('challenges')
      .update({ is_active: false })
      .eq('id', jejumChallenge.id);

    if (deactivateError) {
      console.error('❌ Erro ao desativar desafio:', deactivateError);
      return;
    }

    console.log('✅ Desafio marcado como inativo');

    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Depois, marcar como ativo novamente
    const { error: activateError } = await supabase
      .from('challenges')
      .update({ is_active: true })
      .eq('id', jejumChallenge.id);

    if (activateError) {
      console.error('❌ Erro ao reativar desafio:', activateError);
      return;
    }

    console.log('✅ Desafio reativado\n');

    // 4. Verificar se a atualização funcionou
    console.log('4. Verificando se a atualização funcionou...');
    const { data: updatedChallenge, error: checkError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', jejumChallenge.id)
      .single();

    if (checkError) {
      console.error('❌ Erro ao verificar desafio atualizado:', checkError);
      return;
    }

    console.log('✅ Desafio atualizado:');
    console.log(`   Título: ${updatedChallenge.title}`);
    console.log(`   Ativo: ${updatedChallenge.is_active}`);
    console.log(`   Última atualização: ${updatedChallenge.updated_at}\n`);

    // 5. Simular busca como a interface faz
    console.log('5. Simulando busca como a interface faz...');
    const { data: activeChallenges, error: activeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (activeError) {
      console.error('❌ Erro ao buscar desafios ativos:', activeError);
      return;
    }

    console.log(`✅ Desafios ativos encontrados: ${activeChallenges.length}`);

    const jejumInActive = activeChallenges.find(c => c.category === 'jejum');
    if (jejumInActive) {
      console.log('✅ Desafio de jejum está nos desafios ativos!');
      console.log(`   Título: ${jejumInActive.title}`);
      console.log(`   ID: ${jejumInActive.id}`);
    } else {
      console.log('❌ Desafio de jejum NÃO está nos desafios ativos!');
    }

    // 6. Instruções para o usuário
    console.log('\n🎯 INSTRUÇÕES PARA O USUÁRIO:');
    console.log('1. Recarregue a página da interface (Ctrl+F5 ou Cmd+Shift+R)');
    console.log('2. Vá para a seção "Desafios Individuais"');
    console.log('3. Procure pelo card "Jejum 40 horas"');
    console.log('4. Se não aparecer, tente:');
    console.log('   - Limpar o cache do navegador');
    console.log('   - Fechar e abrir o navegador novamente');
    console.log('   - Verificar se há erros no console do navegador');

    // 7. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log(`   - Desafio de jejum existe: ✅`);
    console.log(`   - Desafio está ativo: ${updatedChallenge.is_active ? '✅' : '❌'}`);
    console.log(`   - Usuário participa: ✅`);
    console.log(`   - Progresso: ${participation.progress}%`);
    console.log(`   - Deve aparecer em: Desafios Individuais`);

    if (updatedChallenge.is_active && jejumInActive) {
      console.log('\n✅ TUDO OK: Desafio de jejum deve aparecer na interface!');
      console.log('🎮 Após recarregar a página, deve aparecer:');
      console.log('   - Seção: Desafios Individuais');
      console.log('   - Card: Jejum 40 horas (com ícone Timer)');
      console.log('   - Botão: "Atualizar Progresso"');
      console.log('   - Progresso: 0%');
    } else {
      console.log('\n❌ PROBLEMA: Desafio de jejum não está sendo carregado!');
      console.log('💡 SOLUÇÃO: Recarregar a página e limpar cache');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o teste
forcarAtualizacaoInterface(); 