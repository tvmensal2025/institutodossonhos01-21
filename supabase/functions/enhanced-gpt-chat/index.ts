import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, type = 'general' } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Definir prompts específicos baseados no tipo
    const systemPrompts = {
      health: `Você é um assistente especializado em saúde e bem-estar. 
               Forneça conselhos personalizados baseados nos dados de saúde do usuário.
               Seja empático, motivacional e sempre recomende buscar profissionais quando necessário.`,
      
      goals: `Você é um coach especializado em metas e objetivos.
              Ajude o usuário a definir, acompanhar e alcançar suas metas de saúde.
              Seja motivacional e forneça estratégias práticas.`,
      
      nutrition: `Você é um especialista em nutrição e alimentação saudável.
                  Forneça conselhos sobre alimentação baseados no perfil do usuário.
                  Sempre considere restrições alimentares e prefira alimentos naturais.`,
      
      exercise: `Você é um personal trainer virtual especializado em exercícios.
                 Crie planos de exercício personalizados baseados no nível de condicionamento do usuário.
                 Sempre priorize a segurança e progressão gradual.`,
      
      general: `Você é um assistente de saúde e bem-estar amigável e conhecedor.
                Ajude o usuário com suas perguntas sobre saúde, nutrição, exercícios e bem-estar.
                Seja empático e motivacional.`
    };

    const systemPrompt = systemPrompts[type as keyof typeof systemPrompts] || systemPrompts.general;

    const messages = [
      {
        role: "system",
        content: systemPrompt + (context ? `\n\nContexto do usuário: ${context}` : '')
      },
      {
        role: "user",
        content: message
      }
    ];

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages,
        max_completion_tokens: 1500,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('No response generated from OpenAI');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reply,
        type,
        usage: data.usage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in GPT chat:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});