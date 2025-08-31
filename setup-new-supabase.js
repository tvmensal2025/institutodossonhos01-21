#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurador de Nova Conta Supabase');
console.log('=====================================\n');

// Função para ler input do usuário
function askQuestion(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Função para validar URL do Supabase
function validateSupabaseUrl(url) {
  return url.includes('supabase.co') && url.startsWith('https://');
}

// Função para validar chave anônima
function validateAnonKey(key) {
  return key.startsWith('eyJ') && key.length > 100;
}

async function setupNewSupabase() {
  try {
    console.log('📋 Para configurar uma nova conta do Supabase, você precisa:');
    console.log('1. Criar um novo projeto no Supabase');
    console.log('2. Obter a URL e chave anônima do projeto');
    console.log('3. Configurar as variáveis de ambiente\n');

    const supabaseUrl = await askQuestion('🔗 Digite a URL da nova conta Supabase (ex: https://abc123.supabase.co): ');
    
    if (!validateSupabaseUrl(supabaseUrl)) {
      console.log('❌ URL inválida! Deve ser uma URL válida do Supabase.');
      return;
    }

    const anonKey = await askQuestion('🔑 Digite a chave anônima da nova conta: ');
    
    if (!validateAnonKey(anonKey)) {
      console.log('❌ Chave anônima inválida! Deve começar com "eyJ" e ter mais de 100 caracteres.');
      return;
    }

    // Criar arquivo .env se não existir
    const envPath = path.join(__dirname, '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Adicionar ou atualizar as variáveis
    const newEnvVars = `# Configuração Supabase - Conta Principal (Atual)
VITE_SUPABASE_URL_MAIN=https://hlrkoyywjpckdotimtik.supabase.co
VITE_SUPABASE_ANON_KEY_MAIN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI

# Configuração Supabase - Conta Nova (Limpa)
VITE_SUPABASE_URL_NEW=${supabaseUrl}
VITE_SUPABASE_ANON_KEY_NEW=${anonKey}

# Conta ativa (MAIN ou NEW)
VITE_ACTIVE_SUPABASE=MAIN
`;

    fs.writeFileSync(envPath, newEnvVars);
    
    console.log('\n✅ Configuração salva com sucesso!');
    console.log('\n📁 Arquivo .env criado/atualizado com as configurações.');
    console.log('\n🔄 Para alternar para a nova conta, use:');
    console.log('   - VITE_ACTIVE_SUPABASE=NEW no arquivo .env');
    console.log('   - Ou use o componente SupabaseAccountSwitcher na interface');
    
    console.log('\n📝 Próximos passos:');
    console.log('1. Reinicie o servidor de desenvolvimento');
    console.log('2. A nova conta estará disponível para uso');
    console.log('3. Use o componente SupabaseAccountSwitcher para alternar entre contas');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupNewSupabase();
}

module.exports = { setupNewSupabase }; 