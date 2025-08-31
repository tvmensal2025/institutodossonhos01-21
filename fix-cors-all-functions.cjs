const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const correctCorsHeaders = `const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type, Range',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};`;

const oldCorsPatterns = [
  /const corsHeaders = \{[^}]*'Access-Control-Allow-Origin': '\*'[^}]*\};/gs,
  /const corsHeaders = \{[^}]*'Access-Control-Allow-Headers': '[^}]*\};/gs,
  /const corsHeaders = \{[^}]*'Access-Control-Allow-Methods': '[^}]*\};/gs
];

function fixCorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Verificar se já tem os headers corretos
    if (content.includes("'Access-Control-Allow-Credentials': 'true'") && 
        content.includes("'Access-Control-Expose-Headers': 'Content-Length, Content-Range'")) {
      console.log(`✅ Já corrigido: ${filePath}`);
      return false;
    }
    
    for (const pattern of oldCorsPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, correctCorsHeaders);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️ Não encontrado padrão CORS em: ${filePath}`);
    }
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function fixAllFunctions() {
  const functionsDir = path.join(__dirname, 'functions');
  let totalFixed = 0;
  
  if (!fs.existsSync(functionsDir)) {
    console.error('❌ Diretório de funções não encontrado:', functionsDir);
    return;
  }
  
  const functions = fs.readdirSync(functionsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`🔍 Encontradas ${functions.length} funções para verificar...`);
  
  for (const funcName of functions) {
    const indexPath = path.join(functionsDir, funcName, 'index.ts');
    if (fs.existsSync(indexPath)) {
      if (fixCorsInFile(indexPath)) {
        totalFixed++;
      }
    }
  }
  
  console.log(`\n🎉 Processo concluído! ${totalFixed} funções foram corrigidas.`);
  
  if (totalFixed > 0) {
    console.log('\n📋 Para aplicar as correções, execute:');
    console.log('npx supabase functions deploy --project-ref hlrkoyywjpckdotimtik');
  }
}

fixAllFunctions();
