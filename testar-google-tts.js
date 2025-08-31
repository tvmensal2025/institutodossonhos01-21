// Script para testar a API do Google TTS
import { config } from 'dotenv';

// Carregar variáveis do .env
config();

async function testarGoogleTTS() {
  try {
    console.log('🎤 Testando Google TTS...\n');

    // Verificar se existe API key
    const apiKey = process.env.VITE_GOOGLE_TTS_API_KEY || 'AIzaSyBB1_I1XIfM9eXXdPaYV1FQys_6viFoXAs';
    
    if (!apiKey || apiKey === 'sua_chave_aqui') {
      console.log('❌ API Key não configurada!');
      console.log('📝 Configure a variável VITE_GOOGLE_TTS_API_KEY no arquivo .env');
      return;
    }

    console.log('🔑 API Key encontrada:', apiKey.substring(0, 10) + '...');

    // Texto de teste (sem emojis)
    const testText = 'Olá! Sou a Sofia, sua nutricionista virtual. Como posso te ajudar hoje com sua alimentação?';

    console.log('📝 Texto de teste:', testText);

    // Chamar API do Google TTS
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          text: testText
        },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Neural2-C',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.85,
          pitch: 1.3,
          volumeGainDb: 1.2,
          effectsProfileId: ['headphone-class-device']
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', errorText);
      
      if (response.status === 403) {
        console.log('💡 Dica: Verifique se a API "Cloud Text-to-Speech" está ativada no Google Cloud Console');
      }
      
      return;
    }

    const data = await response.json();

    if (!data.audioContent) {
      console.error('❌ Resposta inválida:', data);
      return;
    }

    console.log('✅ API funcionando!');
    console.log('🎵 Áudio gerado com sucesso');
    console.log('📊 Tamanho do áudio:', data.audioContent.length, 'caracteres base64');
    console.log('🗣️ Voz utilizada: pt-BR-Neural2-C');
    console.log('⚡ Velocidade: 0.85');
    console.log('🎵 Pitch: 1.3');
    console.log('🔊 Volume: 1.2');

    // Salvar áudio para teste (opcional)
    const fs = await import('fs');
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    fs.writeFileSync('teste-sofia-voice.mp3', audioBuffer);
    console.log('💾 Áudio salvo como: teste-sofia-voice.mp3');

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('🎤 A Sofia está pronta para falar com voz natural!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarGoogleTTS();
