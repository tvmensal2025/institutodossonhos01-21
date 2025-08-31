import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const googleAIApiKey = Deno.env.get('GOOGLE_AI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, userName, hasImage, imageUrl } = await req.json();
    
    console.log('💬 Processando mensagem:', { message, userId, hasImage });

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Se tem imagem, chamar análise de imagem primeiro
    if (hasImage && imageUrl) {
      console.log('📸 Detectada imagem, redirecionando para análise...');
      
      const imageAnalysisResponse = await fetch(`${supabaseUrl}/functions/v1/sofia-image-analysis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          userId,
          userContext: {
            currentMeal: 'refeicao',
            userName: userName || 'usuário'
          }
        })
      });

      if (imageAnalysisResponse.ok) {
        const imageData = await imageAnalysisResponse.json();
        return new Response(JSON.stringify(imageData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('👤 Carregando dados do usuário...');
    
    // Buscar dados do usuário para personalização
    let userProfile = null;
    let userContext = {};
    let actualUserName = userName || 'usuário';
    
    if (userId && userId !== 'guest') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      userProfile = profile;
      
      if (profile) {
        actualUserName = profile.full_name || profile.email?.split('@')[0] || userName || 'usuário';
        
        // Buscar dados físicos se existirem
        const { data: physicalData } = await supabase
          .from('user_physical_data')
          .select('*')
          .eq('user_id', userId)
          .single();

        // Buscar últimas análises nutricionais
        const { data: recentAnalysis } = await supabase
          .from('food_analysis')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3);

        userContext = {
          name: actualUserName,
          age: profile?.age || 'não informada',
          weight: physicalData?.weight_kg || profile?.current_weight || 'não informado',
          height: physicalData?.height_cm || profile?.height || 'não informada',
          gender: profile?.gender || 'não informado',
          goals: profile?.target_weight ? `meta de peso: ${profile.target_weight}kg` : 'metas não definidas',
          recentMeals: recentAnalysis?.length || 0,
          city: profile?.city || 'localização não informada'
        };
      }
    }

    // Montar prompt personalizado da Sofia (permitir override por configuração da funcionalidade)
    let systemPrompt = `Você é a Sofia, uma nutricionista virtual amigável e especializada do Instituto dos Sonhos. 

PERSONALIDADE:
- Carinhosa, empática e motivadora
- Usa emojis de forma natural e adequada
- Linguagem acessível e acolhedora
- Focada em saúde e bem-estar integral
- Personaliza respostas com base no contexto do usuário
- SEMPRE chama o usuário pelo nome

CONTEXTO DO USUÁRIO:
${userProfile ? `
- Nome: ${userContext.name}
- Idade: ${userContext.age} anos
- Peso: ${userContext.weight}kg
- Altura: ${userContext.height}cm
- Gênero: ${userContext.gender}
- Objetivos: ${userContext.goals}
- Refeições registradas: ${userContext.recentMeals}
- Localização: ${userContext.city}
` : `- Usuário visitante: ${actualUserName} (dados não disponíveis)`}

DIRETRIZES:
1. SEMPRE cumprimente pelo nome: "${actualUserName}"
2. Forneça orientações nutricionais personalizadas e baseadas em evidências
3. Incentive hábitos saudáveis e sustentáveis
4. Se o usuário perguntar sobre análise de refeições, explique que pode analisar fotos
5. Mantenha respostas concisas mas completas (máximo 200 palavras)
6. Use linguagem brasileira e regionalismos quando apropriado
7. Se não tiver certeza sobre algo médico, oriente a buscar profissional
8. Foque em educação nutricional e mudanças graduais

ESPECIALIDADES:
- Análise nutricional de refeições via foto
- Orientações sobre alimentação equilibrada
- Dicas de hidratação e exercícios
- Sugestões de alimentos regionais saudáveis
- Estratégias para mudança de hábitos

  Responda de forma natural, carinhosa e útil! SEMPRE use o nome do usuário: ${actualUserName}`;

    // Se houver configuração de IA para daily_chat (ou outra), usar system_prompt do DB
    try {
      const supabaseUrlCfg = Deno.env.get('SUPABASE_URL');
      const supabaseKeyCfg = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrlCfg && supabaseKeyCfg) {
        const db = createClient(supabaseUrlCfg, supabaseKeyCfg);
        const { data: chatCfg } = await db
          .from('ai_configurations')
          .select('system_prompt, is_enabled')
          .eq('functionality', 'daily_chat')
          .single();
        if (chatCfg?.system_prompt && chatCfg.is_enabled !== false) {
          systemPrompt = chatCfg.system_prompt;
        }
      }
    } catch (_) {}

    // Verificar se pelo menos uma API está configurada
    if (!openAIApiKey && !googleAIApiKey) {
      throw new Error('Nenhuma API Key configurada (OpenAI ou Google AI)');
    }

    console.log('🤖 Tentando APIs...');

    let sofiaResponse;
    let apiUsed = 'none';
    
    // Primeiro tentar OpenAI se disponível
    if (openAIApiKey) {
      try {
        console.log('🔵 Tentando OpenAI...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 500,
            temperature: 0.8
          }),
        });

        if (response.ok) {
          const data = await response.json();
          sofiaResponse = data.choices?.[0]?.message?.content;
          apiUsed = 'openai';
          console.log('✅ OpenAI resposta recebida');
        } else {
          console.log('⚠️ OpenAI falhou:', response.status, await response.text());
        }
      } catch (openaiError) {
        console.log('❌ Erro OpenAI:', openaiError);
      }
    }
    
    // Se OpenAI não funcionou, tentar Google AI
    if (!sofiaResponse && googleAIApiKey) {
      try {
        console.log('🟡 Tentando Google AI...');
        const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleAIApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\nUsuário: ${message}`
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 500,
            }
          })
        });

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          sofiaResponse = googleData.candidates?.[0]?.content?.parts?.[0]?.text;
          apiUsed = 'google';
          console.log('✅ Google AI resposta recebida');
        } else {
          console.log('⚠️ Google AI falhou:', googleResponse.status, await googleResponse.text());
        }
      } catch (googleError) {
        console.log('❌ Erro Google AI:', googleError);
      }
    }
    
    // Se nenhuma API funcionou, usar resposta de fallback
    if (!sofiaResponse) {
      console.log('🔄 Usando resposta de fallback...');
      sofiaResponse = `Oi ${actualUserName}! 😊 

Obrigada por sua mensagem! Estou aqui para ajudar com suas questões de saúde e nutrição.

💡 **Posso ajudar com:**
- Dicas de alimentação saudável
- Orientações sobre hidratação 
- Sugestões de exercícios
- Planejamento de refeições

Como posso te ajudar hoje? ✨`;
      apiUsed = 'fallback';
    }

    console.log('✅ Resposta da Sofia processada');

    // Salvar conversa no banco de dados com nova estrutura
    if (userId && userId !== 'guest') {
      await supabase.from('sofia_conversations').insert({
        user_id: userId,
        user_message: message,
        sofia_response: sofiaResponse,
        context_data: userContext,
        conversation_type: 'chat',
        created_at: new Date().toISOString()
      });
    }

    console.log('💾 Conversa salva no banco');

    return new Response(JSON.stringify({ 
      response: sofiaResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na Sofia Chat:', error);
    
    // Resposta de fallback amigável
    const fallbackResponse = `Oi! 😊 Tive um probleminha técnico agora, mas estou aqui para te ajudar! Pode repetir sua pergunta? 💭✨`;
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      success: false,
      error: error.message 
    }), {
      status: 200, // Não retorna erro HTTP para não quebrar UX
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});