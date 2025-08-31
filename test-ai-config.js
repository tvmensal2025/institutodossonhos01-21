import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAIConfigurations() {
  console.log('🔍 Testando configurações de IA...\n');

  try {
    // 1. Verificar se a tabela existe
    console.log('1. Verificando se a tabela ai_configurations existe...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('ai_configurations')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
      return;
    }
    console.log('✅ Tabela ai_configurations existe\n');

    // 2. Carregar todas as configurações
    console.log('2. Carregando configurações...');
    const { data: configs, error: configError } = await supabase
      .from('ai_configurations')
      .select('*')
      .order('functionality');

    if (configError) {
      console.error('❌ Erro ao carregar configurações:', configError);
      return;
    }

    console.log(`✅ ${configs.length} configurações encontradas:`);
    configs.forEach(config => {
      console.log(`   - ${config.functionality}: ${config.is_enabled ? '✅ Ativo' : '❌ Inativo'} (${config.personality}, ${config.level})`);
    });
    console.log('');

    // 3. Testar atualização de uma configuração
    console.log('3. Testando atualização de configuração...');
    const testConfig = configs[0];
    if (testConfig) {
      const newEnabled = !testConfig.is_enabled;
      console.log(`   Alterando ${testConfig.functionality} de ${testConfig.is_enabled} para ${newEnabled}...`);

      const { error: updateError } = await supabase
        .from('ai_configurations')
        .update({ is_enabled: newEnabled })
        .eq('functionality', testConfig.functionality);

      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError);
      } else {
        console.log('✅ Configuração atualizada com sucesso!');
      }
    }

    // 4. Verificar novamente após atualização
    console.log('\n4. Verificando configuração após atualização...');
    const { data: updatedConfig, error: checkError } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('functionality', testConfig.functionality)
      .single();

    if (checkError) {
      console.error('❌ Erro ao verificar atualização:', checkError);
    } else {
      console.log(`✅ ${updatedConfig.functionality}: ${updatedConfig.is_enabled ? '✅ Ativo' : '❌ Inativo'}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testAIConfigurations(); 