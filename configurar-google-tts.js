import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function configurarGoogleTTS() {
  try {
    console.log('🎤 Configurando Google Text-to-Speech...\n');

    // 1. Verificar se já existe uma chave do Google AI
    console.log('1. Verificando chaves existentes...');
    
    // Testar se a chave do Google AI funciona para TTS
    const googleAIKey = 'AIzaSyCOdeLu7T_uhCcXlTzZgat5wbo8Y-0DbNc';
    
    console.log('2. Testando chave do Google AI para TTS...');
    
    const testResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleAIKey}`, {
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
      console.log('✅ Chave do Google AI funciona para TTS!');
      
      // 3. Configurar no arquivo .env
      console.log('3. Configurando arquivo .env...');
      
      const fs = await import('fs');
      const path = await import('path');
      
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Verificar se já existe a variável
      if (!envContent.includes('VITE_GOOGLE_TTS_API_KEY')) {
        envContent += `\n# Google Cloud Text-to-Speech API Key\nVITE_GOOGLE_TTS_API_KEY=${googleAIKey}\n`;
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Variável VITE_GOOGLE_TTS_API_KEY adicionada ao .env');
      } else {
        console.log('ℹ️ Variável VITE_GOOGLE_TTS_API_KEY já existe no .env');
      }
      
      // 4. Testar a configuração
      console.log('4. Testando configuração...');
      
      const testText = 'Olá! Sou a Sofia, sua nutricionista virtual. Como posso te ajudar hoje?';
      
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleAIKey}`, {
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

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Teste de TTS bem-sucedido!');
        console.log(`📊 Caracteres processados: ${testText.length}`);
        console.log(`🎵 Áudio gerado: ${data.audioContent ? 'Sim' : 'Não'}`);
        
        // 5. Instruções finais
        console.log('\n🎉 CONFIGURAÇÃO COMPLETA!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Reinicie o servidor: npm run dev');
        console.log('2. Acesse: http://localhost:8081/sofia-voice');
        console.log('3. Teste o chat por voz da Sofia');
        console.log('\n🎤 A Sofia agora terá voz natural!');
        
      } else {
        const errorData = await response.json();
        console.log('❌ Erro no teste de TTS:', errorData);
      }
      
    } else {
      const errorData = await testResponse.json();
      console.log('❌ Chave do Google AI não funciona para TTS:', errorData);
      console.log('\n💡 Solução:');
      console.log('1. Acesse: https://console.cloud.google.com/');
      console.log('2. Ative a API "Cloud Text-to-Speech"');
      console.log('3. Crie uma nova chave de API');
      console.log('4. Configure no arquivo .env');
    }
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    console.log('\n💡 Solução manual:');
    console.log('1. Acesse: https://console.cloud.google.com/');
    console.log('2. Crie um projeto ou selecione existente');
    console.log('3. Ative a API "Cloud Text-to-Speech"');
    console.log('4. Crie uma chave de API');
    console.log('5. Adicione ao arquivo .env:');
    console.log('   VITE_GOOGLE_TTS_API_KEY=sua_chave_aqui');
  }
}

// Executar configuração
configurarGoogleTTS();
