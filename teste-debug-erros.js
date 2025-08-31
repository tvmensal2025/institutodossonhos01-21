// Teste de diagnóstico rápido
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando diagnóstico de erros...');

// 1. Verificar se arquivos principais existem
const arquivosPrincipais = [
  'src/App.tsx',
  'src/main.tsx',
  'src/pages/LandingPage.tsx',
  'src/pages/CompleteDashboardPage.tsx',
  'src/components/Layout.tsx'
];

console.log('\n📁 Verificando arquivos principais:');
arquivosPrincipais.forEach(arquivo => {
  if (fs.existsSync(arquivo)) {
    console.log(`✅ ${arquivo} - OK`);
  } else {
    console.log(`❌ ${arquivo} - FALTANDO`);
  }
});

// 2. Verificar imports problemáticos no App.tsx
console.log('\n🔍 Verificando App.tsx:');
try {
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  
  // Verificar imports comentados
  const linhasComentadas = appContent.split('\n').filter(linha => 
    linha.trim().startsWith('//') && linha.includes('import')
  );
  
  console.log(`📝 Imports comentados: ${linhasComentadas.length}`);
  
  // Verificar rotas ativas
  const rotasAtivas = appContent.split('\n').filter(linha => 
    linha.includes('<Route') && !linha.trim().startsWith('//')
  );
  
  console.log(`🛣️ Rotas ativas: ${rotasAtivas.length}`);
  
} catch (error) {
  console.error('❌ Erro ao ler App.tsx:', error.message);
}

console.log('\n🎉 Diagnóstico concluído!');