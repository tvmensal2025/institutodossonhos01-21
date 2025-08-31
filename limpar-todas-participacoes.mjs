import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function limparTodasParticipacoes() {
  console.log('🧹 Iniciando limpeza completa de todas as participações...\n');

  try {
    // 1. Verificar participações existentes
    console.log('1. Verificando participações existentes...');
    const { data: participations, error: participationsError } = await supabase
      .from('challenge_participations')
      .select('*')
      .order('created_at', { ascending: true });

    if (participationsError) {
      console.error('❌ Erro ao buscar participações:', participationsError);
      return;
    }

    console.log(`✅ Encontradas ${participations.length} participações\n`);

    if (participations.length === 0) {
      console.log('✅ Nenhuma participação encontrada para limpar!');
      return;
    }

    // 2. Mostrar detalhes das participações
    console.log('2. Detalhes das participações:');
    participations.forEach((participation, index) => {
      console.log(`   ${index + 1}. ID: ${participation.id}`);
      console.log(`      Usuário: ${participation.user_id}`);
      console.log(`      Desafio: ${participation.challenge_id}`);
      console.log(`      Progresso: ${participation.progress}%`);
      console.log(`      Criado em: ${participation.created_at}`);
      console.log('');
    });

    // 3. Confirmar limpeza
    console.log('3. Iniciando limpeza...');
    let removidas = 0;

    for (const participation of participations) {
      const { error } = await supabase
        .from('challenge_participations')
        .delete()
        .eq('id', participation.id);

      if (error) {
        console.error(`❌ Erro ao remover participação ${participation.id}:`, error);
      } else {
        console.log(`✅ Removida participação ${participation.id}`);
        removidas++;
      }
    }

    console.log(`\n✅ Limpeza concluída! ${removidas} participações removidas.`);

    // 4. Verificar resultado final
    console.log('\n4. Verificando resultado final...');
    const { data: participationsFinais, error: finalError } = await supabase
      .from('challenge_participations')
      .select('*');

    if (finalError) {
      console.error('❌ Erro ao verificar resultado:', finalError);
    } else {
      console.log(`✅ Total final de participações: ${participationsFinais.length}`);
      
      if (participationsFinais.length === 0) {
        console.log('🎉 Tabela completamente limpa!');
      } else {
        console.log('⚠️ Ainda há participações na tabela');
      }
    }

    // 5. Testar inserção de nova participação
    console.log('\n5. Testando inserção de nova participação...');
    const userId = 'c6a29ad1-65b4-4fcb-bfd1-a61b48cb319e';
    const challengeId = '8e5196df-d576-450e-9f8e-78a6be6b83c9';

    const { data: novaParticipacao, error: insertError } = await supabase
      .from('challenge_participations')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        target_value: 30,
        progress: 0,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir nova participação:', insertError);
    } else {
      console.log('✅ Nova participação criada com sucesso!');
      console.log('📊 ID da nova participação:', novaParticipacao.id);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar a limpeza
limparTodasParticipacoes(); 