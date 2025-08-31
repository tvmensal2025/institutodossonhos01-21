import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertAIConfigurations() {
  console.log('🚀 Inserindo configurações de IA...\n');

  const configurations = [
    {
      functionality: 'medical_analysis',
      service: 'openai',
      model: 'gpt-4',
      max_tokens: 4096,
      temperature: 0.8,
      is_enabled: false,
      personality: 'drvital'
    },
    {
      functionality: 'weekly_report',
      service: 'openai',
      model: 'gpt-4',
      max_tokens: 4096,
      temperature: 0.8,
      is_enabled: false,
      personality: 'sofia',
      level: 'meio',
      priority: 1
    },
    {
      functionality: 'monthly_report',
      service: 'openai',
      model: 'gpt-4',
      max_tokens: 4096,
      temperature: 0.8,
      is_enabled: false,
      personality: 'drvital',
      level: 'meio',
      priority: 1
    },
    {
      functionality: 'daily_chat',
      service: 'openai',
      model: 'gpt-4',
      max_tokens: 4096,
      temperature: 0.8,
      is_enabled: false,
      personality: 'sofia',
      level: 'meio',
      priority: 1
    },
    {
      functionality: 'preventive_analysis',
      service: 'openai',
      model: 'gpt-4',
      max_tokens: 4096,
      temperature: 0.8,
      is_enabled: false,
      personality: 'drvital',
      level: 'meio',
      priority: 1
    },
    {
      functionality: 'food_analysis',
      service: 'openai',
      model: 'gpt-4',
      max_tokens: 4096,
      temperature: 0.8,
      is_enabled: false,
      personality: 'drvital',
      level: 'meio',
      priority: 1
    },
    {
      functionality: 'daily_missions',
      service: 'openai',
      model: 'gpt-4',
      max_tokens: 4096,
      temperature: 0.8,
      is_enabled: false,
      personality: 'sofia',
      level: 'meio',
      priority: 1
    },
    {
      functionality: 'whatsapp_reports',
      service: 'openai',
      model: 'gpt-4',
      max_tokens: 4096,
      temperature: 0.8,
      is_enabled: false,
      personality: 'sofia',
      level: 'meio',
      priority: 1
    },
    {
      functionality: 'email_reports',
      service: 'openai',
      model: 'gpt-4',
      max_tokens: 4096,
      temperature: 0.8,
      is_enabled: false,
      personality: 'drvital',
      level: 'meio',
      priority: 1
    }
  ];

  try {
    console.log('Inserindo configurações...');
    
    for (const config of configurations) {
      console.log(`   - ${config.functionality}...`);
      
      const { error } = await supabase
        .from('ai_configurations')
        .upsert(config, {
          onConflict: 'functionality'
        });

      if (error) {
        console.error(`❌ Erro ao inserir ${config.functionality}:`, error);
      } else {
        console.log(`✅ ${config.functionality} inserido com sucesso`);
      }
    }

    console.log('\n🎉 Todas as configurações foram inseridas!');
    
    // Verificar se foram inseridas
    const { data: checkData, error: checkError } = await supabase
      .from('ai_configurations')
      .select('*')
      .order('functionality');

    if (checkError) {
      console.error('❌ Erro ao verificar dados:', checkError);
    } else {
      console.log(`\n📊 Total de configurações: ${checkData.length}`);
      checkData.forEach(config => {
        console.log(`   - ${config.functionality}: ${config.is_enabled ? '✅ Ativo' : '❌ Inativo'} (${config.personality})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar inserção
insertAIConfigurations(); 