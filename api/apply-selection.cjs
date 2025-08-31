const { applyUserSelection, testAIConfigurations } = require('./ai-configurations.cjs');

// Função para aplicar seleção do usuário
async function applySelectionFromFrontend(selectedModel, selectedPreset) {
  try {
    console.log('🎯 Aplicando seleção do frontend...');
    console.log(`📊 Modelo: ${selectedModel}`);
    console.log(`📊 Preset: ${selectedPreset}`);
    
    // Validar parâmetros
    if (!selectedModel || !selectedPreset) {
      return {
        success: false,
        error: 'Modelo e preset são obrigatórios'
      };
    }

    // Aplicar configuração
    const result = await applyUserSelection(selectedModel, selectedPreset);
    
    if (result.success) {
      console.log('✅ Configuração aplicada com sucesso!');
      
      // Verificar configurações finais
      const testResult = await testAIConfigurations();
      
      return {
        success: true,
        message: 'Configuração aplicada com sucesso!',
        config: result.config,
        currentConfigs: testResult.data
      };
    } else {
      console.error('❌ Erro ao aplicar configuração:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para testar com diferentes seleções
async function testDifferentSelections() {
  console.log('🧪 Testando diferentes seleções...');
  
  const testCases = [
    { model: 'openai-o3-pro', preset: 'MINIMO' },
    { model: 'gpt-4.1', preset: 'MEIO' },
    { model: 'gemini-1.5-pro', preset: 'MAXIMO' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🎯 Testando: ${testCase.model} - ${testCase.preset}`);
    const result = await applySelectionFromFrontend(testCase.model, testCase.preset);
    console.log('Resultado:', result.success ? '✅ Sucesso' : '❌ Erro');
  }
}

// Exportar funções
module.exports = {
  applySelectionFromFrontend,
  testDifferentSelections
};

// Se executado diretamente
if (require.main === module) {
  async function main() {
    console.log('🎯 API de Aplicação de Seleção');
    console.log('='.repeat(50));
    
    // Exemplo de uso
    const selectedModel = 'openai-o3-pro';
    const selectedPreset = 'MAXIMO';
    
    console.log(`\n🎯 Aplicando seleção: ${selectedModel} - ${selectedPreset}`);
    const result = await applySelectionFromFrontend(selectedModel, selectedPreset);
    console.log('Resultado:', result);
    
    // Testar diferentes seleções
    console.log('\n🧪 Testando diferentes seleções...');
    await testDifferentSelections();
  }
  
  main().catch(console.error);
} 