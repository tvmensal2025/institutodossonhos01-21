import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDesafiosAtuais() {
  console.log('🔍 Verificando desafios atuais no banco de dados...\n');

  try {
    // 1. Buscar todos os desafios
    console.log('1. Buscando todos os desafios...');
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: true });

    if (challengesError) {
      console.error('❌ Erro ao buscar desafios:', challengesError);
      return;
    }

    console.log(`✅ Encontrados ${challenges.length} desafios\n`);

    // 2. Mostrar detalhes de cada desafio
    console.log('2. Detalhes dos desafios:');
    challenges.forEach((challenge, index) => {
      console.log(`   ${index + 1}. ID: ${challenge.id}`);
      console.log(`      Título: ${challenge.title}`);
      console.log(`      Descrição: ${challenge.description}`);
      console.log(`      Categoria: ${challenge.category}`);
      console.log(`      Dificuldade: ${challenge.difficulty}`);
      console.log(`      Duração: ${challenge.duration_days} dias`);
      console.log(`      Pontos: ${challenge.points_reward}`);
      console.log(`      Ativo: ${challenge.is_active ? 'Sim' : 'Não'}`);
      console.log(`      Em grupo: ${challenge.is_group_challenge ? 'Sim' : 'Não'}`);
      console.log(`      Criado em: ${challenge.created_at}`);
      console.log('');
    });

    // 3. Verificar participações (deve estar vazio agora)
    console.log('3. Verificando participações (deve estar vazio)...');
    const { data: participations, error: participationsError } = await supabase
      .from('challenge_participations')
      .select('*');

    if (participationsError) {
      console.error('❌ Erro ao buscar participações:', participationsError);
    } else {
      console.log(`✅ Total de participações: ${participations.length}`);
      
      if (participations.length === 0) {
        console.log('🎉 Nenhuma participação encontrada - tabela limpa!');
      } else {
        console.log('⚠️ Ainda há participações na tabela');
        participations.forEach(participation => {
          console.log(`   - ID: ${participation.id}, Usuário: ${participation.user_id}, Desafio: ${participation.challenge_id}`);
        });
      }
    }

    // 4. Testar participação em um desafio específico
    console.log('\n4. Testando participação em desafio...');
    const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085'; // ID do usuário atual
    const challengeId = challenges[0]?.id; // Primeiro desafio

    if (challengeId) {
      console.log(`   Testando participação no desafio: ${challenges[0].title}`);
      
      const { data: novaParticipacao, error: insertError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          target_value: challenges[0].daily_log_target || 1,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir participação:', insertError);
      } else {
        console.log('✅ Participação criada com sucesso!');
        console.log('📊 ID da participação:', novaParticipacao.id);
      }
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar a verificação
verificarDesafiosAtuais(); 