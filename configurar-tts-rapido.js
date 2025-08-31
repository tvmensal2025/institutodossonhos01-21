import fs from 'fs';
import path from 'path';

async function configurarTTSRapido() {
  try {
    console.log('🎤 Configuração Rápida do Google TTS\n');
    
    // Solicitar a nova chave
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    console.log('📋 Siga estes passos:');
    console.log('1. Acesse: https://console.cloud.google.com/');
    console.log('2. Ative a API "Cloud Text-to-Speech"');
    console.log('3. Crie uma nova chave de API');
    console.log('4. Cole a chave abaixo:\n');

    const novaChave = await question('🔑 Cole sua nova chave do Google Cloud: ');
    
    if (!novaChave || novaChave.length < 20) {
      console.log('❌ Chave inválida! Deve ter pelo menos 20 caracteres.');
      rl.close();
      return;
    }

    // Configurar arquivo .env
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Remover chave antiga se existir
    envContent = envContent.replace(/VITE_GOOGLE_TTS_API_KEY=.*\n?/g, '');
    
    // Adicionar nova chave
    envContent += `\n# Google Cloud Text-to-Speech API Key\nVITE_GOOGLE_TTS_API_KEY=${novaChave}\n`;
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Chave configurada com sucesso!');
    console.log('📁 Arquivo .env atualizado');
    
    // Testar a chave
    console.log('\n🧪 Testando a nova chave...');
    
    const testResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${novaChave}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          text: 'Teste de voz da Sofia'
        },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Neural2-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      })
    });

    if (testResponse.ok) {
      console.log('✅ Chave funcionando perfeitamente!');
      console.log('\n🎉 CONFIGURAÇÃO COMPLETA!');
      console.log('\n📋 Próximos passos:');
      console.log('1. Reinicie o servidor: npm run dev');
      console.log('2. Acesse: http://localhost:8081/sofia-voice');
      console.log('3. Teste o chat por voz da Sofia');
      console.log('\n🎤 A Sofia agora terá voz natural!');
    } else {
      const errorData = await testResponse.json();
      console.log('❌ Erro no teste:', errorData.error?.message || 'Erro desconhecido');
      console.log('\n💡 Verifique se:');
      console.log('- A API "Cloud Text-to-Speech" está ativada');
      console.log('- A chave está correta');
      console.log('- O projeto tem créditos disponíveis');
    }
    
    rl.close();
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    console.log('\n💡 Tente novamente ou configure manualmente:');
    console.log('1. Crie arquivo .env na raiz do projeto');
    console.log('2. Adicione: VITE_GOOGLE_TTS_API_KEY=sua_chave_aqui');
    console.log('3. Reinicie o servidor');
  }
}

// Executar configuração
configurarTTSRapido();
