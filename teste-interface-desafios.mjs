import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simularParticipacaoDesafio() {
  console.log('🎮 Simulando participação em desafio...\n');

  const userId = 'c6a29ad1-65b4-4fcb-bfd1-a61b48cb319e';
  const challengeId = '8e5196df-d576-450e-9f8e-78a6be6b83c9';

  try {
    // 1. Verificar desafio
    console.log('1. Verificando desafio...');
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError) {
      console.error('❌ Erro ao buscar desafio:', challengeError);
      return;
    }

    console.log(`✅ Desafio: ${challenge.title}\n`);

    // 2. Verificar participação existente
    console.log('2. Verificando participação existente...');
    const { data: existingParticipation, error: participationError } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (participationError) {
      console.error('❌ Erro ao verificar participação:', participationError);
      return;
    }

    if (existingParticipation) {
      console.log('⚠️ Usuário já participa deste desafio');
      console.log(`📊 Progresso: ${existingParticipation.progress}%`);
      console.log(`✅ Concluído: ${existingParticipation.is_completed ? 'Sim' : 'Não'}`);
      console.log(`📅 Iniciado em: ${existingParticipation.started_at}`);
      
      // Simular tentativa de participar novamente
      console.log('\n3. Simulando tentativa de participar novamente...');
      const { data: duplicateTest, error: duplicateError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          target_value: challenge.daily_log_target || 1,
          progress: 0
        })
        .select();

      if (duplicateError) {
        console.log('✅ Erro esperado detectado:', duplicateError.message);
        console.log('📝 Código do erro:', duplicateError.code);
        
        // Simular o comportamento da interface corrigida
        if (duplicateError.code === '23505') {
          console.log('🔄 Interface deve mostrar: "Você já está participando deste desafio"');
          
          // Buscar participação existente para atualizar interface
          const { data: participation, error: fetchError } = await supabase
            .from('challenge_participations')
            .select('*')
            .eq('user_id', userId)
            .eq('challenge_id', challengeId)
            .single();

          if (!fetchError && participation) {
            console.log('✅ Participação existente encontrada e carregada');
            console.log(`📊 Interface deve mostrar: "Ver Progresso (${participation.progress}%)"`);
          }
        }
      } else {
        console.log('⚠️ Erro: Constraint única não funcionou!');
      }
    } else {
      console.log('✅ Usuário não participa ainda');
      
      // Simular participação
      console.log('\n3. Simulando nova participação...');
      const { data: newParticipation, error: insertError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
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

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar a simulação
simularParticipacaoDesafio(); 