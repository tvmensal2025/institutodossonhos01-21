-- Criar todas as tabelas faltantes identificadas
-- Execute este script no Supabase SQL Editor

-- 1. Alimentos (se não existir)
CREATE TABLE IF NOT EXISTS public.alimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  subcategoria TEXT,
  calorias_por_100g NUMERIC,
  proteinas_g NUMERIC,
  carboidratos_g NUMERIC,
  gorduras_g NUMERIC,
  fibras_g NUMERIC,
  acucares_g NUMERIC,
  sodio_mg NUMERIC,
  potassio_mg NUMERIC,
  calcio_mg NUMERIC,
  ferro_mg NUMERIC,
  magnesio_mg NUMERIC,
  fosforo_mg NUMERIC,
  zinco_mg NUMERIC,
  vitamina_a_mcg NUMERIC,
  vitamina_c_mg NUMERIC,
  vitamina_d_mcg NUMERIC,
  vitamina_e_mg NUMERIC,
  vitamina_k_mcg NUMERIC,
  tiamina_mg NUMERIC,
  riboflavina_mg NUMERIC,
  niacina_mg NUMERIC,
  vitamina_b6_mg NUMERIC,
  folato_mcg NUMERIC,
  vitamina_b12_mcg NUMERIC,
  colesterol_mg NUMERIC,
  acidos_graxos_saturados_g NUMERIC,
  acidos_graxos_monoinsaturados_g NUMERIC,
  acidos_graxos_poliinsaturados_g NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Receitas
CREATE TABLE IF NOT EXISTS public.receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  dificuldade TEXT DEFAULT 'facil',
  tempo_preparo_minutos INTEGER,
  rendimento_porcoes INTEGER,
  calorias_por_porcao NUMERIC,
  modo_preparo TEXT,
  observacoes TEXT,
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recipe Items
CREATE TABLE IF NOT EXISTS public.recipe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID REFERENCES public.receitas(id) ON DELETE CASCADE,
  alimento_id UUID REFERENCES public.alimentos(id),
  quantidade NUMERIC NOT NULL,
  unidade TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Receitas Modelo
CREATE TABLE IF NOT EXISTS public.receitas_modelo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  ingredientes JSONB DEFAULT '[]',
  instrucoes TEXT,
  tempo_preparo INTEGER,
  porcoes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  badge_icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Points
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  source TEXT,
  reason TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  context_type TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Conversation Messages
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. User Assessments
CREATE TABLE IF NOT EXISTS public.user_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  assessment_data JSONB NOT NULL,
  score NUMERIC,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Exercise Tracking
CREATE TABLE IF NOT EXISTS public.exercise_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  intensity_level TEXT,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  exercise_type TEXT,
  equipment_used TEXT[],
  heart_rate_avg INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Exercise Sessions
CREATE TABLE IF NOT EXISTS public.exercise_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name TEXT,
  exercises JSONB DEFAULT '[]',
  total_duration INTEGER,
  total_calories INTEGER,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  workout_type TEXT,
  difficulty_rating INTEGER,
  satisfaction_rating INTEGER,
  coach_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Activity Categories
CREATE TABLE IF NOT EXISTS public.activity_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color_code TEXT,
  calories_per_minute DECIMAL(4,2),
  intensity_level TEXT,
  equipment_required TEXT[],
  muscle_groups TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Activity Sessions
CREATE TABLE IF NOT EXISTS public.activity_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  intensity_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Missions
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty_level TEXT,
  points_reward INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Daily Missions
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  points_reward INTEGER DEFAULT 0,
  target_value DECIMAL(10,2),
  target_unit TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  difficulty TEXT DEFAULT 'facil',
  completion_criteria JSONB DEFAULT '{}',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Daily Mission Sessions
CREATE TABLE IF NOT EXISTS public.daily_mission_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending',
  progress DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  points_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Mood Tracking
CREATE TABLE IF NOT EXISTS public.mood_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Water Tracking
CREATE TABLE IF NOT EXISTS public.water_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  time_of_day TIME,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Heart Rate Data
CREATE TABLE IF NOT EXISTS public.heart_rate_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  heart_rate_bpm INTEGER NOT NULL,
  measurement_type TEXT,
  activity_context TEXT,
  device_source TEXT,
  confidence_level DECIMAL(3,2),
  zone TEXT,
  duration_seconds INTEGER,
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Preventive Health Analyses
CREATE TABLE IF NOT EXISTS public.preventive_health_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  results JSONB DEFAULT '{}',
  recommendations TEXT[],
  risk_score DECIMAL(5,2),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. Weekly Analyses
CREATE TABLE IF NOT EXISTS public.weekly_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  summary_data JSONB DEFAULT '{}',
  insights TEXT[],
  recommendations TEXT[],
  overall_score DECIMAL(4,2),
  trends JSONB DEFAULT '{}',
  goals_progress JSONB DEFAULT '{}',
  health_metrics JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. Weekly Insights
