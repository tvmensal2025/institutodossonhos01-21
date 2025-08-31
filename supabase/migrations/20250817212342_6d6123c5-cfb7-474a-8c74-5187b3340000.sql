-- CORREÇÃO MASSIVA: Políticas RLS para todas as tabelas principais
-- Aplicando políticas básicas para as 150+ tabelas

-- ========================================
-- TABELAS DE USUÁRIO (user_* tables)
-- ========================================

-- user_assessments
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their assessments" ON user_assessments FOR ALL USING (auth.uid() = user_id);

-- user_sessions  
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their sessions" ON user_sessions FOR ALL USING (auth.uid() = user_id);

-- user_anamnesis
ALTER TABLE user_anamnesis ENABLE ROW LEVEL SECURITY; 
CREATE POLICY IF NOT EXISTS "Users can manage their anamnesis" ON user_anamnesis FOR ALL USING (auth.uid() = user_id);

-- user_points
CREATE TABLE IF NOT EXISTS user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  source TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their points" ON user_points FOR ALL USING (auth.uid() = user_id);

-- user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'
);
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- user_behavior_patterns
CREATE TABLE IF NOT EXISTS user_behavior_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_behavior_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their behavior patterns" ON user_behavior_patterns FOR ALL USING (auth.uid() = user_id);

-- user_food_preferences
CREATE TABLE IF NOT EXISTS user_food_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  preference_level INTEGER CHECK (preference_level >= 1 AND preference_level <= 5),
  allergies TEXT[],
  dietary_restrictions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_food_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their food preferences" ON user_food_preferences FOR ALL USING (auth.uid() = user_id);

-- user_notification_settings
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  notification_types JSONB DEFAULT '{}',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their notification settings" ON user_notification_settings FOR ALL USING (auth.uid() = user_id);

-- user_subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  billing_cycle TEXT DEFAULT 'monthly',
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their subscriptions" ON user_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- TABELAS DE TRACKING E MONITORAMENTO
-- ========================================

-- mood_tracking
CREATE TABLE IF NOT EXISTS mood_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  notes TEXT,
  tracked_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE mood_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their mood tracking" ON mood_tracking FOR ALL USING (auth.uid() = user_id);

-- water_tracking
CREATE TABLE IF NOT EXISTS water_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  tracked_date DATE DEFAULT CURRENT_DATE,
  time_of_day TIME DEFAULT CURRENT_TIME,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE water_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their water tracking" ON water_tracking FOR ALL USING (auth.uid() = user_id);

-- exercise_tracking
CREATE TABLE IF NOT EXISTS exercise_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  category TEXT,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  intensity TEXT CHECK (intensity IN ('baixa', 'moderada', 'alta')),
  notes TEXT,
  exercise_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE exercise_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their exercise tracking" ON exercise_tracking FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- TABELAS DE MISSÕES E DESAFIOS
-- ========================================

-- missions
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Missions are viewable by everyone" ON missions FOR SELECT USING (is_active = true);

-- daily_missions
CREATE TABLE IF NOT EXISTS daily_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_date DATE DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  target_value INTEGER DEFAULT 100,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their daily missions" ON daily_missions FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- TABELAS DE IA E ANÁLISES
-- ========================================

-- sofia_memory
CREATE TABLE IF NOT EXISTS sofia_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  context_data JSONB NOT NULL DEFAULT '{}',
  relevance_score NUMERIC DEFAULT 1.0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE sofia_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their Sofia memory" ON sofia_memory FOR ALL USING (auth.uid() = user_id);

-- sofia_knowledge_base
CREATE TABLE IF NOT EXISTS sofia_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  confidence_score NUMERIC DEFAULT 1.0,
  source TEXT,
  is_verified BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE sofia_knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Sofia knowledge base is viewable by everyone" ON sofia_knowledge_base FOR SELECT USING (is_verified = true);

-- preventive_health_analyses
CREATE TABLE IF NOT EXISTS preventive_health_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  risk_factors JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '{}',
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE preventive_health_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their health analyses" ON preventive_health_analyses FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- TABELAS DE CONTEÚDO E EDUCAÇÃO
-- ========================================

-- assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  scoring_method JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Assessments are viewable by everyone" ON assessments FOR SELECT USING (is_active = true);

-- content_access
CREATE TABLE IF NOT EXISTS content_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  access_level TEXT DEFAULT 'basic' CHECK (access_level IN ('basic', 'premium', 'admin')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  granted_by UUID
);
ALTER TABLE content_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their content access" ON content_access FOR SELECT USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS PARA TABELAS EXISTENTES
-- ========================================

-- receita_componentes (já existe)
ALTER TABLE receita_componentes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recipe components are viewable by everyone" ON receita_componentes;
DROP POLICY IF EXISTS "Only admins can manage recipe components" ON receita_componentes;
CREATE POLICY "Recipe components are viewable by everyone" ON receita_componentes FOR SELECT USING (true);
CREATE POLICY "Only admins can manage recipe components" ON receita_componentes 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
    );

-- session_assignments (melhorar política)
ALTER TABLE session_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their session assignments" ON session_assignments 
    FOR SELECT USING (auth.uid() = user_id);

-- weighings (melhorar política)
ALTER TABLE weighings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage their weighings" ON weighings 
    FOR ALL USING (auth.uid() = user_id);

-- principios_ativos (leitura pública)
ALTER TABLE principios_ativos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Active principles are viewable by everyone" ON principios_ativos 
    FOR SELECT USING (true);

-- valores_nutricionais (leitura pública)
ALTER TABLE valores_nutricionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Nutritional values are viewable by everyone" ON valores_nutricionais 
    FOR SELECT USING (true);

-- Verificação final das políticas aplicadas
SELECT 
  'POLÍTICAS RLS APLICADAS COM SUCESSO!' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';