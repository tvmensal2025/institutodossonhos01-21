// Script para testar se a variável de ambiente está sendo carregada no frontend
import { createServer } from 'vite';
import { config } from 'dotenv';

// Carregar variáveis do .env
config();

async function testarVariavelFrontend() {
  try {
    console.log('🔍 Testando variável de ambiente no frontend...\n');

    // Verificar se a variável está disponível
    const apiKey = process.env.VITE_GOOGLE_TTS_API_KEY;
    
    console.log('🔑 API Key no process.env:', apiKey ? 'ENCONTRADA' : 'NÃO ENCONTRADA');
    console.log('🔑 Primeiros 10 chars:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');

    if (!apiKey) {
      console.log('❌ Variável VITE_GOOGLE_TTS_API_KEY não encontrada!');
      console.log('📝 Verifique se o arquivo .env existe e contém a variável');
      return;
    }

    // Simular o que o Vite faria
    console.log('✅ Variável encontrada no .env');
    console.log('🔄 Para o frontend, o Vite deve carregar esta variável automaticamente');
    console.log('🌐 Acesse: http://localhost:8081/sofia-voice');
    console.log('🔍 No console do navegador, digite: console.log(import.meta.env.VITE_GOOGLE_TTS_API_KEY)');

    // Criar um arquivo HTML de teste
    const htmlTest = `
<!DOCTYPE html>
<html>
<head>
    <title>Teste API Key</title>
</head>
<body>
    <h1>Teste da API Key do Google TTS</h1>
    <div id="result"></div>
    <script type="module">
        const apiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
        document.getElementById('result').innerHTML = 
            '<p>API Key encontrada: ' + (apiKey ? 'SIM' : 'NÃO') + '</p>' +
            '<p>Primeiros 10 chars: ' + (apiKey ? apiKey.substring(0, 10) + '...' : 'N/A') + '</p>';
        console.log('🔑 API Key no frontend:', apiKey);
    </script>
</body>
</html>`;

    const fs = await import('fs');
    fs.writeFileSync('teste-api-key.html', htmlTest);
    console.log('📄 Arquivo de teste criado: teste-api-key.html');
    console.log('🌐 Abra este arquivo no navegador para testar');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarVariavelFrontend();


