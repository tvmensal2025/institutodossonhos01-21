import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verificarTabelasExistentes() {
  console.log('🔍 VERIFICANDO TABELAS EXISTENTES NO BANCO');
  console.log('============================================');

  try {
    // Lista de tabelas para verificar
    const tabelasParaVerificar = [
      'alimentos',
      'alimentos_completos',
      'valores_nutricionais',
      'valores_nutricionais_completos',
      'substituicoes_inteligentes',
      'combinacoes_terapeuticas',
      'doencas_condicoes',
      'alimentos_doencas',
      'principios_ativos',
      'receitas_terapeuticas',
      'protocolos_nutricionais',
      'sintomas_alimentos',
      'estados_emocionais_alimentos',
      'atividade_fisica_alimentos',
      'idade_alimentos',
      'genero_alimentos',
      'objetivos_fitness_alimentos',
      'alimentos_funcionais',
      'superalimentos',
      'alimentos_fermentados',
      'alimentos_organicos',
      'alimentos_locais',
      'alimentos_tradicionais',
      'alimentos_modernos',
      'alimentos_sustentaveis',
      'detox_alimentos',
      'jejum_alimentos',
      'combinacoes_visuais_imagem',
      'profiles',
      'users',
      'challenges',
      'challenge_participations',
      'goals',
      'goal_updates',
      'daily_missions',
      'ai_configurations',
      'sofia_conversations',
      'sofia_food_analysis'
    ];

    console.log('\n📊 VERIFICANDO CADA TABELA:');
    console.log('============================');

    const tabelasExistentes = [];
    const tabelasInexistentes = [];

    for (const tabela of tabelasParaVerificar) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`❌ ${tabela}: NÃO EXISTE`);
            tabelasInexistentes.push(tabela);
          } else {
            console.log(`⚠️ ${tabela}: ERRO - ${error.message}`);
          }
        } else {
          console.log(`✅ ${tabela}: EXISTE (${data?.length || 0} registros)`);
          tabelasExistentes.push(tabela);
        }
      } catch (err) {
        console.log(`❌ ${tabela}: ERRO - ${err.message}`);
        tabelasInexistentes.push(tabela);
      }
    }

    console.log('\n📊 RESUMO DAS TABELAS:');
    console.log('=======================');
    console.log(`✅ TABELAS EXISTENTES (${tabelasExistentes.length}):`);
    tabelasExistentes.forEach(tabela => {
      console.log(`   - ${tabela}`);
    });

    console.log(`\n❌ TABELAS INEXISTENTES (${tabelasInexistentes.length}):`);
    tabelasInexistentes.forEach(tabela => {
      console.log(`   - ${tabela}`);
    });

    console.log('\n🎯 CONCLUSÃO:');
    if (tabelasInexistentes.length > 0) {
      console.log('❌ A base de conhecimento robusta NÃO está aplicada!');
      console.log('💡 Precisamos aplicar o SQL da base robusta.');
    } else {
      console.log('✅ A base de conhecimento robusta está aplicada!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a verificação
verificarTabelasExistentes();





