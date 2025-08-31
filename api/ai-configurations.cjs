const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk3Mjk3NCwiZXhwIjoyMDQ4NTQ4OTc0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configurações por preset
const PRESET_CONFIGS = {
  MINIMO: {
    'openai-o3-pro': { max_tokens: 1024, temperature: 0.7 },
    'gpt-4.1': { max_tokens: 1024, temperature: 0.7 },
    'gpt-4.1-mini': { max_tokens: 1024, temperature: 0.7 },
    'gemini-1.5-flash': { max_tokens: 1024, temperature: 0.7 },
    'gemini-1.5-pro': { max_tokens: 1024, temperature: 0.7 }
  },
  MEIO: {
    'openai-o3-pro': { max_tokens: 4096, temperature: 0.8 },
    'gpt-4.1': { max_tokens: 4096, temperature: 0.8 },
    'gpt-4.1-mini': { max_tokens: 4096, temperature: 0.8 },
    'gemini-1.5-flash': { max_tokens: 4096, temperature: 0.8 },
    'gemini-1.5-pro': { max_tokens: 4096, temperature: 0.8 }
  },
  MAXIMO: {
    'openai-o3-pro': { max_tokens: 8192, temperature: 0.8 },
    'gpt-4.1': { max_tokens: 8192, temperature: 0.8 },
    'gpt-4.1-mini': { max_tokens: 8192, temperature: 0.8 },
    'gemini-1.5-flash': { max_tokens: 8192, temperature: 0.8 },
    'gemini-1.5-pro': { max_tokens: 8192, temperature: 0.8 }
  }
};

// Mapeamento de modelos para nomes de funcionalidade
const MODEL_MAPPING = {
  'openai-o3-pro': 'o3-PRO',
  'gpt-4.1': 'gpt-4.1-2025-04-14',
  'gpt-4.1-mini': 'gpt-4.1-mini',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-1.5-pro': 'gemini-1.5-pro'
};

// Função para obter configurações de IA
async function getAIConfigurations() {
  try {
    console.log('🔍 Buscando configurações de IA...');
    
    const { data, error } = await supabase
      .from('ai_configurations')
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Configurações encontradas:', data?.length || 0);
    return { success: true, data };
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    return { success: false, error: error.message };
  }
}

// Função para atualizar configurações baseada na seleção
async function updateConfigurations(selectedModel, selectedPreset) {
  try {
    console.log(`🚀 Atualizando configurações para ${selectedModel} - ${selectedPreset}...`);
    
    // Obter configurações do preset selecionado
    const presetConfig = PRESET_CONFIGS[selectedPreset];
    if (!presetConfig) {
      return { success: false, error: `Preset ${selectedPreset} não encontrado` };
    }

    const modelConfig = presetConfig[selectedModel];
    if (!modelConfig) {
      return { success: false, error: `Modelo ${selectedModel} não encontrado no preset ${selectedPreset}` };
    }

    // Configurações para todas as funcionalidades
    const configurations = [
      {
        functionality: 'chat_daily',
        service: 'openai',
        model: MODEL_MAPPING[selectedModel] || selectedModel,
        max_tokens: modelConfig.max_tokens,
        temperature: modelConfig.temperature,
        is_enabled: true,
        preset_level: selectedPreset.toLowerCase()
      },
      {
        functionality: 'weekly_report',
        service: 'openai',
        model: MODEL_MAPPING[selectedModel] || selectedModel,
        max_tokens: modelConfig.max_tokens,
        temperature: modelConfig.temperature,
        is_enabled: true,
        preset_level: selectedPreset.toLowerCase()
      },
      {
        functionality: 'monthly_report',
        service: 'openai',
        model: MODEL_MAPPING[selectedModel] || selectedModel,
        max_tokens: modelConfig.max_tokens,
        temperature: modelConfig.temperature,
        is_enabled: true,
        preset_level: selectedPreset.toLowerCase()
      },
      {
        functionality: 'medical_analysis',
        service: 'openai',
        model: MODEL_MAPPING[selectedModel] || selectedModel,
        max_tokens: modelConfig.max_tokens,
        temperature: modelConfig.temperature,
        is_enabled: true,
        preset_level: selectedPreset.toLowerCase()
      },
      {
        functionality: 'preventive_analysis',
        service: 'openai',
        model: MODEL_MAPPING[selectedModel] || selectedModel,
        max_tokens: modelConfig.max_tokens,
        temperature: modelConfig.temperature,
        is_enabled: true,
        preset_level: selectedPreset.toLowerCase()
      }
    ];

    // Primeiro, limpar configurações existentes
    const { error: deleteError } = await supabase
      .from('ai_configurations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('❌ Erro ao limpar configurações:', deleteError);
    } else {
      console.log('✅ Configurações antigas removidas');
    }

    // Inserir novas configurações
    const results = [];
    for (const config of configurations) {
      try {
        const { error } = await supabase
          .from('ai_configurations')
          .insert(config);

        if (error) {
          console.error(`❌ Erro ao inserir ${config.functionality}:`, error);
          results.push({ functionality: config.functionality, success: false, error: error.message });
        } else {
          console.log(`✅ ${config.functionality} atualizado`);
          results.push({ functionality: config.functionality, success: true });
        }
      } catch (error) {
        console.error(`💥 Erro fatal ao inserir ${config.functionality}:`, error);
        results.push({ functionality: config.functionality, success: false, error: error.message });
      }
    }

    return { 
      success: true, 
      results,
      config: {
        model: selectedModel,
        preset: selectedPreset,
        max_tokens: modelConfig.max_tokens,
        temperature: modelConfig.temperature
      }
    };
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    return { success: false, error: error.message };
  }
}

