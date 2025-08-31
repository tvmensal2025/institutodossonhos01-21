#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Verificando configuração da Lovable...\n');

// Verificar arquivos necessários
const requiredFiles = [
  'lovable.json',
  'lovable.config.js',
  'package.json',
  'vite.config.ts'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - FALTANDO`);
    allFilesExist = false;
  }
});

// Verificar configuração do package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  console.log('\n📦 Scripts disponíveis:');
  Object.keys(scripts).forEach(script => {
    console.log(`  - ${script}: ${scripts[script]}`);
  });
  
  // Verificar se lovable-tagger está instalado
  const devDependencies = packageJson.devDependencies || {};
  if (devDependencies['lovable-tagger']) {
    console.log('\n✅ lovable-tagger instalado');
  } else {
    console.log('\n❌ lovable-tagger não encontrado');
  }
  
} catch (error) {
  console.log('\n❌ Erro ao ler package.json:', error.message);
}

// Verificar configuração do vite.config.ts
try {
  const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
  if (viteConfig.includes('lovable-tagger')) {
    console.log('\n✅ lovable-tagger configurado no Vite');
  } else {
    console.log('\n❌ lovable-tagger não configurado no Vite');
  }
} catch (error) {
  console.log('\n❌ Erro ao ler vite.config.ts:', error.message);
}

// Verificar .gitignore
try {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (gitignore.includes('.lovable') || gitignore.includes('lovable')) {
    console.log('\n✅ Configurações da Lovable no .gitignore');
  } else {
    console.log('\n⚠️  Configurações da Lovable não encontradas no .gitignore');
  }
} catch (error) {
  console.log('\n❌ Erro ao ler .gitignore:', error.message);
}

console.log('\n🎯 Status final:');
if (allFilesExist) {
  console.log('✅ Projeto configurado para deploy na Lovable!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Conecte o repositório na Lovable');
  console.log('2. Configure as variáveis de ambiente');
  console.log('3. Faça o primeiro deploy');
} else {
  console.log('❌ Alguns arquivos estão faltando. Verifique a configuração.');
}

console.log('\n📖 Para mais informações, consulte LOVABLE_DEPLOY.md'); 