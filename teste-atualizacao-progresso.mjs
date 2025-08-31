import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarAtualizacaoProgresso() {
  console.log('🎯 Testando Atualização de Progresso dos Desafios\n');

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

  try {
    // 1. Verificar participações existentes
    console.log('1. Verificando participações existentes...');
    const { data: participations, error: participationsError } = await supabase
      .from('challenge_participations')
      .select('*, challenges(*)')
      .eq('user_id', userId);

    if (participationsError) {
      console.error('❌ Erro ao buscar participações:', participationsError);
      return;
    }

    console.log(`✅ Encontradas ${participations.length} participações\n`);

    if (participations.length === 0) {
      console.log('⚠️ Nenhuma participação encontrada. Criando uma participação de teste...');
      
      // Criar participação de teste
      const { data: newParticipation, error: insertError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: '8e5196df-d576-450e-9f8e-78a6be6b83c9', // Exercício Diário
          target_value: 30,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar participação de teste:', insertError);
        return;
      }

      console.log('✅ Participação de teste criada!');
    }

    // 2. Testar atualização de progresso
    console.log('\n2. Testando atualização de progresso...');
    
    for (const participation of participations) {
      const challenge = participation.challenges;
      console.log(`\n📊 Testando: ${challenge.title}`);
      console.log(`   Progresso atual: ${participation.progress}%`);
      console.log(`   Meta: ${challenge.daily_log_target} ${challenge.daily_log_unit}`);
      
      // Simular diferentes valores de progresso
      const testValues = [10, 25, 50, 75, 100];
      
      for (const testValue of testValues) {
        console.log(`   🧪 Testando valor: ${testValue}`);
        
        const { data: updateResult, error: updateError } = await supabase
          .from('challenge_participations')
          .update({
            progress: testValue,
            is_completed: testValue >= challenge.daily_log_target,
            updated_at: new Date().toISOString()
          })
          .eq('id', participation.id)
          .select()
          .single();

        if (updateError) {
          console.error(`   ❌ Erro ao atualizar para ${testValue}:`, updateError);
        } else {
          const progressPercentage = (testValue / challenge.daily_log_target) * 100;
          const isCompleted = testValue >= challenge.daily_log_target;
          
          console.log(`   ✅ Atualizado para ${testValue} (${Math.round(progressPercentage)}%)`);
          
          if (isCompleted) {
            console.log(`   🎉 DESAFIO CONCLUÍDO!`);
          }
        }
        
        // Aguardar um pouco entre os testes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Resetar para 0
      await supabase
        .from('challenge_participations')
        .update({
          progress: 0,
          is_completed: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', participation.id);
      
      console.log(`   🔄 Resetado para 0%`);
    }

    // 3. Testar função RPC de atualização
    console.log('\n3. Testando função RPC update_challenge_progress...');
    
    const { data: rpcTest, error: rpcError } = await supabase
      .rpc('update_challenge_progress', {
        participation_id: participations[0].id,
        new_progress: 15,
        notes: 'Teste de atualização via RPC'
      });

    if (rpcError) {
      console.error('❌ Erro na função RPC:', rpcError);
    } else {
      console.log('✅ Função RPC funcionando!');
      console.log('📊 Resultado:', rpcTest);
    }

    // 4. Verificar estado final
    console.log('\n4. Estado final das participações:');
    const { data: finalParticipations, error: finalError } = await supabase
      .from('challenge_participations')
      .select('*, challenges(*)')
      .eq('user_id', userId);

    if (finalError) {
      console.error('❌ Erro ao verificar estado final:', finalError);
    } else {
      finalParticipations.forEach(participation => {
        const challenge = participation.challenges;
        console.log(`   - ${challenge.title}: ${participation.progress}% ${participation.is_completed ? '✅ Concluído' : '🔄 Em andamento'}`);
      });
    }

    console.log('\n🎉 Teste de atualização concluído!');

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o teste
testarAtualizacaoProgresso(); 