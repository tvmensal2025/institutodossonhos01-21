import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Função para gerar access token OAuth2
async function getAccessToken(credentials: any): Promise<string> {
  const jwt = await createJWT(credentials);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Função para criar JWT
async function createJWT(credentials: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/cloud-vision',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = `${headerB64}.${payloadB64}`;
  
  // Importar chave privada
  const privateKeyPem = credentials.private_key.replace(/\\n/g, '\n');
  
  // Extrair apenas a parte da chave privada
  const privateKeyData = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  // Decodificar base64
  const privateKeyBuffer = Uint8Array.from(atob(privateKeyData), c => c.charCodeAt(0));
  
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Assinar
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(data)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${data}.${signatureB64}`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const googleCredentialsJson = Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_JSON');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!googleCredentialsJson) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_APPLICATION_CREDENTIALS_JSON não configurada' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse das credenciais JSON
    let credentials;
    try {
      credentials = JSON.parse(googleCredentialsJson);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'JSON de credenciais inválido' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Gerar access token OAuth2
    const accessToken = await getAccessToken(credentials);

    const { image, features = ['TEXT_DETECTION', 'OBJECT_LOCALIZATION'] } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Imagem é obrigatória' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Preparar a imagem para a Vision API
    let imageContent = '';
    if (image.startsWith('data:')) {
      // Se é base64, extrair apenas o conteúdo
      imageContent = image.split(',')[1];
    } else if (image.startsWith('http')) {
      // Se é URL, baixar a imagem
      const imageResponse = await fetch(image);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      imageContent = btoa(String.fromCharCode(...uint8Array));
    } else {
      // Assumir que já é base64
      imageContent = image;
    }

    // Preparar features para a Vision API
    const visionFeatures = features.map((feature: string) => ({
      type: feature,
      maxResults: 10
    }));

    // Chamar Google Vision API
    const visionResponse = await fetch(
      'https://vision.googleapis.com/v1/images:annotate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageContent
              },
              features: visionFeatures
            }
          ]
        })
      }
    );

    if (!visionResponse.ok) {
      const errorData = await visionResponse.text();
      console.error('Erro da Vision API:', errorData);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar imagem', details: errorData }),
        { 
          status: visionResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const visionData = await visionResponse.json();
    
    // Processar e estruturar os resultados
    const processedResults = {
      success: true,
      timestamp: new Date().toISOString(),
      results: visionData.responses[0] || {},
      summary: {
        textsDetected: visionData.responses[0]?.textAnnotations?.length || 0,
        objectsDetected: visionData.responses[0]?.localizedObjectAnnotations?.length || 0,
        facesDetected: visionData.responses[0]?.faceAnnotations?.length || 0,
        labelsDetected: visionData.responses[0]?.labelAnnotations?.length || 0
      }
    };

    // Extrair texto principal se houver
    if (visionData.responses[0]?.textAnnotations?.length > 0) {
      processedResults.extractedText = visionData.responses[0].textAnnotations[0].description;
    }

    // Extrair objetos principais se houver
    if (visionData.responses[0]?.localizedObjectAnnotations?.length > 0) {
      processedResults.detectedObjects = visionData.responses[0].localizedObjectAnnotations.map((obj: any) => ({
        name: obj.name,
        confidence: obj.score,
        boundingBox: obj.boundingPoly
      }));
    }

    console.log('Análise de imagem concluída:', processedResults.summary);

    return new Response(
      JSON.stringify(processedResults),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na vision-api function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});