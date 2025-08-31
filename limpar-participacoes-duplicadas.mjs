import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function limparParticipacoesDuplicadas() {
  console.log('🧹 Iniciando limpeza de participações duplicadas...\n');

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

    // 2. Identificar duplicatas
    const duplicatas = new Map();
    const participacoesUnicas = [];

    participations.forEach(participation => {
      const key = `${participation.user_id}-${participation.challenge_id}`;
      
      if (duplicatas.has(key)) {
        console.log(`⚠️ Duplicata encontrada: ${key}`);
        duplicatas.get(key).push(participation);
      } else {
        duplicatas.set(key, [participation]);
        participacoesUnicas.push(participation);
      }
    });

    // 3. Mostrar estatísticas
    console.log('2. Estatísticas de duplicatas:');
    let totalDuplicatas = 0;
    duplicatas.forEach((participacoes, key) => {
      if (participacoes.length > 1) {
        console.log(`   ${key}: ${participacoes.length} participações`);
        totalDuplicatas += participacoes.length - 1;
      }
    });

    if (totalDuplicatas === 0) {
      console.log('✅ Nenhuma duplicata encontrada!');
      return;
    }

    console.log(`\n📊 Total de duplicatas a remover: ${totalDuplicatas}\n`);

    // 4. Remover duplicatas (manter apenas a mais recente)
    console.log('3. Removendo duplicatas...');
    let removidas = 0;

    for (const [key, participacoes] of duplicatas) {
      if (participacoes.length > 1) {
        // Ordenar por data de criação (mais recente primeiro)
        participacoes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Manter apenas a primeira (mais recente) e remover as outras
        const paraRemover = participacoes.slice(1);
        
        for (const participacao of paraRemover) {
          const { error } = await supabase
            .from('challenge_participations')
            .delete()
            .eq('id', participacao.id);

          if (error) {
            console.error(`❌ Erro ao remover participação ${participacao.id}:`, error);
          } else {
            console.log(`✅ Removida participação ${participacao.id}`);
            removidas++;
          }
        }
      }
    }

    console.log(`\n✅ Limpeza concluída! ${removidas} duplicatas removidas.`);

    // 5. Verificar resultado final
    console.log('\n4. Verificando resultado final...');
    const { data: participationsFinais, error: finalError } = await supabase
      .from('challenge_participations')
      .select('*');

    if (finalError) {
      console.error('❌ Erro ao verificar resultado:', finalError);
    } else {
      console.log(`✅ Total final de participações: ${participationsFinais.length}`);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar a limpeza
limparParticipacoesDuplicadas(); 