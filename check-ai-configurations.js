import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com service role key
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk3Mjk3NCwiZXhwIjoyMDQ4NTQ4OTc0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConfigurations() {
  try {
    console.log('🔍 Verificando configurações de IA...');
    
    const { data, error } = await supabase
      .from('ai_configurations')
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      return;
    }

    console.log('📊 Configurações encontradas:');
    data.forEach(config => {
      console.log(`- ${config.functionality}: ${config.model} (${config.max_tokens} tokens, temp ${config.temperature})`);
    });

    // Verificar se weekly_report está usando o modelo correto
    const weeklyReport = data.find(c => c.functionality === 'weekly_report');
    if (weeklyReport) {
      console.log('\n📋 Configuração atual do weekly_report:');
      console.log(`- Modelo: ${weeklyReport.model}`);
      console.log(`- Tokens: ${weeklyReport.max_tokens}`);
      console.log(`- Temperature: ${weeklyReport.temperature}`);
      console.log(`- Preset: ${weeklyReport.preset_level}`);
    }

    // Verificar se precisa atualizar para o3-PRO
    if (weeklyReport && weeklyReport.model !== 'o3-PRO') {
      console.log('\n🔄 Atualizando weekly_report para o3-PRO...');
      
      const { error: updateError } = await supabase
        .from('ai_configurations')
        .update({
          model: 'o3-PRO',
          max_tokens: 8192,
          temperature: 0.8,
          preset_level: 'maximo'
        })
        .eq('functionality', 'weekly_report');

      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError);
      } else {
        console.log('✅ Weekly report atualizado para o3-PRO!');
      }
    }

  } catch (error) {
    console.error('💥 Erro fatal:', error);
  }
}

async function updateAllToMaximo() {
  try {
    console.log('🚀 Atualizando todas as configurações para máximo...');
    
    const maximoConfigs = [
      {
        functionality: 'chat_daily',
        model: 'gpt-4o',
        max_tokens: 4000,
        temperature: 0.8,
        preset_level: 'maximo'
      },
      {
        functionality: 'weekly_report',
        model: 'o3-PRO',
        max_tokens: 8192,
        temperature: 0.8,
        preset_level: 'maximo'
      },
      {
        functionality: 'monthly_report',
        model: 'o3-PRO',
        max_tokens: 8192,
        temperature: 0.7,
        preset_level: 'maximo'
      },
      {
        functionality: 'medical_analysis',
        model: 'o3-PRO',
        max_tokens: 8192,
        temperature: 0.3,
        preset_level: 'maximo'
      },
      {
        functionality: 'preventive_analysis',
        model: 'o3-PRO',
        max_tokens: 8192,
        temperature: 0.5,
        preset_level: 'maximo'
      }
    ];

    for (const config of maximoConfigs) {
      console.log(`🔄 Atualizando ${config.functionality}...`);
      
      const { error } = await supabase
        .from('ai_configurations')
        .update({
          model: config.model,
          max_tokens: config.max_tokens,
          temperature: config.temperature,
          preset_level: config.preset_level
        })
        .eq('functionality', config.functionality);

      if (error) {
        console.error(`❌ Erro ao atualizar ${config.functionality}:`, error);
      } else {
        console.log(`✅ ${config.functionality} atualizado!`);
      }
    }

    console.log('🎉 Todas as configurações atualizadas para máximo!');

  } catch (error) {
    console.error('💥 Erro fatal:', error);
  }
}

async function main() {
  await checkConfigurations();
  console.log('\n' + '='.repeat(50) + '\n');
  await updateAllToMaximo();
}

main().catch(console.error); 