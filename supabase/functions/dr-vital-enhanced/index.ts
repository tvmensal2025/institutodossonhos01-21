import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserCompleteProfile {
  // 1. ANAMNESE MÉDICA COMPLETA
  profile?: {
    full_name: string;
    age?: number;
    email: string;
  };
  
  anamnesis?: {
    // Dados pessoais
    profession?: string;
    marital_status?: string;
    how_found_method?: string;
    
    // Histórico familiar
    family_obesity_history?: boolean;
    family_diabetes_history?: boolean;
    family_heart_disease_history?: boolean;
    family_eating_disorders_history?: boolean;
    family_depression_anxiety_history?: boolean;
    family_thyroid_problems_history?: boolean;
    family_other_chronic_diseases?: string;
    
    // Histórico de peso
    weight_gain_started_age?: number;
    lowest_adult_weight?: number;
    highest_adult_weight?: number;
    major_weight_gain_periods?: string;
    emotional_events_during_weight_gain?: string;
    
    // Tratamentos anteriores
    previous_weight_treatments?: any[];
    had_rebound_effect?: boolean;
    most_effective_treatment?: string;
    least_effective_treatment?: string;
    
    // Medicações atuais
    current_medications?: any[];
    chronic_diseases?: any[];
    supplements?: any[];
    herbal_medicines?: any[];
    
    // Relacionamento com comida
    food_relationship_score?: number;
    has_compulsive_eating?: boolean;
    compulsive_eating_situations?: string;
    problematic_foods?: any[];
    forbidden_foods?: any[];
    feels_guilt_after_eating?: boolean;
    eats_in_secret?: boolean;
    eats_until_uncomfortable?: boolean;
    
    // Qualidade de vida
    sleep_hours_per_night?: number;
    sleep_quality_score?: number;
    daily_stress_level?: number;
    daily_energy_level?: number;
    general_quality_of_life?: number;
    
    // Objetivos
    ideal_weight_goal?: number;
    main_treatment_goals?: string;
    biggest_weight_loss_challenge?: string;
    motivation_for_seeking_treatment?: string;
    timeframe_to_achieve_goal?: string;
    treatment_success_definition?: string;
    
    // Atividade física
    physical_activity_type?: string;
    physical_activity_frequency?: string;
  };
  
  // 2. DADOS FÍSICOS E PESAGENS
  physicalData?: {
    height_cm: number;
    gender: string;
    activity_level: string;
    objetivo: string;
    birth_date?: string;
    peso_objetivo_kg?: number;
    historico_medico?: string[];
    medicamentos?: string[];
    alergias?: string[];
  };
  
  weightHistory?: Array<{
    peso_kg: number;
    imc?: number;
    gordura_corporal_percent?: number;
    massa_muscular_kg?: number;
    agua_corporal_percent?: number;
    metabolismo_basal_kcal?: number;
    idade_metabolica?: number;
    measurement_date: string;
    risco_metabolico?: string;
    device_type?: string;
    circunferencia_abdominal_cm?: number;
    notes?: string;
  }>;
  
  // 3. NUTRIÇÃO E ALIMENTAÇÃO
  nutritionHistory?: Array<{
    date: string;
    meal_type: string;
    total_calories?: number;
    total_protein?: number;
    total_carbs?: number;
    total_fat?: number;
    total_fiber?: number;
    total_sodium?: number;
    foods: any[];
  }>;
  
  foodAnalysis?: Array<{
    analysis_date: string;
    analysis_time: string;
    meal_type: string;
    food_items: any[];
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    sofia_analysis: string;
  }>;
  
  foodPreferences?: {
    preferred_foods?: string[];
    disliked_foods?: string[];
    dietary_restrictions?: string[];
    cooking_skill_level?: string;
    meal_prep_time?: string;
    budget_range?: string;
  };
  
  // 4. EXERCÍCIOS E ATIVIDADE FÍSICA
  exerciseHistory?: Array<{
    date: string;
    exercise_type: string;
    duration_minutes: number;
    calories_burned?: number;
    intensity_level?: string;
    notes?: string;
  }>;
  
  // 5. HIDRATAÇÃO E SONO
  waterTracking?: Array<{
    date: string;
    total_ml: number;
    goal_ml: number;
    times_recorded: number;
  }>;
  
  sleepTracking?: Array<{
    date: string;
    hours_slept: number;
    sleep_quality: number;
    bedtime?: string;
    wake_time?: string;
  }>;
  
  // 6. HUMOR E BEM-ESTAR
  moodTracking?: Array<{
    date: string;
    mood_score: number;
    energy_level: number;
    stress_level: number;
    notes?: string;
  }>;
  
  dailyAdvancedTracking?: Array<{
    date: string;
    energy_morning: number;
    energy_afternoon: number;
    energy_evening: number;
    mood_general: number;
    morning_routine_completed: boolean;
    meditation_minutes: number;
    water_current_ml: number;
    water_goal_ml: number;
    workout_completed: boolean;
  }>;
  
  // 7. METAS E OBJETIVOS
  activeGoals?: Array<{
    title: string;
    description: string;
    category: string;
    target_value: number;
    current_value: number;
    unit: string;
    target_date: string;
    status: string;
    difficulty: string;
  }>;
  
  // 8. MISSÕES E DESAFIOS
  dailyMissions?: Array<{
    date: string;
    total_points: number;
    is_completed: boolean;
    streak_days: number;
    reflection_summary?: string;
  }>;
  
  dailyResponses?: Array<{
    date: string;
    section: string;
    question_id: string;
    answer: string;
    text_response?: string;
    points_earned?: number;
  }>;
  
  achievements?: Array<{
    achievement_type: string;
    title: string;
    description: string;
    icon: string;
    unlocked_at: string;
    progress: number;
    target: number;
  }>;
  
  // 9. ANÁLISES E RELATÓRIOS
  weeklyAnalyses?: Array<{
    week_start_date: string;
    summary: any;
    recommendations: string[];
    progress_score: number;
  }>;
  
  medicalReports?: Array<{
    report_type: string;
    report_data: any;
    created_at: string;
    analysis_summary?: string;
  }>;
  
  // 10. MEDICAMENTOS E SUPLEMENTOS
  prescriptions?: Array<{
    medication_name: string;
    dosage: string;
    frequency: string;
    prescribed_by: string;
    start_date: string;
    end_date?: string;
  }>;
  
  supplements?: Array<{
    supplement_name: string;
    dosage: string;
    frequency: string;
    purpose: string;
    start_date: string;
  }>;
  
  // 11. INTEGRAÇÕES E DISPOSITIVOS
  heartRateData?: Array<{
    recorded_at: string;
    heart_rate_bpm: number;
    activity_type: string;
    zones?: any;
  }>;
  
  // 12. DOCUMENTOS MÉDICOS
  medicalDocuments?: Array<{
    title: string;
    document_type: string;
    file_path: string;
    analysis_status: string;
    report_path?: string;
    analysis_summary?: string;
    created_at: string;
  }>;
  
  // 13. EDUCAÇÃO E CURSOS
  courseProgress?: Array<{
    course_id: string;
    progress_percentage: number;
    completed_lessons: number;
    total_lessons: number;
    time_spent_minutes: number;
  }>;
  
  // 14. COMUNIDADE E SOCIAL
  socialPosts?: Array<{
    content: string;
    post_type: string;
    achievements_data?: any;
    progress_data?: any;
    created_at: string;
  }>;
  
  // Dados de completude
  dataCompleteness?: {
    completionPercentage: number;
    missingData: string[];
    canReceiveAnalysis: boolean;
  };
}