CREATE TABLE IF NOT EXISTS public.weekly_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_date DATE NOT NULL,
  insight_type TEXT,
  title TEXT,
  content TEXT,
  data_points JSONB DEFAULT '{}',
  recommendations TEXT[],
  priority_level INTEGER DEFAULT 1,
  action_items TEXT[],
  progress_indicators JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. User Notification Settings
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  daily_reminders BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT true,
  achievement_alerts BOOLEAN DEFAULT true,
  meal_reminders BOOLEAN DEFAULT true,
  exercise_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'daily',
  time_of_day TIME,
  days_of_week INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. User Behavior Patterns
CREATE TABLE IF NOT EXISTS public.user_behavior_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB DEFAULT '{}',
  frequency_score DECIMAL(5,2),
  last_occurrence TIMESTAMP WITH TIME ZONE,
  trend_direction TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 26. User Food Preferences
CREATE TABLE IF NOT EXISTS public.user_food_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_item TEXT NOT NULL,
  preference_type TEXT,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
  notes TEXT,
  dietary_restriction BOOLEAN DEFAULT false,
  medical_reason BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 27. Alimentos Principios Ativos
CREATE TABLE IF NOT EXISTS public.alimentos_principios_ativos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alimento_id UUID,
  principio_ativo_id UUID,
  concentracao DECIMAL(10,4),
  unidade TEXT,
  biodisponibilidade DECIMAL(5,2),
  forma_consumo TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 28. Alimentos Doencas
CREATE TABLE IF NOT EXISTS public.alimentos_doencas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alimento_id UUID,
  doenca_id UUID,
  tipo_relacao TEXT,
  nivel_evidencia TEXT,
  dosagem_recomendada TEXT,
  contraindicacoes TEXT,
  observacoes TEXT,
  fonte_estudo TEXT,
  data_atualizacao DATE,
  validado_por TEXT,
  score_confiabilidade DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 29. Valores Nutricionais Completos
CREATE TABLE IF NOT EXISTS public.valores_nutricionais_completos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alimento_id UUID,
  nutriente TEXT NOT NULL,
  valor DECIMAL(10,4),
  unidade TEXT,
  por_100g BOOLEAN DEFAULT true,
  fonte_dados TEXT,
  confiabilidade DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas_modelo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_mission_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heart_rate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_health_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alimentos_principios_ativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alimentos_doencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valores_nutricionais_completos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas para dados públicos
CREATE POLICY "Alimentos are viewable by everyone" ON public.alimentos
  FOR SELECT USING (true);

CREATE POLICY "Receitas modelo are viewable by everyone" ON public.receitas_modelo
  FOR SELECT USING (true);

CREATE POLICY "Activity categories are viewable by everyone" ON public.activity_categories
  FOR SELECT USING (true);

CREATE POLICY "Missions are viewable by everyone" ON public.missions
  FOR SELECT USING (true);

CREATE POLICY "Daily missions are viewable by everyone" ON public.daily_missions
  FOR SELECT USING (true);

-- Políticas RLS para dados de usuário
CREATE POLICY "Users can manage their own data" ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own points" ON public.user_points
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their assessments" ON public.user_assessments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their exercise tracking" ON public.exercise_tracking
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their exercise sessions" ON public.exercise_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their activity sessions" ON public.activity_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their mission sessions" ON public.daily_mission_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their mood tracking" ON public.mood_tracking
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their water tracking" ON public.water_tracking
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their heart rate data" ON public.heart_rate_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their health analyses" ON public.preventive_health_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their weekly analyses" ON public.weekly_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their weekly insights" ON public.weekly_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notification settings" ON public.user_notification_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their behavior patterns" ON public.user_behavior_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their food preferences" ON public.user_food_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para dados relacionais
CREATE POLICY "Users can view recipe items for public recipes" ON public.recipe_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.receitas r 
    WHERE r.id = recipe_items.receita_id 
    AND (r.is_public = true OR r.created_by = auth.uid())
  ));

CREATE POLICY "Users can manage conversation messages for their conversations" ON public.conversation_messages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_messages.conversation_id 
    AND c.user_id = auth.uid()
  ));

-- Políticas para dados nutricionais
CREATE POLICY "Nutritional data is viewable by everyone" ON public.alimentos_principios_ativos
  FOR SELECT USING (true);

CREATE POLICY "Disease relationships are viewable by everyone" ON public.alimentos_doencas
  FOR SELECT USING (true);

CREATE POLICY "Complete nutritional values are viewable by everyone" ON public.valores_nutricionais_completos
  FOR SELECT USING (true);

-- Notificar reload do schema
NOTIFY pgrst, 'reload schema';

SELECT 'Todas as tabelas faltantes foram criadas com sucesso!' as status;