// Função para atualizar para configuração máxima (mantida para compatibilidade)
async function updateToMaximo() {
  return await updateConfigurations('openai-o3-pro', 'MAXIMO');
}

// Função para testar configurações
async function testAIConfigurations() {
  try {
    console.log('🧪 Testando configurações de IA...');
    
    const { data, error } = await supabase
      .from('ai_configurations')
      .select('functionality, model, max_tokens, temperature, preset_level');

    if (error) {
      return { success: false, error: error.message };
    }

    console.log('📊 Configurações atuais:');
    data.forEach(config => {
      console.log(`- ${config.functionality}: ${config.model} (${config.max_tokens} tokens, temp ${config.temperature}, preset ${config.preset_level})`);
    });

    return { success: true, data };
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    return { success: false, error: error.message };
  }
}

// Função para aplicar configuração baseada na seleção da interface
async function applyUserSelection(selectedModel, selectedPreset) {
  try {
    console.log(`🎯 Aplicando seleção do usuário: ${selectedModel} - ${selectedPreset}`);
    
    const result = await updateConfigurations(selectedModel, selectedPreset);
    
    if (result.success) {
      console.log('✅ Configuração aplicada com sucesso!');
      console.log(`📊 Modelo: ${result.config.model}`);
      console.log(`📊 Preset: ${result.config.preset}`);
      console.log(`📊 Tokens: ${result.config.max_tokens}`);
      console.log(`📊 Temperature: ${result.config.temperature}`);
    } else {
      console.error('❌ Erro ao aplicar configuração:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    return { success: false, error: error.message };
  }
}

// Exportar funções
module.exports = {
  getAIConfigurations,
  updateToMaximo,
  testAIConfigurations,
  updateConfigurations,
  applyUserSelection,
  PRESET_CONFIGS,
  MODEL_MAPPING
};

// Se executado diretamente
if (require.main === module) {
  async function main() {
    console.log('🔧 API de Configurações de IA - Versão Flexível');
    console.log('='.repeat(60));
    
    // Exemplo de uso com seleção do usuário
    const selectedModel = 'openai-o3-pro'; // Modelo selecionado
    const selectedPreset = 'MAXIMO';       // Preset selecionado
    
    console.log(`\n🎯 Aplicando seleção: ${selectedModel} - ${selectedPreset}`);
    const result = await applyUserSelection(selectedModel, selectedPreset);
    console.log('Resultado:', result);
    
    // Verificar configurações finais
    console.log('\n📊 Verificando configurações finais...');
    const finalResult = await testAIConfigurations();
    console.log('Resultado:', finalResult);
  }
  
  main().catch(console.error);
} 