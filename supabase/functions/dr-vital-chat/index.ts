import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, userId } = await req.json();
    if (!message) return new Response(JSON.stringify({ error: "message é obrigatório" }), { status: 400, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, supabaseKey);

    // CARREGAR TODOS OS DADOS DO PACIENTE
    console.log('📊 Dr. Vital Chat - Carregando TODOS os dados...');
    let profile: any = null;
    let anamnesis: any = null;
    let physicalData: any = null;
    let weights: any[] = [];
    let nutritionTracking: any[] = [];
    let foodAnalysis: any[] = [];
    let exerciseHistory: any[] = [];
    let waterTracking: any[] = [];
    let sleepTracking: any[] = [];
    let moodTracking: any[] = [];
    let goals: any[] = [];
    let dailyResponses: any[] = [];
    let missions: any[] = [];
    let achievements: any[] = [];
    let prescriptions: any[] = [];
    let supplements: any[] = [];
    let documents: any[] = [];
    let heartRateData: any[] = [];
    let weeklyAnalyses: any[] = [];

    if (userId) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];

      const [
        { data: p }, { data: a }, { data: pd }, { data: w }, { data: nt }, 
        { data: fa }, { data: eh }, { data: wt }, { data: st }, { data: mt },
        { data: g }, { data: dr }, { data: m }, { data: ac }, { data: pr },
        { data: su }, { data: d }, { data: hr }, { data: wa }
      ] = await Promise.all([
        // Dados básicos
        db.from("profiles").select("*").eq("user_id", userId).single(),
        db.from("user_anamnesis").select("*").eq("user_id", userId).single(),
        db.from("user_physical_data").select("*").eq("user_id", userId).single(),
        
        // Medições e tracking
        db.from("weight_measurements").select("*").eq("user_id", userId).order("measurement_date", { ascending: false }).limit(20),
        db.from("nutrition_tracking").select("*").eq("user_id", userId).gte("date", dateFilter).order("date", { ascending: false }),
        db.from("food_analysis").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
        db.from("exercise_tracking").select("*").eq("user_id", userId).gte("date", dateFilter).order("date", { ascending: false }),
        db.from("water_tracking").select("*").eq("user_id", userId).gte("date", dateFilter).order("date", { ascending: false }),
        db.from("sleep_tracking").select("*").eq("user_id", userId).gte("date", dateFilter).order("date", { ascending: false }),
        db.from("mood_tracking").select("*").eq("user_id", userId).gte("date", dateFilter).order("date", { ascending: false }),
        
        // Metas e engajamento
        db.from("user_goals").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        db.from("daily_responses").select("*").eq("user_id", userId).gte("date", dateFilter).order("date", { ascending: false }),
        db.from("daily_mission_sessions").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(15),
        db.from("user_achievements").select("*").eq("user_id", userId).order("unlocked_at", { ascending: false }),
        
        // Medicamentos e documentos
        db.from("prescriptions").select("*").eq("user_id", userId),
        db.from("user_supplements").select("*").eq("user_id", userId),
        db.from("medical_documents").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        
        // Dados de dispositivos e análises
        db.from("heart_rate_data").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(20),
        db.from("weekly_analyses").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10)
      ]);
      
      profile = p || null;
      anamnesis = a || null;
      physicalData = pd || null;
      weights = w || [];
      nutritionTracking = nt || [];
      foodAnalysis = fa || [];
      exerciseHistory = eh || [];
      waterTracking = wt || [];
      sleepTracking = st || [];
      moodTracking = mt || [];
      goals = g || [];
      dailyResponses = dr || [];
      missions = m || [];
      achievements = ac || [];
      prescriptions = pr || [];
      supplements = su || [];
      documents = d || [];
      heartRateData = hr || [];
      weeklyAnalyses = wa || [];

      console.log('✅ Dr. Vital Chat - Dados carregados:', {
        perfil: !!profile,
        anamnese: !!anamnesis,
        dadosFisicos: !!physicalData,
        pesagens: weights.length,
        nutricao: nutritionTracking.length,
        analiseComida: foodAnalysis.length,
        exercicios: exerciseHistory.length,
        hidratacao: waterTracking.length,
        sono: sleepTracking.length,
        humor: moodTracking.length,
        metas: goals.length,
        missoes: missions.length,
        medicamentos: prescriptions.length,
        suplementos: supplements.length,
        documentos: documents.length,
        frequenciaCardiaca: heartRateData.length
      });
    }

    // Memória persistente (resumo longo prazo)
    let memorySummary = '';
    if (userId) {
      const { data: mem } = await db
        .from('dr_vital_memory')
        .select('key, value')
        .eq('user_id', userId)
        .in('key', ['long_term_summary', 'allergies', 'chronic_flags', 'preferences'])
        .limit(50);
      if (mem && mem.length) {
        memorySummary = mem.map((m: any) => `- ${m.key}: ${JSON.stringify(m.value)}`).join('\n');
      }
    }

    const ctx = {
      // Dados básicos
      profile,
      anamnesis,
      physicalData,
      
      // Histórico e medições
      latest_weight: weights?.[0] || null,
      weight_trend: weights,
      weight_history_complete: weights,
      
      // Nutrição completa
      nutrition_tracking: nutritionTracking,
      food_analysis: foodAnalysis,
      latest_meal_analysis: foodAnalysis?.[0] || null,
      
      // Atividade física
      exercise_history: exerciseHistory,
      latest_exercise: exerciseHistory?.[0] || null,
      
      // Bem-estar
      water_tracking: waterTracking,
      sleep_tracking: sleepTracking,
      mood_tracking: moodTracking,
      latest_mood: moodTracking?.[0] || null,
      latest_sleep: sleepTracking?.[0] || null,
      
      // Metas e progresso
      all_goals: goals,
      active_goals: goals?.filter((x) => x.status === "ativa" || x.status === "active") || [],
      completed_goals: goals?.filter((x) => x.status === "concluida" || x.status === "completed") || [],
      
      // Engajamento
      daily_responses: dailyResponses,
      missions: missions,
      recent_missions_done: (missions || []).filter((x) => x.is_completed).length,
      achievements: achievements,
      
      // Medicamentos e tratamentos
      prescriptions,
      supplements,
      active_medications: prescriptions?.filter((p) => !p.end_date || new Date(p.end_date) > new Date()) || [],
      
      // Documentos e exames
      medical_documents: documents,
      latest_documents: documents,
      
      // Dados de dispositivos
      heart_rate_data: heartRateData,
      latest_heart_rate: heartRateData?.[0] || null,
      
      // Análises e relatórios
      weekly_analyses: weeklyAnalyses,
      latest_analysis: weeklyAnalyses?.[0] || null,
      
      // Memória de longo prazo
      long_term_memory: memorySummary,
      
      // Estatísticas gerais
      data_completeness: {
        has_anamnesis: !!anamnesis,
        has_physical_data: !!physicalData,
        weight_measurements_count: weights.length,
        nutrition_records_count: nutritionTracking.length,
        exercise_records_count: exerciseHistory.length,
        total_achievements: achievements.length,
        completion_percentage: Math.round(([
          !!anamnesis, !!physicalData, weights.length > 0,
          nutritionTracking.length > 0, exerciseHistory.length > 0,
          goals.length > 0, missions.length > 0
        ].filter(Boolean).length / 7) * 100)
      }
    };

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const MODEL = Deno.env.get("OPENAI_DR_VITAL_MODEL") || Deno.env.get("OPENAI_MODEL_PRIMARY") || "o4-mini-2025-04-16";
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada");

    const systemPrompt = `Você é o Dr. Vital, médico virtual especialista do Instituto dos Sonhos. Responda em português do Brasil,
com linguagem simples e humana, sem diagnóstico/prescrição médica. Use TODOS OS DADOS DO PACIENTE abaixo para personalizar completamente sua resposta.

📊 DADOS COMPLETOS DO PACIENTE:
${JSON.stringify(ctx, null, 2)}

🎯 DIRETRIZES AVANÇADAS - ANÁLISE COMPLETA:

ANAMNESE E HISTÓRICO:
- Anamnese completa: ${ctx.data_completeness.has_anamnesis ? 'SIM' : 'PENDENTE'}
- Se anamnese disponível, use histórico familiar, medicamentos, relacionamento com comida
- Considere tratamentos anteriores, desafios específicos, motivações pessoais

ANÁLISE DE PESO E COMPOSIÇÃO:
- Peso atual: ${ctx.latest_weight?.peso_kg || 'não informado'} kg
- IMC: ${ctx.latest_weight?.imc || 'não calculado'}
- Tendência: analise últimos ${ctx.weight_history_complete.length} registros
- Se dados de bioimpedância, comente gordura corporal, massa muscular, metabolismo

NUTRIÇÃO INTELIGENTE:
- Análises Sofia: ${ctx.food_analysis.length} refeições analisadas
- Última refeição: ${ctx.latest_meal_analysis?.total_calories || 'não registrada'} kcal
- Tracking nutricional: ${ctx.nutrition_tracking.length} dias registrados
- Padrões alimentares e sugestões específicas

BEM-ESTAR INTEGRADO:
- Sono: ${ctx.latest_sleep?.hours_slept || 'não monitorado'} horas/noite
- Humor: ${ctx.latest_mood?.mood_score || 'não avaliado'}/10
- Hidratação: dados de ${ctx.water_tracking.length} dias
- Atividade física: ${ctx.exercise_history.length} registros

METAS E MOTIVAÇÃO:
- Metas ativas: ${ctx.active_goals.length}
- Metas concluídas: ${ctx.completed_goals.length}
- Engajamento: ${ctx.recent_missions_done} missões completadas
- Conquistas: ${ctx.achievements.length} desbloqueadas

MEDICAMENTOS E TRATAMENTOS:
- Medicamentos ativos: ${ctx.active_medications.length}
- Suplementos: ${ctx.supplements.length}
- Documentos médicos: ${ctx.medical_documents.length}

COMPLETUDE DOS DADOS: ${ctx.data_completeness.completion_percentage}%

INSTRUÇÕES FINAIS:
- Use TODOS esses dados para dar recomendações ultra-personalizadas
- Conecte diferentes aspectos (peso + humor + sono + nutrição + exercício)
- Identifique padrões específicos nos dados históricos
- Dê feedback preciso sobre tendências observadas
- Sugira ações concretas baseadas no perfil COMPLETO
- Se dados incompletos, oriente coleta específica
- Mantenha tom acolhedor mas profissional
- Resuma em 200-300 palavras, mas seja preciso e útil`;

    // Configurar parâmetros baseados no modelo
    const isNewModel = MODEL.includes('o4-') || MODEL.includes('o3-') || MODEL.includes('gpt-5') || MODEL.includes('gpt-4.1');
    
    const requestBody: any = {
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: String(message) },
      ],
    };

    // Novos modelos usam max_completion_tokens sem temperature
    if (isNewModel) {
      requestBody.max_completion_tokens = 800;
    } else {
      // Modelos antigos usam max_tokens com temperature
      requestBody.max_tokens = 800;
      requestBody.temperature = 0.2;
    }

    console.log(`Dr. Vital usando modelo: ${MODEL}, userId: ${userId}`);
    
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content || "Certo! Estou com seus dados aqui. Como posso te ajudar agora?";

    // Persistência da conversa (conversations + conversation_messages)
    let conversationId: string | null = null;
    try {
      if (userId) {
        const { data: existing } = await db
          .from('conversations')
          .select('id')
          .eq('user_id', userId)
          .eq('agent', 'dr_vital')
          .order('last_message_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing?.id) {
          conversationId = existing.id;
        } else {
          const { data: created } = await db
            .from('conversations')
            .insert({ user_id: userId, agent: 'dr_vital', title: 'Chat Dr. Vital' })
            .select('id')
            .single();
          conversationId = created?.id || null;
        }
        if (conversationId) {
          await db.from('conversation_messages').insert([
            { conversation_id: conversationId, role: 'user', content: String(message), model: 'client' },
            { conversation_id: conversationId, role: 'assistant', content: String(answer), model: MODEL },
          ]);
        }
      }
    } catch (_) {}

    // Extrair fatos e atualizar memória/facts
    try {
      if (userId) {
        // 1) Atualizar resumo de longo prazo (compacto)
        const snippet = (message + ' ' + answer).slice(0, 800);
        await db.from('dr_vital_memory').upsert({
          user_id: userId,
          key: 'long_term_summary',
          value: { last_update: new Date().toISOString(), snippet },
        });

        // 2) Extrator leve de fatos (o4-mini) — opcional e barato
        const OPENAI_KEY = OPENAI_API_KEY;
        const extractor = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'o4-mini-2025-04-16',
            max_completion_tokens: 200,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'Extraia fatos estruturados de saúde sem inventar. Retorne JSON com as chaves presentes: allergies{list[]}, chronic_flags{conditions[]}, medications{list[]}, pain_mood{pain_score?, pain_location?, mood?, triggers[]}, food_preferences{likes[], dislikes[], intolerances[]}, habits{sleep?, training?, hydration?}, goals{active:[{type,target?,due?}], adherence?}. Só traga o que foi explicitamente dito. Se nada, retorne {}.' },
              { role: 'user', content: `Usuário: ${message}\nAssistente: ${answer}` }
            ]
          })
        });
        const extJson = await extractor.json();
        let facts: any = {};
        try { facts = JSON.parse(extJson?.choices?.[0]?.message?.content || '{}'); } catch { facts = {}; }

        const upserts: Array<{ key: string; value: any }> = [];
        if (facts.allergies) upserts.push({ key: 'allergies', value: facts.allergies });
        if (facts.chronic_flags) upserts.push({ key: 'chronic_flags', value: facts.chronic_flags });
        if (facts.medications) upserts.push({ key: 'medications', value: facts.medications });
        if (facts.pain_mood) upserts.push({ key: 'pain_mood', value: facts.pain_mood });
        if (facts.food_preferences) upserts.push({ key: 'food_preferences', value: facts.food_preferences });
        if (facts.habits) upserts.push({ key: 'habits', value: facts.habits });
        if (facts.goals) upserts.push({ key: 'goals', value: facts.goals });

        for (const item of upserts) {
          // Grava em memória longa (chaveada)
          await db.from('dr_vital_memory').upsert({ user_id: userId, key: item.key, value: { ...item.value, last_update: new Date().toISOString(), source: 'chat' } });
          // Grava em conversation_facts, sem duplicar graças ao índice (user_id, category, hash)
          if (conversationId) {
            await db.from('conversation_facts').insert({ user_id: userId, conversation_id: conversationId, category: item.key, payload: item.value }).catch(() => {});
          }
        }
      }
    } catch (_) {}

    return new Response(JSON.stringify({ response: answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("dr-vital-chat error", e);
    return new Response(JSON.stringify({ response: "Tive um probleminha técnico. Pode repetir a pergunta?" }), { headers: corsHeaders });
  }
});


