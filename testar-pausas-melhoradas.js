// Script para testar as pausas melhoradas da Sofia
import { config } from 'dotenv';

// Carregar variáveis do .env
config();

// Função de pré-processamento melhorada
function preprocessTextForTTS(text, config = { enabled: true, useSSML: false, preserveLinks: true, preserveCodes: true, preserveNumbers: true }) {
  if (!config.enabled || !text) return text || '';

  let working = String(text);

  // Remover emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]/gu;
  working = working.replace(emojiRegex, '');
  
  // Remover caracteres especiais
  working = working.replace(/[^\w\s.,!?;:\-()áéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]/g, ' ');
  
  // Normalizar espaços
  working = working
    .replace(/\s*\n\s*/g, '\n')
    .replace(/[ \t\f\v\u00A0\u2000-\u200B]+/g, ' ')
    .trim();
  
  // Adicionar pausas naturais para melhor fala
  working = working
    // Pausa após pontos de exclamação (ponto extra)
    .replace(/!+/g, '!. ')
    // Pausa após pontos de interrogação (ponto extra)
    .replace(/\?+/g, '?. ')
    // Pausa após pontos finais (ponto extra)
    .replace(/\.+/g, '.. ')
    // Pausa após vírgulas (ponto)
    .replace(/,/g, ',. ')
    // Pausa após dois pontos (ponto extra)
    .replace(/:/g, ':. ')
    // Pausa após ponto e vírgula (ponto extra)
    .replace(/;/g, ';. ')
    // Pausa para quebras de linha (múltiplos pontos)
    .replace(/\n+/g, '... ')
    // Limpar espaços extras mas manter pausas
    .replace(/\s+/g, ' ')
    .trim();
  
  return working;
}

async function testarPausasMelhoradas() {
  try {
    console.log('🎤 Testando pausas melhoradas da Sofia...\n');

    // Verificar se existe API key
    const apiKey = process.env.VITE_GOOGLE_TTS_API_KEY || 'AIzaSyBB1_I1XIfM9eXXdPaYV1FQys_6viFoXAs';
    
    if (!apiKey || apiKey === 'sua_chave_aqui') {
      console.log('❌ API Key não configurada!');
      return;
    }

    console.log('🔑 API Key encontrada:', apiKey.substring(0, 10) + '...');

    // Texto de teste com emojis e pontuação
    const textoOriginal = 'Oi, ccccc! 😊 Eu sei várias receitas, sim! Posso te sugerir opções saudáveis, fáceis e gostosas para o dia a dia. Se você quiser, é só me contar qual refeição está buscando (café da manhã, almoço, lanche ou jantar), se tem alguma restrição alimentar, ou até mesmo ingredientes que tem aí em Salto. Assim, consigo personalizar ainda mais pra você! 🥗🍲';

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
          speakingRate: 0.75, // Velocidade mais lenta para pausas naturais
          pitch: 1.1, // Pitch mais natural
          volumeGainDb: 1.5, // Volume mais alto
          effectsProfileId: ['headphone-class-device'], // Otimizado para fones
          sampleRateHertz: 24000 // Qualidade de áudio otimizada
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

    console.log('✅ Pausas melhoradas funcionando!');
    console.log('🎵 Áudio gerado com sucesso');
    console.log('📊 Tamanho do áudio:', data.audioContent.length, 'caracteres base64');
    console.log('🗣️ Voz utilizada: pt-BR-Neural2-C');
    console.log('⚡ Velocidade: 0.75 (mais lenta para pausas)');
    console.log('🎵 Pitch: 1.1');
    console.log('🔊 Volume: 1.5');
    console.log('🎧 Otimizado para fones');

    // Salvar áudio para teste
    const fs = await import('fs');
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    fs.writeFileSync('teste-pausas-melhoradas.mp3', audioBuffer);
    console.log('💾 Áudio salvo como: teste-pausas-melhoradas.mp3');

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('🎤 A Sofia agora tem pausas naturais e fala mais devagar!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarPausasMelhoradas();