async function getUserCompleteProfile(supabase: any, userId: string): Promise<UserCompleteProfile> {
  const profile: UserCompleteProfile = {};
  
  try {
    console.log('📊 Dr. Vital - Carregando TODOS os dados do usuário...');
    
    // 1. Dados básicos do perfil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, email, age')
      .eq('user_id', userId)
      .single();
    
    if (profileData) {
      profile.profile = profileData;
    }
    
    // 2. Dados físicos
    const { data: physicalData } = await supabase
      .from('user_physical_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (physicalData) {
      profile.physicalData = physicalData;
    }
    
    // 3. Histórico de peso COMPLETO
    const { data: weightData } = await supabase
      .from('weight_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .limit(50);
    
    if (weightData) {
      profile.weightHistory = weightData;
    }
    
    // 4. Anamnese médica COMPLETA
    const { data: anamnesisData } = await supabase
      .from('user_anamnesis')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (anamnesisData) {
      profile.anamnesis = anamnesisData;
    }
    
    // 5. TODAS as metas (não só ativas)
    const { data: goalsData } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (goalsData) {
      profile.activeGoals = goalsData;
    }
    
    // 6. Histórico nutricional COMPLETO (60 dias)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const { data: nutritionData } = await supabase
      .from('nutrition_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('date', sixtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (nutritionData) {
      profile.nutritionHistory = nutritionData;
    }
    
    // 7. Análises de comida (Sofia)
    const { data: foodAnalysisData } = await supabase
      .from('food_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (foodAnalysisData) {
      profile.foodAnalysis = foodAnalysisData;
    }
    
    // 8. Respostas diárias COMPLETAS (60 dias)
    const { data: dailyResponsesData } = await supabase
      .from('daily_responses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', sixtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (dailyResponsesData) {
      profile.dailyResponses = dailyResponsesData;
    }
    
    // 9. Missões diárias COMPLETAS
    const { data: missionsData } = await supabase
      .from('daily_mission_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(60);
    
    if (missionsData) {
      profile.dailyMissions = missionsData;
    }
    
    // 10. TODAS as conquistas
    const { data: achievementsData } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });
    
    if (achievementsData) {
      profile.achievements = achievementsData;
    }
    
    // 11. Preferências alimentares
    const { data: preferencesData } = await supabase
      .from('user_food_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (preferencesData) {
      profile.foodPreferences = preferencesData;
    }
    
    // 12. Exercícios e atividade física
    const { data: exerciseData } = await supabase
      .from('exercise_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(50);
    
    if (exerciseData) {
      profile.exerciseHistory = exerciseData;
    }
    
    // 13. Hidratação e sono
    const { data: waterData } = await supabase
      .from('water_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);
    
    const { data: sleepData } = await supabase
      .from('sleep_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);
    
    if (waterData) profile.waterTracking = waterData;
    if (sleepData) profile.sleepTracking = sleepData;
    
    // 14. Humor e bem-estar
    const { data: moodData } = await supabase
      .from('mood_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);
    
    const { data: advancedData } = await supabase
      .from('daily_advanced_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);
    
    if (moodData) profile.moodTracking = moodData;
    if (advancedData) profile.dailyAdvancedTracking = advancedData;
    
    // 15. Medicamentos e suplementos
    const { data: prescriptionsData } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', userId);
    
    const { data: supplementsData } = await supabase
      .from('user_supplements')
      .select('*')
      .eq('user_id', userId);
    
    if (prescriptionsData) profile.prescriptions = prescriptionsData;
    if (supplementsData) profile.supplements = supplementsData;
    
    // 16. Documentos médicos e exames
    const { data: documentsData } = await supabase
      .from('medical_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (documentsData) profile.medicalDocuments = documentsData;
    
    // 📚 BASE DE CONHECIMENTO DA EMPRESA - INSTITUTO DOS SONHOS
    const { data: companyKnowledge } = await supabase
      .from('company_knowledge_base')
      .select('category, title, content')
      .eq('is_active', true)
      .order('priority', { ascending: false });
    
    if (companyKnowledge) profile.companyKnowledge = companyKnowledge;
    
    // 17. Frequência cardíaca e dados de dispositivos
    const { data: heartRateData } = await supabase
      .from('heart_rate_data')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(50);
    
    if (heartRateData) profile.heartRateData = heartRateData;
    
    // 18. Relatórios e análises
    const { data: reportsData } = await supabase
      .from('medical_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    const { data: weeklyData } = await supabase
      .from('weekly_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(15);
    
    if (reportsData) profile.medicalReports = reportsData;
    if (weeklyData) profile.weeklyAnalyses = weeklyData;
    
    // 19. Progresso em cursos
    const { data: courseData } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (courseData) profile.courseProgress = courseData;
    
    // 20. Comunidade e posts
    const { data: postsData } = await supabase
      .from('health_feed_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (postsData) profile.socialPosts = postsData;
    
    console.log('✅ Dr. Vital - Dados carregados:', {
      perfil: !!profileData,
      anamnese: !!anamnesisData,
      pesos: weightData?.length || 0,
      nutricao: nutritionData?.length || 0,
      exercicios: exerciseData?.length || 0,
      metas: goalsData?.length || 0,
      documentos: documentsData?.length || 0,
      relatorios: reportsData?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Dr. Vital - Erro ao buscar dados completos:', error);
  }
  
  return profile;
}

async function trySelect(supabase: any, table: string, selectExpr: string, filters: Array<[string, any]> = []) {
  try {
    let query = supabase.from(table).select(selectExpr);
    for (const [k, v] of filters) {
      if (k === 'in' && Array.isArray(v)) {
        (query as any) = (query as any).in(v[0], v[1]);
      } else {
        (query as any) = (query as any).eq(k, v);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || null;
  } catch (_err) {
    return null;
  }
}

async function fetchFirstAvailable(
  supabase: any,
  candidates: string[],
  selectExpr: string,
  filters: Array<[string, any]> = []
) {
  for (const table of candidates) {
    const data = await trySelect(supabase, table, selectExpr, filters);
    if (data && ((Array.isArray(data) && data.length) || (!Array.isArray(data) && Object.keys(data).length))) {
      return { table, data } as const;
    }
  }
  return { table: candidates[0], data: null } as const;
}

async function fetchAllFromCandidates(
  supabase: any,
  candidates: string[],
  selectExpr: string,
  filters: Array<[string, any]> = []
) {
  const results: any[] = [];
  for (const table of candidates) {
    const data = await trySelect(supabase, table, selectExpr, filters);
    if (Array.isArray(data) && data.length) {
      results.push(
        ...data.map((row: any) => ({ ...row, _source_table: table }))
      );
    }
  }
  return results;
}

function calculateDataCompleteness(profile: UserCompleteProfile) {
  const checks = [
    { key: 'profile', weight: 10, value: !!profile.profile },
    { key: 'physicalData', weight: 20, value: !!profile.physicalData },
    { key: 'weightHistory', weight: 15, value: profile.weightHistory && profile.weightHistory.length > 0 },
    { key: 'anamnesis', weight: 25, value: !!profile.anamnesis },
    { key: 'activeGoals', weight: 10, value: profile.activeGoals && profile.activeGoals.length > 0 },
    { key: 'nutritionHistory', weight: 10, value: profile.nutritionHistory && profile.nutritionHistory.length > 0 },
    { key: 'dailyResponses', weight: 10, value: profile.dailyResponses && profile.dailyResponses.length > 0 },
  ];
  
  const completedWeight = checks.filter(check => check.value).reduce((sum, check) => sum + check.weight, 0);
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const completionPercentage = Math.round((completedWeight / totalWeight) * 100);
  
  const missingData = checks.filter(check => !check.value).map(check => check.key);
  
  return {
    completionPercentage,
    missingData,
    canReceiveAnalysis: completionPercentage >= 60
  };
}

function createDrVitalSystemPrompt(profile: UserCompleteProfile): string {
  const dataCompleteness = calculateDataCompleteness(profile);
  profile.dataCompleteness = dataCompleteness;

  const currentWeight = profile.weightHistory?.[0]?.peso_kg;
  const previousWeight = profile.weightHistory?.[1]?.peso_kg;
  const weightTrend = currentWeight && previousWeight 
    ? currentWeight > previousWeight ? 'aumentando' : currentWeight < previousWeight ? 'diminuindo' : 'estável'
    : 'indeterminado';

  const latestBMI = profile.weightHistory?.[0]?.imc;
  const metabolicRisk = profile.weightHistory?.[0]?.risco_metabolico;

  // Análise nutricional recente
  const recentNutrition = profile.nutritionHistory?.slice(0, 7); // últimos 7 dias
  const avgDailyCalories = recentNutrition?.length 
    ? Math.round(recentNutrition.reduce((sum, day) => sum + (day.total_calories || 0), 0) / recentNutrition.length)
    : null;

  // Padrões das respostas diárias
  const recentResponses = profile.dailyResponses?.slice(0, 14); // últimas 2 semanas
  const stressPattern = recentResponses?.filter(r => r.question_id === 'stress_level').map(r => parseInt(r.answer)).filter(v => !isNaN(v));
  const energyPattern = recentResponses?.filter(r => r.question_id === 'morning_energy').map(r => parseInt(r.answer)).filter(v => !isNaN(v));
  const sleepPattern = recentResponses?.filter(r => r.question_id === 'sleep_hours').map(r => r.answer);

  const avgStress = stressPattern?.length ? Math.round(stressPattern.reduce((a, b) => a + b, 0) / stressPattern.length) : null;
  const avgEnergy = energyPattern?.length ? Math.round(energyPattern.reduce((a, b) => a + b, 0) / energyPattern.length) : null;

  // Refuerzo de idioma
  const idioma = `Responda SEMPRE em português do Brasil (pt-BR). Nunca mude de idioma, mesmo com temperatura alta. Evite jargões excessivos e mantenha tom elegante e profissional.`;

  return `${idioma}\n\nVocê é o Dr. Vital, médico virtual do Instituto dos Sonhos. Fundado por Rafael Ferreira e Sirlene Freitas, oferecemos atendimento multidisciplinar com nutricionistas, biomédicos e fisioterapeutas.

DADOS COMPLETOS DO PACIENTE:
${JSON.stringify(profile, null, 2)}

ANÁLISE RÁPIDA DOS DADOS:
- Completude dos dados: ${dataCompleteness.completionPercentage}% (${dataCompleteness.canReceiveAnalysis ? 'SUFICIENTE' : 'INSUFICIENTE'} para análise completa)
- Peso atual: ${currentWeight ? `${currentWeight} kg` : 'não informado'}
- Tendência de peso: ${weightTrend}
- IMC atual: ${latestBMI ? latestBMI.toFixed(1) : 'não calculado'}
- Risco metabólico: ${metabolicRisk || 'não avaliado'}
- Calorias médias diárias (7 dias): ${avgDailyCalories || 'não registrado'} kcal
- Nível de estresse médio (14 dias): ${avgStress || 'não registrado'}/10
- Energia matinal média (14 dias): ${avgEnergy || 'não registrado'}/10

DIRETRIZES PARA SUAS RESPOSTAS:
1. Seja DIRETO, PROFISSIONAL e CONCISO
2. Use linguagem simples, evite textos longos
3. Foque em recomendações práticas e seguras baseadas nos dados reais
4. Identifique padrões nos dados históricos
5. Conecte diferentes aspectos (peso, nutrição, sono, stress, atividade física)
6. Dê feedback específico sobre as tendências observadas
7. Sugira ações concretas baseadas no perfil completo
8. Mencione quando dados importantes estão faltando
9. Se completude < 60%, oriente sobre coleta de mais dados
10. Sempre considere histórico familiar e anamnese nas recomendações`;
}

// Heurística simples para checar se o texto parece português
function looksPortuguese(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const stopwords = [' de ', ' que ', ' para ', ' com ', ' você', ' sua', ' seu', ' saúde', ' dados', ' análise', ' risco', ' meta ', ' dormir', ' sono', ' peso'];
  const hasStop = stopwords.some(w => lower.includes(w));
  const latinRatio = (text.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/g)?.length || 0) / Math.max(text.length, 1);
  return hasStop || latinRatio > 0.6;
}

async function translateToPt(service: string, model: string, text: string, openAIKey: string) {
  try {
    if (service === 'gemini') {
      const geminiKey = Deno.env.get('GOOGLE_AI_API_KEY') || Deno.env.get('GEMINI_API_KEY') || '';
      if (!geminiKey) return text;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:generateContent?key=${geminiKey}`;
      const body = {
        contents: [{ role: 'user', parts: [{ text: `Traduza para português do Brasil (pt-BR) com elegância e clareza:
\n${text}` }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 800 }
      };
      const resp = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (resp.ok) { const d = await resp.json(); return d?.candidates?.[0]?.content?.parts?.[0]?.text || text; }
      return text;
    }
    if (service === 'ollama') {
      const base = Deno.env.get('OLLAMA_PROXY_URL') || 'http://localhost:11434';
      const resp = await fetch(`${String(base).replace(/\/$/, '')}/api/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: model || 'llama3.1:8b-instruct-q5_K_M', prompt: `Traduza para português do Brasil (pt-BR), mantendo elegância e clareza:\n\n${text}`, stream: false })
      });
      if (resp.ok) { const d = await resp.json(); return d?.response || text; }
      return text;
    }
    // OpenAI (padrão)
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${openAIKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um tradutor profissional. Traduza para português do Brasil (pt-BR) com elegância e precisão.' },
          { role: 'user', content: text }
        ],
        temperature: 0.2, max_tokens: 800
      })
    });
    if (resp.ok) { const d = await resp.json(); return d?.choices?.[0]?.message?.content || text; }
    return text;
  } catch (_e) {
    return text;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID é obrigatório');
    }

    const url = new URL(req.url);
    const forceService = url.searchParams.get('service');
    const forceModel = url.searchParams.get('model');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseKey = serviceRoleKey || anonKey;
    const openAIKey = Deno.env.get('OPENAI_API_KEY') || '';

    if (!openAIKey || openAIKey.trim() === '') {
      console.error('OPENAI_API_KEY não configurada nas Edge Functions.');
      return new Response(JSON.stringify({
        error: 'OPENAI_API_KEY não configurada nas Edge Functions',
        action: 'Defina a variável em Settings → Functions → Secrets e redeploy a função.'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!supabaseKey) {
      console.error('Nenhuma chave do Supabase disponível (SERVICE_ROLE ou ANON)');
      return new Response(JSON.stringify({
        error: 'Chave do Supabase ausente',
        action: 'Defina SUPABASE_SERVICE_ROLE_KEY (recomendado) ou SUPABASE_ANON_KEY nas Secrets.'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar perfil completo do usuário
    console.log(`🔍 Carregando dados completos para usuário: ${userId}`);
    const userProfile = await getUserCompleteProfile(supabase, userId);

    // Buscar fontes adicionais (com fallbacks de tabela)
    const weightCandidates = ['weight_measurements', 'weighings', 'weight_history', 'measurements', 'user_weights'];
    const nutritionCandidates = ['nutrition_logs', 'nutrition_tracking'];
    const goalsCandidates = ['user_goals', 'goals'];
    const missionsCandidates = ['daily_mission_sessions', 'user_missions', 'missions_log', 'mission_sessions'];
    const achievementsCandidates = ['user_achievements', 'achievements'];
    const documentsCandidates = ['medical_documents', 'lab_results', 'exams', 'user_documents', 'documents', 'medical_exam_results', 'medical_reports'];
    const dailyAnswersCandidates = ['daily_responses', 'daily_answers', 'user_daily_answers'];

    // Tracking geral
    const trackingGroups = {
      activity: ['activity_tracking', 'activity_logs'],
      sleep: ['sleep_tracking', 'sleep_logs'],
      hydration: ['hydration_tracking', 'water_intake_logs'],
      calories: ['calorie_tracking', 'calories_logs']
    } as const;

    // Google Fit
    const googleFitGroups = {
      steps: ['google_fit_steps', 'gf_steps'],
      heartRate: ['google_fit_heart_rate', 'gf_heart_rate'],
      sleep: ['google_fit_sleep', 'gf_sleep'],
      activities: ['google_fit_activities', 'gf_activities'],
      calories: ['google_fit_calories', 'gf_calories'],
      distance: ['google_fit_distance', 'gf_distance'],
      moveMinutes: ['google_fit_move_minutes', 'gf_move_minutes'],
      weight: ['google_fit_weight', 'gf_weight']
    } as const;

    // Coletas principais (primeira tabela disponível)
    const [{ data: weightExtra }, { data: nutritionExtra }, { data: goalsExtra }, { data: missionsExtra }, { data: achievementsExtra }, { data: documentsExtra }, { data: dailyAnswersExtra }] = await Promise.all([
      fetchFirstAvailable(supabase, weightCandidates, '*', [['user_id', userId]]),
      fetchFirstAvailable(supabase, nutritionCandidates, '*', [['user_id', userId]]),
      fetchFirstAvailable(supabase, goalsCandidates, '*', [['user_id', userId]]),
      fetchFirstAvailable(supabase, missionsCandidates, '*', [['user_id', userId]]),
      fetchFirstAvailable(supabase, achievementsCandidates, '*', [['user_id', userId]]),
      fetchFirstAvailable(supabase, documentsCandidates, '*', [['user_id', userId]]),
      fetchFirstAvailable(supabase, dailyAnswersCandidates, '*', [['user_id', userId]])
    ]);

    if (!userProfile.weightHistory && Array.isArray(weightExtra)) userProfile.weightHistory = weightExtra;
    if (!userProfile.nutritionHistory && Array.isArray(nutritionExtra)) userProfile.nutritionHistory = nutritionExtra;
    if (!userProfile.activeGoals && Array.isArray(goalsExtra)) userProfile.activeGoals = goalsExtra;
    if (!userProfile.dailyMissions && Array.isArray(missionsExtra)) userProfile.dailyMissions = missionsExtra as any;
    if (!userProfile.achievements && Array.isArray(achievementsExtra)) userProfile.achievements = achievementsExtra as any;
    (userProfile as any).medicalDocuments = Array.isArray(documentsExtra) ? documentsExtra : [];
    (userProfile as any).dailyAnswers = Array.isArray(dailyAnswersExtra) ? dailyAnswersExtra : [];

    // Tracking geral (merge de múltiplas tabelas)
    const trackingData: any = {};
    for (const [key, tables] of Object.entries(trackingGroups)) {
      trackingData[key] = await fetchAllFromCandidates(supabase, tables as string[], '*', [['user_id', userId]]);
    }
    (userProfile as any).tracking = trackingData;

    // Google Fit (merge por categoria)
    const googleFitData: any = {};
    for (const [key, tables] of Object.entries(googleFitGroups)) {
      googleFitData[key] = await fetchAllFromCandidates(supabase, tables as string[], '*', [['user_id', userId]]);
    }
    (userProfile as any).googleFit = googleFitData;
    
    // Log de dados encontrados
    console.log(`📊 Dados carregados:
    - Perfil: ${!!userProfile.profile}
    - Dados físicos: ${!!userProfile.physicalData}
    - Histórico de peso: ${userProfile.weightHistory?.length || 0} medições
    - Anamnese: ${!!userProfile.anamnesis}
    - Metas ativas: ${userProfile.activeGoals?.length || 0}
    - Histórico nutricional: ${userProfile.nutritionHistory?.length || 0} registros
    - Respostas diárias: ${userProfile.dailyResponses?.length || 0} respostas
    - Missões: ${userProfile.dailyMissions?.length || 0} sessões
    - Conquistas: ${userProfile.achievements?.length || 0}
    - Completude: ${userProfile.dataCompleteness?.completionPercentage || 0}%`);

    // Buscar configuração de IA para Dr. Vital
    const { data: aiConfig } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('functionality', 'medical_analysis')
      .eq('personality', 'drvital')
      .single();

    // Determinar configuração efetiva com base em is_active/is_enabled e fallback seguro
    const defaultConfig = {
      service: 'openai',
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      temperature: 0.6,
    } as const;

    const isConfigActive = !!(aiConfig && (aiConfig.is_active === true || aiConfig.is_enabled === true));
    const rawConfig = isConfigActive ? aiConfig : defaultConfig;

    // Normalizar modelos incompatíveis com Chat Completions
    const normalizeModel = (m: string | undefined): string => {
      const model = String(m || 'gpt-4o-mini').toLowerCase();
      // Para OpenAI
      if (
        model.startsWith('o4') ||
        model.startsWith('o3') ||
        model === 'gpt-4' ||
        model === 'gpt4' ||
        model === 'gpt-4o-2024' ||
        model.includes('gpt-4.1') ||
        model.includes('invalid')
      ) {
        return 'gpt-4o-mini';
      }
      // Para Gemini manter como está (ex.: gemini-1.5-pro)
      if (model.startsWith('gemini')) return model;
      // Para Ollama manter como está (ex.: llama3.1:8b)
      if (model.includes('llama') || model.includes('qwen') || model.includes('mistral') || model.includes('deepseek')) return model;
      if (model === 'gpt-4o') return 'gpt-4o';
      return model;
    };

    const serviceSelected = String((rawConfig as any).service || (rawConfig as any).service_name || 'openai').toLowerCase();

    const effectiveConfig = {
      ...rawConfig,
      service: (forceService || serviceSelected).toLowerCase(),
      model: normalizeModel(forceModel || (rawConfig as any).model),
      max_tokens: (rawConfig as any).max_tokens ?? 1024,
      temperature: (rawConfig as any).temperature ?? 0.6,
    } as typeof defaultConfig & Record<string, any>;

    if (!isConfigActive) {
      console.log('⚠️ Configuração de IA inativa ou ausente. Usando fallback padrão para Dr. Vital.');
    }

    // Criar prompt do sistema personalizado
    const systemPromptBase = createDrVitalSystemPrompt(userProfile);
    const adminPrompt = (aiConfig && (aiConfig as any).system_prompt) ? `Diretrizes do Administrador (prioritárias):\n${(aiConfig as any).system_prompt}\n\n` : '';
    const systemPrompt = `${adminPrompt}${systemPromptBase}`;
    
    console.log(`🤖 Dr. Vital usando modelo: ${effectiveConfig.model}, userId: ${userId}`);

    let aiResponseText = '';

    if (effectiveConfig.service === 'gemini') {
      const geminiKey = Deno.env.get('GOOGLE_AI_API_KEY') || Deno.env.get('GEMINI_API_KEY') || '';
      if (!geminiKey) {
        console.error('GEMINI_API_KEY/GOOGLE_AI_API_KEY não configurada');
      } else {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveConfig.model}:generateContent?key=${geminiKey}`;
          const body = {
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nUsuário: ${message}` }] }
            ],
            generationConfig: {
              temperature: effectiveConfig.temperature,
              maxOutputTokens: effectiveConfig.max_tokens
            }
          };
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (resp.ok) {
            const gdata = await resp.json();
            aiResponseText = gdata?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } else {
            console.error('Erro Gemini:', await resp.text());
          }
        } catch (err) {
          console.error('Exceção Gemini:', err);
        }
      }
    } else if (effectiveConfig.service === 'ollama') {
      const base = Deno.env.get('OLLAMA_PROXY_URL') || 'http://localhost:11434';
      try {
        const resp = await fetch(`${base.replace(/\/$/, '')}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: effectiveConfig.model || 'llama3.1:8b',
            prompt: `${systemPrompt}\n\nUsuário: ${message}`,
            stream: false
          })
        });
        if (resp.ok) {
          const o = await resp.json();
          aiResponseText = o?.response || '';
        } else {
          console.error('Erro Ollama proxy:', await resp.text());
        }
      } catch (err) {
        console.error('Exceção Ollama:', err);
      }
    } else {
      // OpenAI padrão
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: effectiveConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: effectiveConfig.max_tokens,
          temperature: effectiveConfig.temperature,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiResponseText = data.choices?.[0]?.message?.content || '';
      } else {
        console.error('Erro na API OpenAI:', await response.text());
      }
    }

    if (!aiResponseText) {
      // Degradação graciosa
      const fallbackText = `No momento não consegui acessar o modelo de IA configurado (${effectiveConfig.service}). Contudo, com base nos seus dados, posso orientar:\n- Complete seus dados (perfil, anamnese, peso, metas).\n- Registre peso semanal e sono.\n- Descreva sintomas e exames recentes para análise contextual.`;

      return new Response(JSON.stringify({
        response: fallbackText,
        meta: { service: effectiveConfig.service, model: effectiveConfig.model },
        dataCompleteness: userProfile.dataCompleteness,
        dataAvailable: {
          profile: !!userProfile.profile,
          physicalData: !!userProfile.physicalData,
          weightHistory: userProfile.weightHistory?.length || 0,
          anamnesis: !!userProfile.anamnesis,
          goals: userProfile.activeGoals?.length || 0,
          nutrition: userProfile.nutritionHistory?.length || 0,
          dailyResponses: userProfile.dailyResponses?.length || 0,
          missions: userProfile.dailyMissions?.length || 0,
          achievements: userProfile.achievements?.length || 0
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Garantir português
    if (!looksPortuguese(aiResponseText)) {
      try {
        aiResponseText = await translateToPt(effectiveConfig.service, effectiveConfig.model, aiResponseText, openAIKey);
      } catch (_) {
        // manter original se falhar
      }
    }

    // Registrar uso de IA (mesmo com provedores diferentes)
    await supabase.functions.invoke('consume-ai-credit', {
      body: {
        user_id: userId,
        amount: 1,
        feature: 'dr_vital_enhanced'
      }
    });

    return new Response(JSON.stringify({ 
      response: aiResponseText,
      meta: { service: effectiveConfig.service, model: effectiveConfig.model },
      dataCompleteness: userProfile.dataCompleteness,
      dataAvailable: {
        profile: !!userProfile.profile,
        physicalData: !!userProfile.physicalData,
        weightHistory: userProfile.weightHistory?.length || 0,
        anamnesis: !!userProfile.anamnesis,
        goals: userProfile.activeGoals?.length || 0,
        nutrition: userProfile.nutritionHistory?.length || 0,
        dailyResponses: userProfile.dailyResponses?.length || 0,
        missions: userProfile.dailyMissions?.length || 0,
        achievements: userProfile.achievements?.length || 0
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Erro no Dr. Vital Enhanced:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});