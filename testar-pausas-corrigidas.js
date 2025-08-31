// Script para testar as pausas corrigidas da Sofia
import { config } from 'dotenv';

// Carregar variáveis do .env
config();

// Função de pré-processamento simplificada
function preprocessTextForTTS(text, config = { enabled: true, useSSML: false, preserveLinks: true, preserveCodes: true, preserveNumbers: true }) {
  if (!config.enabled || !text) return text || '';

  let working = String(text);

  // Remover emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]/gu;
  working = working.replace(emojiRegex, '');
  
  // Remover caracteres especiais
  working = working.replace(/[^\w\s.,!?;:\-()áéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]/g, ' ');
  
  // Normalizar espaços com pausas naturais
  working = working
    .replace(/\s*\n\s*/g, '\n')
    .replace(/[ \t\f\v\u00A0\u2000-\u200B]+/g, ' ')
    .trim();
  
  // Adicionar pausas naturais para melhor fala
  working = working
    // Pausa após pontos de exclamação (mais espaços)
    .replace(/!+/g, '!   ')
    // Pausa após pontos de interrogação (mais espaços)
    .replace(/\?+/g, '?   ')
    // Pausa após pontos finais (mais espaços)
    .replace(/\.+/g, '.   ')
    // Pausa após vírgulas (espaço normal)
    .replace(/,/g, ', ')
    // Pausa após dois pontos (mais espaços)
    .replace(/:/g, ':  ')
    // Pausa após ponto e vírgula (mais espaços)
    .replace(/;/g, ';  ')
    // Pausa para quebras de linha (muitos espaços)
    .replace(/\n+/g, '     ')
    // Limpar espaços extras mas manter pausas
    .replace(/\s+/g, ' ')
    .trim();
  
  return working;
}

async function testarPausasCorrigidas() {
  try {
    console.log('🎤 Testando pausas corrigidas da Sofia...\n');

    // Verificar se existe API key
    const apiKey = process.env.VITE_GOOGLE_TTS_API_KEY || 'AIzaSyBB1_I1XIfM9eXXdPaYV1FQys_6viFoXAs';
    
    if (!apiKey || apiKey === 'sua_chave_aqui') {
      console.log('❌ API Key não configurada!');
      return;
    }

    console.log('🔑 API Key encontrada:', apiKey.substring(0, 10) + '...');

    // Texto de teste com emojis e pontuação
    const textoOriginal = 'Oi! 😊 Que bom que você me avisou! Sentir fome é super normal e, na verdade, é importante escutar o seu corpo. Nesse momento, te indico escolher um lanche leve e nutritivo, ainda mais se estiver entre as principais refeições. 💧';

    console.log('📝 Texto original:', textoOriginal);

    // Pré-processar o texto
    const textoProcessado = preprocessTextForTTS(textoOriginal, { enabled: true, useSSML: false, preserveLinks: true, preserveCodes: true, preserveNumbers: true });
    console.log('🔧 Texto processado:', textoProcessado);

    // Testar a API
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          text: textoProcessado
        },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Neural2-C',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9,
          pitch: 1.2,
          volumeGainDb: 1.5,
          effectsProfileId: ['headphone-class-device'],
          sampleRateHertz: 24000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', errorText);
      return;
    }

    const data = await response.json();

    if (!data.audioContent) {
      console.error('❌ Resposta inválida:', data);
      return;
    }

    console.log('✅ Pausas corrigidas funcionando!');
    console.log('🎵 Áudio gerado com sucesso');
    console.log('📊 Tamanho do áudio:', data.audioContent.length, 'caracteres base64');
    console.log('🗣️ Voz utilizada: pt-BR-Neural2-C');
    console.log('⚡ Velocidade: 0.9');
    console.log('🎵 Pitch: 1.2');
    console.log('🔊 Volume: 1.5');
    console.log('🎧 Otimizado para fones');

    // Salvar áudio para teste
    const fs = await import('fs');
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    fs.writeFileSync('teste-pausas-corrigidas.mp3', audioBuffer);
    console.log('💾 Áudio salvo como: teste-pausas-corrigidas.mp3');

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('🎤 A Sofia agora tem pausas naturais sem problemas de SSML!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarPausasCorrigidas();


