import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY") ?? "";
    const OLLAMA_URL = "https://ids-ollama-web.ifrhb3.easypanel.host";
    
    console.log('🔥 Ativando e testando APIs de IA...');
    console.log('🔑 OpenAI Key exists:', !!OPENAI_API_KEY);
    console.log('🔑 Google AI Key exists:', !!GOOGLE_AI_API_KEY);
    console.log('🔑 Ollama URL:', OLLAMA_URL);

    // Authenticated client (to know who is calling)
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin
    const { data: isAdmin, error: adminErr } = await supabaseAuth.rpc("is_admin_user");
    if (adminErr || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) Test OpenAI
    let openaiResult: { ok: boolean; status?: number; message?: string } = { ok: false };
    if (OPENAI_API_KEY) {
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Você é um verificador de saúde da API." },
              { role: "user", content: "Responda apenas: ok" },
            ],
            temperature: 0.2,
            max_tokens: 5,
          }),
        });
        const j = await r.json();
        const text = j?.choices?.[0]?.message?.content ?? "";
        openaiResult = { ok: r.ok && typeof text === "string", status: r.status, message: text };
      } catch (e) {
        openaiResult = { ok: false, message: (e as Error).message };
      }
    }

    // 2) Test Google Gemini
    let googleResult: { ok: boolean; status?: number; message?: string } = { ok: false };
    if (GOOGLE_AI_API_KEY) {
      try {
        console.log('🧪 Testando Google Gemini...');
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Responda apenas: ok" }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 5 },
            }),
          },
        );
        const j = await r.json();
        const text = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        googleResult = { ok: r.ok && typeof text === "string", status: r.status, message: text };
        console.log(googleResult.ok ? '✅ Google Gemini conectado!' : '❌ Google Gemini falhou:', text);
      } catch (e) {
        googleResult = { ok: false, message: (e as Error).message };
        console.log('❌ Google Gemini exception:', e);
      }
    }

    // 3) Test Ollama
    let ollamaResult: { ok: boolean; status?: number; message?: string; models?: number } = { ok: false };
    try {
      console.log('🧪 Testando Ollama...');
      const r = await fetch(`${OLLAMA_URL}/api/tags`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (r.ok) {
        const data = await r.json();
        ollamaResult = { 
          ok: true, 
          status: r.status, 
          message: "Connected", 
          models: data.models?.length || 0 
        };
        console.log('✅ Ollama conectado!', data.models?.length, 'modelos disponíveis');
      } else {
        const error = await r.text();
        ollamaResult = { ok: false, status: r.status, message: error };
        console.log('❌ Ollama falhou:', error);
      }
    } catch (e) {
      ollamaResult = { ok: false, message: (e as Error).message };
      console.log('❌ Ollama exception:', e);
    }

    // 4) Upsert/ativar configurações nas funcionalidades principais - TODAS ATIVAS
    const configs = [
      { functionality: "chat_daily", service: "openai", model: "gpt-4o", max_tokens: 1000, temperature: 0.8, is_enabled: true, level: "maximo", personality: "sofia", system_prompt: "Você é a Sofia, nutricionista virtual do Instituto dos Sonhos. Seja EMPÁTICA, MOTIVACIONAL e CONCISA. Use linguagem simples e direta, como uma amiga conversando. Foque no bem-estar e motivação do usuário." },
      { functionality: "weekly_report", service: "openai", model: "gpt-4o", max_tokens: 2000, temperature: 0.8, is_enabled: true, level: "maximo", personality: "sofia", system_prompt: "Você é especialista em relatórios semanais de saúde. Crie análises detalhadas e personalizadas baseadas nos dados do usuário." },
      { functionality: "monthly_report", service: "openai", model: "gpt-4o", max_tokens: 2000, temperature: 0.7, is_enabled: true, level: "maximo", personality: "drvital", system_prompt: "Você é especialista em relatórios mensais de saúde. Forneça insights abrangentes sobre o progresso do usuário." },
      { functionality: "medical_analysis", service: "openai", model: "gpt-4o", max_tokens: 2000, temperature: 0.3, is_enabled: true, level: "maximo", personality: "drvital", system_prompt: "Você é o Dr. Vital, médico virtual do Instituto dos Sonhos. Seja DIRETO, PROFISSIONAL e CONCISO. Use linguagem simples, evite textos longos. Foque em recomendações práticas e seguras." },
      { functionality: "preventive_analysis", service: "openai", model: "gpt-4o", max_tokens: 2000, temperature: 0.5, is_enabled: true, level: "maximo", personality: "drvital", system_prompt: "Você é especialista em análise preventiva de saúde. Identifique riscos e forneça recomendações preventivas baseadas em evidências." },
      { functionality: "food_analysis", service: "gemini", model: "gemini-1.5-pro", max_tokens: 1000, temperature: 0.6, is_enabled: true, level: "maximo", personality: "sofia", system_prompt: "Você é especialista em análise nutricional. Avalie alimentos de forma precisa e forneça orientações nutricionais práticas." },
      { functionality: "daily_missions", service: "openai", model: "gpt-4o", max_tokens: 1500, temperature: 0.7, is_enabled: true, level: "maximo", personality: "sofia", system_prompt: "Você é especialista em criar missões diárias personalizadas. Gere tarefas motivacionais e alcançáveis baseadas no perfil do usuário." },
      { functionality: "whatsapp_reports", service: "openai", model: "gpt-4o", max_tokens: 1000, temperature: 0.6, is_enabled: true, level: "maximo", personality: "sofia", system_prompt: "Você é especialista em relatórios concisos para WhatsApp. Crie mensagens claras, motivacionais e direcionadas." },
      { functionality: "email_reports", service: "openai", model: "gpt-4o", max_tokens: 2000, temperature: 0.7, is_enabled: true, level: "maximo", personality: "drvital", system_prompt: "Você é especialista em relatórios detalhados por email. Forneça análises completas e recomendações profissionais." },
    ];

    // Upsert configurações básicas
    for (const config of configs) {
      const { error } = await supabase
        .from("ai_configurations")
        .upsert(config, { onConflict: "functionality" });
        
      if (error) {
        console.error("Erro ao criar config:", config.functionality, error);
      } else {
        console.log("✅ Config criada/atualizada:", config.functionality);
      }
    }

    const summary = {
      openai_working: openaiResult.ok,
      google_working: googleResult.ok,
      ollama_working: ollamaResult.ok,
      all_working: openaiResult.ok && googleResult.ok && ollamaResult.ok
    };
    
    console.log('📊 Resumo final:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        user: userData.user.email,
        openai: openaiResult,
        google: googleResult,
        ollama: ollamaResult,
        summary,
        message: "IAs validadas e configurações criadas",
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("activate-ai fatal", e);
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
