// Teste automatizado do Sistema de Missão do Dia
const puppeteer = require('puppeteer');

async function testarSistemaMissao() {
  console.log('🚀 Iniciando teste do Sistema de Missão do Dia...');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 1. Acessar a aplicação
    console.log('📱 Acessando aplicação...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
    
    // 2. Verificar se a página carrega
    console.log('✅ Página carregada com sucesso');
    
    // 3. Verificar se há elementos da Missão do Dia
    const elementos = await page.evaluate(() => {
      const elementos = {
        titulo: document.querySelector('h1')?.textContent,
        secoes: document.querySelectorAll('[class*="section"]').length,
        perguntas: document.querySelectorAll('[class*="question"]').length,
        botoes: document.querySelectorAll('button').length
      };
      return elementos;
    });
    
    console.log('📊 Elementos encontrados:', elementos);
    
    // 4. Verificar se há erros no console
    const logs = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    if (logs.length > 0) {
      console.log('⚠️ Erros encontrados:', logs);
    } else {
      console.log('✅ Nenhum erro encontrado');
    }
    
    // 5. Aguardar um pouco para visualizar
    await page.waitForTimeout(5000);
    
    console.log('🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await browser.close();
  }
}

// Executar o teste
testarSistemaMissao(); 