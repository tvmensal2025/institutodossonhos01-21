import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarFluxoCompleto() {
  console.log('🧪 Testando fluxo completo de desafios...');
  
  try {
    // 1. Buscar desafios
    console.log('1. Buscando desafios...');
    const { data: desafios, error: desafiosError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .limit(3);

    if (desafiosError) {
      console.error('❌ Erro ao buscar desafios:', desafiosError);
      return;
    }

    console.log(`✅ Encontrados ${desafios.length} desafios`);
    
    // 2. Simular usuário (usar um ID real se disponível)
    const userId = 'e5565dd4-961c-4cb1-b1ec-eba97493d006'; // RAFAEL FERREIRA DIAS
    const desafio = desafios[0];
    
    console.log(`2. Testando com desafio: ${desafio.title}`);
    
    // 3. Criar participação
    console.log('3. Criando participação...');
    const { data: participacao, error: participacaoError } = await supabase
      .from('challenge_participations')
      .insert({
        user_id: userId,
        challenge_id: desafio.id,
        progress: 0,
        is_completed: false,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (participacaoError) {
      console.error('❌ Erro ao criar participação:', participacaoError);
      return;
    }

    console.log('✅ Participação criada:', participacao.id);
    
    // 4. Atualizar progresso
    console.log('4. Atualizando progresso...');
    const novoProgresso = 5;
    const { error: updateError } = await supabase
      .from('challenge_participations')
      .update({
        progress: novoProgresso,
        is_completed: novoProgresso >= desafio.daily_log_target,
        updated_at: new Date().toISOString()
      })
      .eq('id', participacao.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar progresso:', updateError);
      return;
    }

    console.log('✅ Progresso atualizado para:', novoProgresso);
    
    // 5. Verificar resultado
    console.log('5. Verificando resultado...');
    const { data: participacaoFinal, error: finalError } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('id', participacao.id)
      .single();

    if (finalError) {
      console.error('❌ Erro ao verificar resultado:', finalError);
      return;
    }

    console.log('✅ Resultado final:', {
      progress: participacaoFinal.progress,
      is_completed: participacaoFinal.is_completed,
      updated_at: participacaoFinal.updated_at
    });
    
    console.log('🎉 Fluxo completo testado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testarFluxoCompleto(); 