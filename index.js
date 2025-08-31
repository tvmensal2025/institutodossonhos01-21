const OpenAI = require('openai');

// Configuração da API do OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sua-chave-api-aqui'
});

async function main() {
  try {
    console.log('🚀 Iniciando aplicação...');
    
    // Verificar se a chave da API está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  Aviso: OPENAI_API_KEY não está configurada.');
      console.log('Para usar a API do OpenAI, configure a variável de ambiente OPENAI_API_KEY');
      console.log('Exemplo: export OPENAI_API_KEY="sua-chave-api"');
      return;
    }

    console.log('✅ Aplicação iniciada com sucesso!');
    console.log('📦 Dependências instaladas:');
    console.log('   - OpenAI: ^5.10.1');
    
  } catch (error) {
    console.error('❌ Erro ao executar:', error.message);
  }
}

// Executar a função principal
main(); 