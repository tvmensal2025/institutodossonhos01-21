import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verificarDesafios() {
  console.log('🔍 Verificando desafios no banco de dados...');

  try {
    // 1. Verificar todos os desafios
    const { data: todosDesafios, error: errorTodos } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true);

    if (errorTodos) {
      console.log('❌ Erro ao buscar todos os desafios:', errorTodos.message);
    } else {
      console.log(`✅ Encontrados ${todosDesafios.length} desafios ativos:`);
      todosDesafios.forEach((desafio, index) => {
        console.log(`${index + 1}. ${desafio.badge_icon || '🏆'} ${desafio.title}`);
        console.log(`   Dificuldade: ${desafio.difficulty}`);
        console.log(`   Grupo: ${desafio.is_group_challenge ? 'Sim' : 'Não'}`);
        console.log(`   Ativo: ${desafio.is_active ? 'Sim' : 'Não'}`);
        console.log('');
      });
    }

    // 2. Verificar desafios individuais
    const { data: desafiosIndividuais, error: errorIndividuais } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .eq('is_group_challenge', false);

    if (errorIndividuais) {
      console.log('❌ Erro ao buscar desafios individuais:', errorIndividuais.message);
    } else {
      console.log(`📊 Desafios Individuais: ${desafiosIndividuais.length}`);
    }

    // 3. Verificar desafios públicos
    const { data: desafiosPublicos, error: errorPublicos } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .eq('is_group_challenge', true);

    if (errorPublicos) {
      console.log('❌ Erro ao buscar desafios públicos:', errorPublicos.message);
    } else {
      console.log(`👥 Desafios Públicos: ${desafiosPublicos.length}`);
    }

    // 4. Verificar participações
    const { data: participacoes, error: errorParticipacoes } = await supabase
      .from('challenge_participations')
      .select('*')
      .limit(5);

    if (errorParticipacoes) {
      console.log('❌ Erro ao buscar participações:', errorParticipacoes.message);
    } else {
      console.log(`🎯 Participações encontradas: ${participacoes.length}`);
      participacoes.forEach((part, index) => {
        console.log(`${index + 1}. User: ${part.user_id} | Progress: ${part.progress} | Completed: ${part.is_completed}`);
      });
    }

    // 5. Verificar estrutura da tabela
    console.log('\n📋 ESTRUTURA DA TABELA CHALLENGES:');
    if (todosDesafios && todosDesafios.length > 0) {
      const primeiroDesafio = todosDesafios[0];
      console.log('Campos disponíveis:', Object.keys(primeiroDesafio));
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
verificarDesafios(); 