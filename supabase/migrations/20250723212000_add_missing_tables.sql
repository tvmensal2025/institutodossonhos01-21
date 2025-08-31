-- Adicionar tabelas para os gráficos que faltam

-- 1. TABELA DE MISSÕES DIÁRIAS
CREATE TABLE IF NOT EXISTS daily_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  date_assigned DATE DEFAULT CURRENT_DATE,
  date_completed TIMESTAMP WITH TIME ZONE,
  difficulty VARCHAR(20) DEFAULT 'medium',
  category VARCHAR(50) DEFAULT 'health',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE PONTUAÇÃO DE USUÁRIOS
CREATE TABLE IF NOT EXISTS user_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  daily_score INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  total_missions INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  level_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 3. TABELA DE HUMOR E BEM-ESTAR
CREATE TABLE IF NOT EXISTS mood_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  mood_emoji VARCHAR(10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 4. TABELA DE RODA DA VIDA
CREATE TABLE IF NOT EXISTS life_wheel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluation_date DATE DEFAULT CURRENT_DATE,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 10),
  family_score INTEGER CHECK (family_score >= 0 AND family_score <= 10),
  career_score INTEGER CHECK (career_score >= 0 AND career_score <= 10),
  finances_score INTEGER CHECK (finances_score >= 0 AND finances_score <= 10),
  relationships_score INTEGER CHECK (relationships_score >= 0 AND relationships_score <= 10),
  personal_growth_score INTEGER CHECK (personal_growth_score >= 0 AND personal_growth_score <= 10),
  leisure_score INTEGER CHECK (leisure_score >= 0 AND leisure_score <= 10),
  spirituality_score INTEGER CHECK (spirituality_score >= 0 AND spirituality_score <= 10),
  overall_satisfaction INTEGER CHECK (overall_satisfaction >= 0 AND overall_satisfaction <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE CATEGORIAS DE ATIVIDADES
CREATE TABLE IF NOT EXISTS activity_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_name VARCHAR(100) NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  avg_score DECIMAL(3,1) DEFAULT 0,
  last_activity_date DATE,
  color_code VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE SESSÕES DE ATIVIDADE
CREATE TABLE IF NOT EXISTS activity_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES activity_categories(id) ON DELETE CASCADE,
  session_date DATE DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 5),
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campos que faltam nas tabelas existentes
ALTER TABLE weight_measurements 
ADD COLUMN IF NOT EXISTS overall_health_score INTEGER CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
ADD COLUMN IF NOT EXISTS vitality_score INTEGER CHECK (vitality_score >= 0 AND vitality_score <= 100);

-- Habilitar RLS nas novas tabelas
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_wheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para daily_missions
CREATE POLICY "Users can view own missions" ON daily_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions" ON daily_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" ON daily_missions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de segurança para user_scores
CREATE POLICY "Users can view own scores" ON user_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON user_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON user_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de segurança para mood_tracking
CREATE POLICY "Users can view own mood" ON mood_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood" ON mood_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood" ON mood_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de segurança para life_wheel
CREATE POLICY "Users can view own life wheel" ON life_wheel
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life wheel" ON life_wheel
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life wheel" ON life_wheel
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de segurança para activity_categories
CREATE POLICY "Users can view own categories" ON activity_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON activity_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON activity_categories
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de segurança para activity_sessions
CREATE POLICY "Users can view own sessions" ON activity_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON activity_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON activity_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date ON daily_missions(user_id, date_assigned DESC);
CREATE INDEX IF NOT EXISTS idx_user_scores_user_date ON user_scores(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_date ON mood_tracking(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_life_wheel_user_date ON life_wheel(user_id, evaluation_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_categories_user ON activity_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_date ON activity_sessions(user_id, session_date DESC);