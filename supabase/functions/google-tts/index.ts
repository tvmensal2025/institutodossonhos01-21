import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface TTSRequest {
  text: string;
  voice?: string;
  languageCode?: string;
  speakingRate?: number;
  pitch?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar se é método POST
    if (req.method !== 'POST') {
      throw new Error('Método não permitido');
    }

    const { text, voice, languageCode, speakingRate, pitch }: TTSRequest = await req.json();

    if (!text || text.trim().length === 0) {
      throw new Error('Texto é obrigatório');
    }

    // Obter credenciais do Google Cloud
    const googleCredentials = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
    
    if (!googleCredentials) {
      throw new Error('Credenciais do Google Cloud não encontradas');
    }

    const credentials = JSON.parse(googleCredentials);

    // Criar JWT para autenticação
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    // Codificar header e payload
    const headerB64 = btoa(JSON.stringify(header))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const payloadB64 = btoa(JSON.stringify(payload))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const data = `${headerB64}.${payloadB64}`;

    // Criar assinatura
    const privateKey = credentials.private_key.replace(/\\n/g, '\n');
    const keyData = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(privateKey),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      keyData,
      new TextEncoder().encode(data)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = `${data}.${signatureB64}`;

    // Obter access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!tokenResponse.ok) {
      throw new Error('Falha na autenticação com Google Cloud');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Preparar dados para síntese de voz
    const ttsRequest = {
      input: {
        text: text.trim()
      },
      voice: {
        languageCode: languageCode || 'pt-BR',
        name: voice || 'pt-BR-Neural2-A', // Voz feminina neural brasileira
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speakingRate || 1.0,
        pitch: pitch || 0.0,
        volumeGainDb: 0.0,
        sampleRateHertz: 24000
      }
    };

    console.log('🎤 Síntese TTS para:', text.substring(0, 100) + '...');
    console.log('🗣️ Voz:', ttsRequest.voice.name);

    // Chamar API do Google Text-to-Speech
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ttsRequest),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('❌ Erro TTS:', errorText);
      throw new Error(`Erro na síntese de voz: ${ttsResponse.status}`);
    }

    const ttsResult = await ttsResponse.json();

    if (!ttsResult.audioContent) {
      throw new Error('Nenhum conteúdo de áudio retornado');
    }

    console.log('✅ Síntese de voz concluída com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        audioContent: ttsResult.audioContent,
        voice: ttsRequest.voice.name,
        languageCode: ttsRequest.voice.languageCode,
        metadata: {
          textLength: text.length,
          speakingRate: ttsRequest.audioConfig.speakingRate,
          pitch: ttsRequest.audioConfig.pitch
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro na edge function google-tts:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor',
        fallback: 'use_web_speech'
      }),
      {
        status: error.message.includes('Credenciais') ? 500 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});