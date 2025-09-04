#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const functionsDir = 'supabase/functions';
const problems = [];

// Padrões problemáticos para detectar
const patterns = {
  invalidModels: /model.*['"](gpt-5|o4-mini|gpt-4\.1|o3-2025)/g,
  invalidStatus: /status.*['"](processing|completed|error)['"][^}]*medical_documents/g,
  deprecatedImports: /import.*(@supabase\/auth-helpers-react|@chakra-ui|react-icons)/g,
  aiResponseErrors: /aiResponse.*not defined/g,
  globalGc: /global\.gc\(\)/g,
  fileReader: /new FileReader\(\)/g,
  timeoutIssues: /timeout.*callOpenAI/g,
  corsIssues: /Access-Control-Allow/g
};

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    const fileProblems = {
      file: relativePath,
      issues: []
    };
    
    // Verificar cada padrão
    for (const [issue, pattern] of Object.entries(patterns)) {
      const matches = content.match(pattern);
      if (matches) {
        fileProblems.issues.push({
          type: issue,
          count: matches.length,
          samples: matches.slice(0, 3) // Primeiras 3 ocorrências
        });
      }
    }
    
    // Verificar imports específicos
    if (content.includes('@supabase/auth-helpers-react')) {
      fileProblems.issues.push({
        type: 'deprecatedSupabaseImport',
        count: 1,
        samples: ['@supabase/auth-helpers-react']
      });
    }
    
    // Verificar modelos específicos problemáticos
    const modelMatches = content.match(/model.*['"]([^'"]+)['"]/g);
    if (modelMatches) {
      const badModels = modelMatches.filter(m => 
        m.includes('gpt-5') || 
        m.includes('o4-mini') || 
        m.includes('gpt-4.1') || 
        m.includes('o3-2025')
      );
      if (badModels.length > 0) {
        fileProblems.issues.push({
          type: 'invalidAIModels',
          count: badModels.length,
          samples: badModels
        });
      }
    }
    
    // Só adicionar se houver problemas
    if (fileProblems.issues.length > 0) {
      problems.push(fileProblems);
    }
    
  } catch (error) {
    console.error(`Erro ao analisar ${filePath}:`, error.message);
  }
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (item.endsWith('.ts') || item.endsWith('.js')) {
      analyzeFile(fullPath);
    }
  }
}

// Executar análise
console.log('🔍 Analisando todas as edge functions...');
scanDirectory(functionsDir);

// Gerar relatório
console.log('\n📊 RELATÓRIO DE PROBLEMAS NAS EDGE FUNCTIONS:\n');
console.log(`Total de functions com problemas: ${problems.length}/76\n`);

// Agrupar por tipo de problema
const issueTypes = {};
problems.forEach(file => {
  file.issues.forEach(issue => {
    if (!issueTypes[issue.type]) {
      issueTypes[issue.type] = [];
    }
    issueTypes[issue.type].push({
      file: file.file,
      count: issue.count,
      samples: issue.samples
    });
  });
});

// Mostrar problemas por categoria
for (const [issueType, files] of Object.entries(issueTypes)) {
  console.log(`\n🔴 ${issueType.toUpperCase()}:`);
  console.log(`   Arquivos afetados: ${files.length}`);
  
  files.forEach(file => {
    console.log(`   📁 ${file.file} (${file.count} ocorrências)`);
    if (file.samples.length > 0) {
      console.log(`      Exemplos: ${file.samples.join(', ')}`);
    }
  });
}

// Relatório resumido
console.log('\n📋 RESUMO DOS PROBLEMAS:');
Object.entries(issueTypes).forEach(([type, files]) => {
  const totalOccurrences = files.reduce((sum, f) => sum + f.count, 0);
  console.log(`- ${type}: ${files.length} arquivos, ${totalOccurrences} ocorrências`);
});

console.log('\n✅ Análise completa finalizada!');
