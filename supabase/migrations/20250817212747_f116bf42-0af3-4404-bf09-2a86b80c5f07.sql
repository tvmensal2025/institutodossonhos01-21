-- ========================================
-- MIGRAÇÃO MASSIVA: CRIAR TODAS AS TABELAS FALTANTES
-- Instituto dos Sonhos - Sistema Completo
-- ========================================

-- ========================================
-- TABELAS DE COMPONENTES E RECEITAS
-- ========================================

-- Componentes de receitas
CREATE TABLE IF NOT EXISTS receita_componentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID,
  ingrediente_id UUID,
  quantidade DECIMAL(10,3),
  unidade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itens de receitas
CREATE TABLE IF NOT EXISTS recipe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL(10,3),
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receitas modelo
CREATE TABLE IF NOT EXISTS receitas_modelo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  ingredientes JSONB DEFAULT '[]',
  instrucoes TEXT,
  tempo_preparo INTEGER,
  porcoes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receitas base
CREATE TABLE IF NOT EXISTS receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alimentos base
CREATE TABLE IF NOT EXISTS alimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  subcategoria TEXT,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELAS DE USUÁRIO E TRACKING
-- ========================================

-- Pesagem dos usuários
CREATE TABLE IF NOT EXISTS weighings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  peso_kg DECIMAL(5,2) NOT NULL,
  data_pesagem DATE DEFAULT CURRENT_DATE,
  massa_muscular_kg DECIMAL(5,2),
  massa_gorda_kg DECIMAL(5,2),
  massa_ossea_kg DECIMAL(5,2),
  agua_corporal_percent DECIMAL(4,2),
  taxa_metabolica_basal INTEGER,
  circunferencia_abdominal_cm DECIMAL(5,2),
  idade_metabolica INTEGER,
  imc DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  responses JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'started',
  session_type TEXT,
  duration_minutes INTEGER,
  notes TEXT,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dados físicos do usuário
CREATE TABLE IF NOT EXISTS user_physical_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  altura_cm DECIMAL(5,2),
  peso_kg DECIMAL(5,2),
  idade INTEGER,
  sexo VARCHAR(10),
  nivel_atividade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progresso do usuário
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  current_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pontos do usuário
CREATE TABLE IF NOT EXISTS user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  source TEXT,
  reason TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conquistas do usuário
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_name TEXT NOT NULL,
  achievement_type TEXT,
  points_earned INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  badge_icon TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELAS DE NUTRIÇÃO E ALIMENTOS
-- ========================================

-- Histórico de ingredientes do usuário
CREATE TABLE IF NOT EXISTS user_ingredient_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  frequency_count INTEGER DEFAULT 1,
  last_used DATE DEFAULT CURRENT_DATE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Associação alimentos-princípios ativos
CREATE TABLE IF NOT EXISTS alimentos_principios_ativos (
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

-- Associação alimentos-doenças
CREATE TABLE IF NOT EXISTS alimentos_doencas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alimento_id UUID,
  doenca_id UUID,
  tipo_relacao TEXT, -- 'benefico', 'neutro', 'prejudicial'
  nivel_evidencia TEXT, -- 'baixo', 'medio', 'alto'
  dosagem_recomendada TEXT,
  contraindicacoes TEXT,
  observacoes TEXT,
  fonte_estudo TEXT,
  data_atualizacao DATE,
  validado_por TEXT,
  score_confiabilidade DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Valores nutricionais completos
CREATE TABLE IF NOT EXISTS valores_nutricionais_completos (
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

-- ========================================
-- TABELAS DE EXERCÍCIO E ATIVIDADE
-- ========================================

-- Tracking de exercícios
CREATE TABLE IF NOT EXISTS exercise_tracking (
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

-- Sessões de exercício
CREATE TABLE IF NOT EXISTS exercise_sessions (
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

-- Categorias de atividade
CREATE TABLE IF NOT EXISTS activity_categories (
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

-- Sessões de atividade
CREATE TABLE IF NOT EXISTS activity_sessions (
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

-- ========================================
-- TABELAS DE MISSÕES E GAMIFICAÇÃO
-- ========================================

-- Missões do usuário
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID,
  status TEXT DEFAULT 'assigned',
  progress DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Missões base
CREATE TABLE IF NOT EXISTS missions (
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

-- Missões diárias
CREATE TABLE IF NOT EXISTS daily_missions (
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

-- Sessões de missões diárias
CREATE TABLE IF NOT EXISTS daily_mission_sessions (
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

-- ========================================
-- TABELAS DE SAÚDE E BEM-ESTAR
-- ========================================

-- Tracking de humor
CREATE TABLE IF NOT EXISTS mood_tracking (
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

-- Tracking de água
CREATE TABLE IF NOT EXISTS water_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  time_of_day TIME,
  source TEXT, -- 'agua', 'cha', 'cafe', etc
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracking de sono
CREATE TABLE IF NOT EXISTS sleep_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_date DATE DEFAULT CURRENT_DATE,
  bedtime TIME,
  wake_time TIME,
  duration_hours DECIMAL(3,1),
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dados de frequência cardíaca
CREATE TABLE IF NOT EXISTS heart_rate_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  heart_rate_bpm INTEGER NOT NULL,
  measurement_type TEXT, -- 'resting', 'active', 'max', 'recovery'
  activity_context TEXT,
  device_source TEXT,
  confidence_level DECIMAL(3,2),
  zone TEXT, -- 'fat_burn', 'cardio', 'peak', etc
  duration_seconds INTEGER,
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELAS DE ANÁLISES E RELATÓRIOS
-- ========================================

-- Análises preventivas de saúde
CREATE TABLE IF NOT EXISTS preventive_health_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  results JSONB DEFAULT '{}',
  recommendations TEXT[],
  risk_score DECIMAL(5,2),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Análises semanais
CREATE TABLE IF NOT EXISTS weekly_analyses (
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

-- Insights semanais
CREATE TABLE IF NOT EXISTS weekly_insights (
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

-- ========================================
-- TABELAS DE CONFIGURAÇÕES E PREFERÊNCIAS
-- ========================================

-- Configurações de notificação do usuário
CREATE TABLE IF NOT EXISTS user_notification_settings (
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

-- Preferências de notificação
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'daily',
  time_of_day TIME,
  days_of_week INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comportamentos do usuário
CREATE TABLE IF NOT EXISTS user_behavior_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB DEFAULT '{}',
  frequency_score DECIMAL(5,2),
  last_occurrence TIMESTAMP WITH TIME ZONE,
  trend_direction TEXT, -- 'increasing', 'decreasing', 'stable'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Preferências alimentares do usuário
CREATE TABLE IF NOT EXISTS user_food_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_item TEXT NOT NULL,
  preference_type TEXT, -- 'like', 'dislike', 'allergy', 'intolerance'
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
  notes TEXT,
  dietary_restriction BOOLEAN DEFAULT false,
  medical_reason BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- FIM DA MIGRAÇÃO MASSIVA
-- ========================================

-- Criar índices básicos para performance
CREATE INDEX IF NOT EXISTS idx_weighings_user_date ON weighings(user_id, data_pesagem);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_tracking_user_date ON exercise_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_date ON mood_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_tracking_user_date ON water_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_tracking_user_date ON sleep_tracking(user_id, sleep_date);

SELECT 'MIGRAÇÃO MASSIVA CONCLUÍDA - TODAS AS TABELAS PRINCIPAIS CRIADAS!' as status;