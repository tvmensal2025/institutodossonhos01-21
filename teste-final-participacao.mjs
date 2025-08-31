import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testeFinalParticipacao() {
  console.log('🎯 Teste Final - Participação em Desafios\n');

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085'; // ID do usuário atual

  try {
    // 1. Verificar desafios disponíveis
    console.log('1. Verificando desafios disponíveis...');
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .limit(3);

    if (challengesError) {
      console.error('❌ Erro ao buscar desafios:', challengesError);
      return;
    }

    console.log(`✅ Encontrados ${challenges.length} desafios ativos\n`);

    // 2. Testar participação em cada desafio
    for (let i = 0; i < challenges.length; i++) {
      const challenge = challenges[i];
      console.log(`\n2.${i + 1} Testando participação no desafio: ${challenge.title}`);
      
      // Verificar se já participa
      const { data: existingParticipation, error: checkError } = await supabase
        .from('challenge_participations')
        .select('id, progress, is_completed')
        .eq('user_id', userId)
        .eq('challenge_id', challenge.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Erro ao verificar participação:', checkError);
        continue;
      }

      if (existingParticipation) {
        console.log(`⚠️ Já participa deste desafio (${existingParticipation.progress}% concluído)`);
        
        // Testar tentativa de participar novamente
        console.log('🔄 Testando tentativa de participar novamente...');
        const { data: duplicateTest, error: duplicateError } = await supabase
          .from('challenge_participations')
          .insert({
            user_id: userId,
            challenge_id: challenge.id,
            target_value: challenge.daily_log_target || 1,
            progress: 0
          })
          .select();

        if (duplicateError) {
          console.log('✅ Erro esperado detectado:', duplicateError.message);
          console.log('📝 Código do erro:', duplicateError.code);
        } else {
          console.log('⚠️ Erro: Constraint única não funcionou!');
        }
      } else {
        console.log('✅ Não participa ainda, criando participação...');
        
        const { data: newParticipation, error: insertError } = await supabase
          .from('challenge_participations')
          .insert({
            user_id: userId,
            challenge_id: challenge.id,
            target_value: challenge.daily_log_target || 1,
            progress: 0,
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erro ao criar participação:', insertError);
        } else {
          console.log('✅ Participação criada com sucesso!');
          console.log('📊 ID da participação:', newParticipation.id);
        }
      }
    }

    // 3. Verificar estado final
    console.log('\n3. Verificando estado final...');
    const { data: allParticipations, error: finalError } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', userId);

    if (finalError) {
      console.error('❌ Erro ao verificar participações finais:', finalError);
    } else {
      console.log(`✅ Total de participações do usuário: ${allParticipations.length}`);
      
      allParticipations.forEach(participation => {
        const challenge = challenges.find(c => c.id === participation.challenge_id);
        console.log(`   - ${challenge?.title || 'Desafio desconhecido'}: ${participation.progress}%`);
      });
    }

    console.log('\n🎉 Teste final concluído!');

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o teste final
testeFinalParticipacao(); 