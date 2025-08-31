async function testarVozesSofia() {
  try {
    console.log('🎤 Testando diferentes vozes da Sofia...\n');

    const apiKey = 'AIzaSyBB1_I1XIfM9eXXdPaYV1FQys_6viFoXAs';
    const testText = 'Olá! Sou a Sofia, sua nutricionista virtual. Como posso te ajudar hoje?';
    
    const vozes = [
      {
        name: 'pt-BR-Neural2-A',
        description: 'Feminina Padrão',
        config: {
          speakingRate: 0.85,
          pitch: 2.0,
          volumeGainDb: 2.0
        }
      },
      {
        name: 'pt-BR-Neural2-C',
        description: 'Feminina Natural',
        config: {
          speakingRate: 0.85,
          pitch: 2.0,
          volumeGainDb: 2.0
        }
      },
      {
        name: 'pt-BR-Neural2-D',
        description: 'Masculina',
        config: {
          speakingRate: 0.85,
          pitch: 1.5,
          volumeGainDb: 2.0
        }
      },
      {
        name: 'pt-BR-Neural2-A',
        description: 'Feminina Lenta',
        config: {
          speakingRate: 0.75,
          pitch: 1.8,
          volumeGainDb: 1.5
        }
      },
      {
        name: 'pt-BR-Neural2-C',
        description: 'Feminina Suave',
        config: {
          speakingRate: 0.9,
          pitch: 1.5,
          volumeGainDb: 1.0
        }
      }
    ];

    console.log('🔍 Testando 5 configurações de voz...\n');

    for (let i = 0; i < vozes.length; i++) {
      const voz = vozes[i];
      console.log(`${i + 1}. Testando: ${voz.description} (${voz.name})`);
      
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
            name: voz.name,
            ssmlGender: voz.name.includes('A') || voz.name.includes('C') ? 'FEMALE' : 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: voz.config.speakingRate,
            pitch: voz.config.pitch,
            volumeGainDb: voz.config.volumeGainDb,
            effectsProfileId: ['headphone-class-device']
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Gerado: ${data.audioContent ? 'Sim' : 'Não'} (${data.audioContent?.length || 0} chars)`);
        
        // Salvar arquivo de áudio para teste
        if (data.audioContent) {
          const fs = await import('fs');
          const path = await import('path');
          
          const audioBlob = Buffer.from(data.audioContent, 'base64');
          const fileName = `voz-teste-${i + 1}-${voz.name}.mp3`;
          fs.writeFileSync(fileName, audioBlob);
          console.log(`   💾 Salvo: ${fileName}`);
        }
      } else {
        console.log(`   ❌ Erro: ${response.status}`);
      }
      
      console.log('');
    }

    console.log('🎉 Teste completo!');
    console.log('\n📋 Para ouvir as vozes:');
    console.log('1. Abra os arquivos .mp3 gerados');
    console.log('2. Escolha a voz que mais gostou');
    console.log('3. Me diga qual número (1-5)');
    console.log('4. Vou configurar essa voz no sistema');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarVozesSofia();
