import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const googleAIApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    
    console.log('🔑 Testando chaves API...');
    console.log('OpenAI Key exists:', !!openAIApiKey);
    console.log('Google AI Key exists:', !!googleAIApiKey);
    
    const results = {
      openai: null,
      google: null,
      timestamp: new Date().toISOString()
    };

    // Teste OpenAI
    if (openAIApiKey) {
      try {
        console.log('🧪 Testando OpenAI...');
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'user', content: 'Responda apenas "OK" se você está funcionando.' }
            ],
            max_tokens: 10
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          results.openai = {
            status: 'success',
            response: data.choices[0]?.message?.content || 'OK',
            model: data.model
          };
          console.log('✅ OpenAI funcionando!');
        } else {
          const error = await openaiResponse.text();
          results.openai = {
            status: 'error',
            error: `HTTP ${openaiResponse.status}: ${error}`
          };
          console.log('❌ OpenAI erro:', error);
        }
      } catch (error) {
        results.openai = {
          status: 'error',
          error: error.message
        };
        console.log('❌ OpenAI exception:', error);
      }
    } else {
      results.openai = {
        status: 'error',
        error: 'OPENAI_API_KEY não configurada'
      };
    }

    // Teste Google AI
    if (googleAIApiKey) {
      try {
        console.log('🧪 Testando Google AI...');
        const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleAIApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Responda apenas "OK" se você está funcionando.'
              }]
            }]
          })
        });

        if (googleResponse.ok) {
          const data = await googleResponse.json();
          results.google = {
            status: 'success',
            response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK'
          };
          console.log('✅ Google AI funcionando!');
        } else {
          const error = await googleResponse.text();
          results.google = {
            status: 'error',
            error: `HTTP ${googleResponse.status}: ${error}`
          };
          console.log('❌ Google AI erro:', error);
        }
      } catch (error) {
        results.google = {
          status: 'error',
          error: error.message
        };
        console.log('❌ Google AI exception:', error);
      }
    } else {
      results.google = {
        status: 'error',
        error: 'GOOGLE_AI_API_KEY não configurada'
      };
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        openai_working: results.openai?.status === 'success',
        google_working: results.google?.status === 'success',
        both_working: results.openai?.status === 'success' && results.google?.status === 'success'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro no teste das APIs:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});