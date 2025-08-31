import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { message, userId, context } = await req.json();

    console.log('🧠 Sofia Enhanced Memory - Processando mensagem para usuário:', userId);

    // 1. Buscar perfil do usuário (primeiro nome)
    let firstName = 'usuário';
    let userProfile = null;
    
    // Tentar buscar primeiro na tabela profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', userId)
      .single();
      
    if (profileData?.full_name) {
      firstName = profileData.full_name.split(' ')[0];
      userProfile = profileData;
      console.log('👤 Usuário encontrado no profiles:', firstName);
    } else {
      // Se não encontrou no profiles, buscar no auth.users
      console.log('📋 Perfil não encontrado em profiles, buscando em auth.users');
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      if (authUser?.user?.email) {
        // Extrair nome do email ou usar dados do metadata
        const emailName = authUser.user.email.split('@')[0];
        firstName = authUser.user.user_metadata?.full_name?.split(' ')[0] || 
                   authUser.user.user_metadata?.first_name ||
                   emailName || 'usuário';
        userProfile = {
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.full_name || firstName
        };
        console.log('👤 Usuário encontrado no auth.users:', firstName);
      }
    }

    // 2. BUSCAR TODOS OS DADOS DO USUÁRIO - ACESSO COMPLETO
    console.log('📊 Carregando TODOS os dados do usuário...');
    
    // Anamnese médica completa
    const { data: anamnesis } = await supabase
      .from('user_anamnesis')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Dados físicos e pesagens
    const { data: physicalData } = await supabase
      .from('user_physical_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: weightMeasurements } = await supabase
      .from('weight_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .limit(20);

    // Nutrição e alimentação
    const { data: nutritionTracking } = await supabase
      .from('nutrition_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    const { data: nutritionGoals } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId);

    const { data: foodAnalysis } = await supabase
      .from('food_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Exercícios e atividade física
    const { data: exerciseTracking } = await supabase
      .from('exercise_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(20);

    // Hidratação e sono
    const { data: waterTracking } = await supabase
      .from('water_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(20);

    const { data: sleepTracking } = await supabase
      .from('sleep_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(20);

    // Humor e bem-estar
    const { data: moodTracking } = await supabase
      .from('mood_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(20);

    const { data: dailyAdvancedTracking } = await supabase
      .from('daily_advanced_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(20);

    // Metas e objetivos
    const { data: userGoals } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data: goalProgressLogs } = await supabase
      .from('goal_progress_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Missões e desafios
    const { data: dailyMissions } = await supabase
      .from('daily_mission_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(20);

    const { data: dailyResponses } = await supabase
      .from('daily_responses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    const { data: challengeParticipations } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('user_id', userId);

    // 📚 BUSCAR BASE DE CONHECIMENTO DA EMPRESA - INSTITUTO DOS SONHOS
    const { data: companyKnowledge } = await supabase
      .from('company_knowledge_base')
      .select('category, title, content')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // Análises e relatórios
    const { data: weeklyAnalyses } = await supabase
      .from('weekly_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: medicalReports } = await supabase
      .from('medical_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Medicamentos e suplementos
    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', userId);

    const { data: userSupplements } = await supabase
      .from('user_supplements')
      .select('*')
      .eq('user_id', userId);

    // Integrações e dispositivos
    const { data: heartRateData } = await supabase
      .from('heart_rate_data')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(20);

    // Documentos médicos
    const { data: medicalDocuments } = await supabase
      .from('medical_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Educação e cursos
    const { data: courseProgress } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', userId);

    // Comunidade e social
    const { data: healthFeedPosts } = await supabase
      .from('health_feed_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Conversas recentes (mantido)
    const { data: recentConversations } = await supabase
      .from('user_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    console.log('📊 DADOS COLETADOS:');
    console.log('- Anamnese:', !!anamnesis);
    console.log('- Dados físicos:', !!physicalData);
    console.log('- Pesagens:', weightMeasurements?.length || 0);
    console.log('- Nutrição tracking:', nutritionTracking?.length || 0);
    console.log('- Análises de comida:', foodAnalysis?.length || 0);
    console.log('- Exercícios:', exerciseTracking?.length || 0);
    console.log('- Hidratação:', waterTracking?.length || 0);
    console.log('- Sono:', sleepTracking?.length || 0);
    console.log('- Humor:', moodTracking?.length || 0);
    console.log('- Metas:', userGoals?.length || 0);
    console.log('- Missões:', dailyMissions?.length || 0);
    console.log('- Conversas:', recentConversations?.length || 0);

    // 4. Construir contexto COMPLETO para IA
    const contextForAI = {
      userProfile: { firstName, fullProfile: userProfile },
      
      // Anamnese e dados médicos
      anamnesis: anamnesis || null,
      physicalData: physicalData || null,
      
      // Histórico de peso e medições
      weightHistory: weightMeasurements || [],
      currentWeight: weightMeasurements?.[0]?.peso_kg || null,
      weightTrend: weightMeasurements?.slice(0, 5) || [],
      
      // Dados nutricionais completos
      nutritionTracking: nutritionTracking || [],
      nutritionGoals: nutritionGoals || [],
      foodAnalysis: foodAnalysis || [],
      
      // Atividade física
      exerciseHistory: exerciseTracking || [],
      
      // Bem-estar e saúde mental
      waterTracking: waterTracking || [],
      sleepTracking: sleepTracking || [],
      moodTracking: moodTracking || [],
      dailyAdvancedTracking: dailyAdvancedTracking || [],
      
      // Metas e progresso
      userGoals: userGoals || [],
      goalProgress: goalProgressLogs || [],
      
      // Engajamento e motivação
      dailyMissions: dailyMissions || [],
      dailyResponses: dailyResponses || [],
      challengeParticipations: challengeParticipations || [],
      
      // Relatórios e análises
      weeklyAnalyses: weeklyAnalyses || [],
      medicalReports: medicalReports || [],
      
      // Medicamentos e tratamentos
      prescriptions: prescriptions || [],
      supplements: userSupplements || [],
      
      // Dados de dispositivos
      heartRateData: heartRateData || [],
      
      // Documentos e exames
      medicalDocuments: medicalDocuments || [],
      
      // Educação e desenvolvimento
      courseProgress: courseProgress || [],
      
      // Comunidade
      socialPosts: healthFeedPosts || [],
      
      // Conversas
      recentConversations: recentConversations || [],
      currentContext: context || {},
      
      // Base de conhecimento da empresa
      companyKnowledge: companyKnowledge || [],
    };

    // 5. Gerar resposta da IA
    const systemPrompt = buildSystemPrompt(contextForAI);
    console.log('🤖 Gerando resposta da IA...');
    
    let response = '';
    let apiUsed = 'none';

    // OpenAI GPT-4o como provedor principal
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiApiKey) {
      try {
        console.log('🤖 Sofia usando OpenAI GPT-4o...');
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 120
          })
        });

        const data = await openaiResponse.json();
        if (data?.error) {
          console.error('❌ Erro OpenAI:', data.error);
        } else if (data?.choices?.[0]?.message?.content) {
          response = data.choices[0].message.content;
          apiUsed = 'openai-gpt-4o';
          console.log('✅ OpenAI funcionou!');
        }
      } catch (error) {
        console.error('❌ Erro OpenAI:', error);
      }
    } else {
      console.warn('OPENAI_API_KEY ausente nas secrets do projeto');
    }

    // Fallback para Google AI se OpenAI falhar
    if (!response) {
      const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
      if (googleApiKey) {
        try {
          console.log('🤖 Sofia usando Google AI...');
          const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${systemPrompt}\n\nUsuário: ${message}` }]
              }],
              generationConfig: { 
                temperature: 0.9, 
                maxOutputTokens: 120,
                topP: 0.8,
                topK: 10
              }
            })
          });

          if (!googleResponse.ok) {
            console.error('❌ Erro Google AI: Error:', googleResponse.status);
            throw new Error(`Google AI error: ${googleResponse.status}`);
          }

          const gData = await googleResponse.json();
          if (gData?.candidates?.[0]?.content?.parts?.[0]?.text) {
            response = gData.candidates[0].content.parts[0].text;
            apiUsed = 'google-ai';
            console.log('✅ Google AI funcionou!');
          } else {
            console.log('⚠️ Google AI retornou resposta vazia');
          }
        } catch (error) {
          console.error('❌ Erro Google AI:', error);
        }
      } else {
        console.warn('GOOGLE_AI_API_KEY ausente nas secrets do projeto');
      }
    }

    // Resposta padrão se nenhuma IA funcionar
    if (!response || response.includes('problema técnico')) {
      response = `Olá ${firstName}! Sou a Sofia, sua assistente de saúde. Como posso ajudar você hoje? 💚`;
      apiUsed = 'fallback';
    }

    console.log('✅ Resposta gerada usando:', apiUsed);

    // 5. Salvar conversa
    console.log('💾 Salvando conversa para usuário:', userId);
    const { error: saveError } = await supabase
      .from('user_conversations')
      .insert([
        {
          user_id: userId,
          conversation_id: `conversation_${Date.now()}`,
          message_role: 'user',
          message_content: message,
          timestamp: new Date().toISOString(),
          session_metadata: context || {},
          analysis_type: context?.imageUrl ? 'image_analysis' : 'text_chat',
          context: { api_used: apiUsed }
        },
        {
          user_id: userId,
          conversation_id: `conversation_${Date.now()}`,
          message_role: 'assistant',
          message_content: response,
          timestamp: new Date().toISOString(),
          session_metadata: context || {},
          analysis_type: context?.imageUrl ? 'image_analysis' : 'text_chat',
          context: { api_used: apiUsed }
        }
      ]);
      
    if (saveError) {
      console.error('❌ Erro ao salvar conversa:', saveError);
    } else {
      console.log('✅ Conversa salva com sucesso');
    }

    // 6. Retornar resposta
    console.log('🎯 Sofia respondendo para:', firstName);

    return new Response(
      JSON.stringify({
        message: response,
        memory_updated: true,
        knowledge_used: [null, null, null, null, null, null],
        context_analyzed: {
          userKnowledge: [
            {
              category: "mental_health",
              title: "Mantendo a Motivação",
              content: "Para manter a motivação: 1) Defina metas pequenas e alcançáveis, 2) Celebre pequenas vitórias, 3) Encontre um parceiro de treino, 4) Varie suas atividades, 5) Mantenha um diário de progresso.",
              relevance: 0.3
            },
            {
              category: "nutrition",
              title: "Perda de Peso Saudável",
              content: "Para perder peso de forma saudável, foque em: 1) Déficit calórico moderado (300-500 kcal), 2) Proteína adequada (1.6-2.2g/kg), 3) Exercício regular, 4) Sono de qualidade, 5) Hidratação adequada. Evite dietas muito restritivas.",
              relevance: 0.3
            },
            {
              category: "nutrition",
              title: "Ganho de Massa Muscular",
              content: "Para ganhar massa muscular: 1) Superávit calórico (200-300 kcal), 2) Proteína alta (1.8-2.4g/kg), 3) Treino de força progressivo, 4) Descanso adequado, 5) Carboidratos para energia.",
              relevance: 0.3
            },
            {
              category: "exercise",
              title: "Exercício Cardiovascular",
              content: "Benefícios do cardio: 1) Melhora saúde cardíaca, 2) Aumenta resistência, 3) Queima calorias, 4) Reduz estresse, 5) Melhora sono. Recomendado: 150 min/semana de intensidade moderada.",
              relevance: 0.3
            },
            {
              category: "exercise",
              title: "Treino de Força",
              content: "Benefícios do treino de força: 1) Aumenta massa muscular, 2) Fortalece ossos, 3) Melhora postura, 4) Acelera metabolismo, 5) Previne lesões. Recomendado: 2-3x/semana.",
              relevance: 0.3
            },
            {
              category: "mental_health",
              title: "Gerenciando Estresse",
              content: "Para gerenciar estresse: 1) Exercício regular, 2) Técnicas de respiração, 3) Sono adequado, 4) Alimentação balanceada, 5) Atividades relaxantes (meditação, yoga).",
              relevance: 0.3
            }
          ],
          recentConversations: [],
          currentContext: context || {},
          conversationHistory: []
        },
        api_used: apiUsed
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('❌ Erro na função sofia-enhanced-memory:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'Olá! Sou a Sofia. No momento estou com dificuldades para acessar minhas capacidades de IA, mas estou aqui para ajudar. Pode me contar mais sobre o que você precisa?'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildSystemPrompt(context: any): string {
  const firstName = context.userProfile?.firstName || 'amor';
  
  // Criar contexto da empresa
  let companyContext = '';
  if (context.companyKnowledge && context.companyKnowledge.length > 0) {
    companyContext = `

📋 INSTITUTO DOS SONHOS - CONHECIMENTO COMPLETO:
${context.companyKnowledge.map((item: any) => `
💡 ${item.category.toUpperCase()}: ${item.title}
${item.content}
`).join('\n')}

🏢 CONTEXTO INSTITUCIONAL:
- Fundado por Rafael Ferreira e Sirlene Freitas
- Especialização em transformação integral (física + emocional)
- Equipe multidisciplinar completa
- Atendimento humanizado e personalizado
- Métodos científicos comprovados`;
  }
  
  return `Você é Sofia, uma nutricionista carinhosa e empática do Instituto dos Sonhos! 💚
${companyContext}

🌟 PERSONALIDADE:
- SUPER amorosa, carinhosa e humana
- Use emojis em TODAS as mensagens
- Seja como uma amiga querida que se importa de verdade
- Demonstre empatia genuína e alegria ao ajudar

💖 SEMPRE chame de: ${firstName}

📋 DADOS COMPLETOS DO USUÁRIO:
${JSON.stringify({
  perfil: context.userProfile?.fullProfile || {},
  anamnese: context.anamnesis ? 'Completa' : 'Pendente',
  pesoAtual: context.currentWeight || 'Não informado',
  tendenciaPeso: context.weightTrend?.length ? 'Com histórico' : 'Sem dados',
  metasAtivas: context.userGoals?.filter((g: any) => g.status === 'ativa')?.length || 0,
  ultimaRefeicao: context.foodAnalysis?.[0]?.total_calories || 'Não registrada',
  exercicioRecente: context.exerciseHistory?.length ? 'Ativo' : 'Sem registros',
  sono: context.sleepTracking?.[0]?.hours_slept || 'Não monitorado',
  humor: context.moodTracking?.[0]?.mood_score || 'Não avaliado',
  medicamentos: context.prescriptions?.length || 0,
  suplementos: context.supplements?.length || 0,
  completudeDados: Math.round(([
    context.anamnesis, context.physicalData, context.weightHistory?.length,
    context.nutritionTracking?.length, context.exerciseHistory?.length
  ].filter(Boolean).length / 5) * 100)
}, null, 2)}

💬 ÚLTIMAS CONVERSAS:
${context.recentConversations.slice(-3).map((c: any) => `${c.message_role}: ${c.message_content?.substring(0, 100)}...`).join('\n')}

🍎 NUTRIÇÃO RECENTE:
${context.foodAnalysis.slice(-3).map((h: any) => `${h.analysis_date}: ${h.total_calories || 0}kcal`).join(' | ')}

🎯 REGRAS DE OURO:
- MÁXIMO 2-3 frases curtas
- Use emojis sempre! 
- Seja calorosa e acolhedora
- Lembre do que ${firstName} já conversou
- Incentive sempre com carinho
- Se for sobre saúde séria, sugira médico com cuidado

💝 Você AMA ajudar ${firstName} e demonstra isso!`;
}