// Teste detalhado do Sistema de Missão do Dia
import http from 'http';

function testarAplicacao() {
  console.log('🚀 Testando aplicação detalhadamente...');
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Analisando conteúdo da página...');
      
      // Verificar elementos básicos
      const verificacoes = {
        'React App': data.includes('React'),
        'Vite': data.includes('vite'),
        'Missão do Dia': data.includes('Missão do Dia'),
        'RITUAL DA MANHÃ': data.includes('RITUAL DA MANHÃ'),
        'HÁBITOS DO DIA': data.includes('HÁBITOS DO DIA'),
        'MENTE & EMOÇÕES': data.includes('MENTE & EMOÇÕES'),
        'Login': data.includes('login') || data.includes('Login'),
        'Dashboard': data.includes('Dashboard'),
        'Sidebar': data.includes('sidebar') || data.includes('Sidebar')
      };
      
      console.log('📊 Verificações:');
      Object.entries(verificacoes).forEach(([elemento, encontrado]) => {
        console.log(`${encontrado ? '✅' : '❌'} ${elemento}`);
      });
      
      // Verificar se há erros JavaScript
      if (data.includes('error') || data.includes('Error')) {
        console.log('⚠️ Possíveis erros encontrados no HTML');
      }
      
      // Verificar se há elementos de autenticação
      if (data.includes('auth') || data.includes('Auth')) {
        console.log('🔐 Elementos de autenticação encontrados');
      }
      
      console.log('🎉 Análise concluída!');
      console.log('\n💡 Dica: O sistema de Missão do Dia só aparece para usuários logados.');
      console.log('   Faça login primeiro para ver o sistema completo.');
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Erro: ${e.message}`);
  });

  req.end();
}

testarAplicacao(); 