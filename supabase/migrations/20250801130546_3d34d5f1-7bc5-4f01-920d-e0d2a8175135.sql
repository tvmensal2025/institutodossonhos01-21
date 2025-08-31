-- =====================================================
-- MISSÃO EXPANDIDA: 8 TIPOS DE TRACKING + PERGUNTAS EXTRAS
-- =====================================================

-- Aplicar as tabelas de tracking se ainda não existem
CREATE TABLE IF NOT EXISTS water_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS sleep_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(3,1),
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS mood_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  day_rating INTEGER CHECK (day_rating >= 1 AND day_rating <= 5),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- EXPANDIR TABELAS EXISTENTES COM NOVOS CAMPOS
-- =====================================================

-- Adicionar campos extras para weight_measurements
ALTER TABLE weight_measurements 
ADD COLUMN IF NOT EXISTS muscle_mass_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS body_fat_percent DECIMAL(4,1),
ADD COLUMN IF NOT EXISTS visceral_fat_level INTEGER,
ADD COLUMN IF NOT EXISTS bone_mass_kg DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS metabolic_age INTEGER,
ADD COLUMN IF NOT EXISTS water_percent DECIMAL(4,1);

-- Adicionar campos extras para exercise_tracking  
ALTER TABLE exercise_tracking
ADD COLUMN IF NOT EXISTS target_achieved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS motivation_level INTEGER CHECK (motivation_level >= 1 AND motivation_level <= 5),
ADD COLUMN IF NOT EXISTS energy_after INTEGER CHECK (energy_after >= 1 AND energy_after <= 5);

-- Adicionar campos extras para heart_rate_data
ALTER TABLE heart_rate_data
ADD COLUMN IF NOT EXISTS zone_time JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_hr INTEGER,
ADD COLUMN IF NOT EXISTS resting_hr INTEGER;

-- Adicionar campos extras para food_analysis
ALTER TABLE food_analysis 
ADD COLUMN IF NOT EXISTS satisfaction_level INTEGER CHECK (satisfaction_level >= 1 AND satisfaction_level <= 5),
ADD COLUMN IF NOT EXISTS hunger_before INTEGER CHECK (hunger_before >= 1 AND hunger_before <= 5),
ADD COLUMN IF NOT EXISTS hunger_after INTEGER CHECK (hunger_after >= 1 AND hunger_after <= 5),
ADD COLUMN IF NOT EXISTS emotional_state TEXT;

-- =====================================================
-- NOVA TABELA: TRACKING AVANÇADO DIÁRIO
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_advanced_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Hábitos Matinais
  wake_up_time TIME,
  first_drink TEXT,
  morning_routine_completed BOOLEAN DEFAULT false,
  meditation_minutes INTEGER DEFAULT 0,
  
  -- Energia & Humor
  energy_morning INTEGER CHECK (energy_morning >= 1 AND energy_morning <= 5),
  energy_afternoon INTEGER CHECK (energy_afternoon >= 1 AND energy_afternoon <= 5),
  energy_evening INTEGER CHECK (energy_evening >= 1 AND energy_evening <= 5),
  mood_general INTEGER CHECK (mood_general >= 1 AND mood_general <= 5),
  stress_triggers TEXT,
  gratitude_notes TEXT,
  
  -- Hidratação Detalhada
  water_goal_ml INTEGER DEFAULT 2000,
  water_current_ml INTEGER DEFAULT 0,
  reminded_to_drink INTEGER DEFAULT 0,
  
  -- Sono Detalhado
  bedtime TIME,
  sleep_quality_notes TEXT,
  dreams_remembered BOOLEAN DEFAULT false,
  wake_up_naturally BOOLEAN DEFAULT false,
  
  -- Exercício Detalhado
  workout_planned BOOLEAN DEFAULT false,
  workout_completed BOOLEAN DEFAULT false,
  workout_enjoyment INTEGER CHECK (workout_enjoyment >= 1 AND workout_enjoyment <= 5),
  steps_goal INTEGER DEFAULT 10000,
  steps_current INTEGER DEFAULT 0,
  
  -- Alimentação
  meals_planned BOOLEAN DEFAULT false,
  eating_mindfully BOOLEAN DEFAULT false,
  comfort_eating BOOLEAN DEFAULT false,
  satisfied_with_food BOOLEAN DEFAULT true,
  
  -- Produtividade
  priorities_set BOOLEAN DEFAULT false,
  goals_achieved INTEGER DEFAULT 0,
  focus_level INTEGER CHECK (focus_level >= 1 AND focus_level <= 5),
  
  -- Reflexões
  day_highlight TEXT,
  improvement_area TEXT,
  tomorrow_intention TEXT,
  personal_growth_moment TEXT,
  
  -- Tracking Score
  daily_score INTEGER DEFAULT 0,
  tracking_completion_percent INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- NOVA TABELA: CONQUISTAS DE TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS tracking_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  tracking_category TEXT NOT NULL, -- water, sleep, exercise, etc.
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  points_earned INTEGER DEFAULT 0,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  streak_days INTEGER DEFAULT 0,
  target_value INTEGER,
  current_value INTEGER,
  is_milestone BOOLEAN DEFAULT false
);

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

-- daily_advanced_tracking
ALTER TABLE daily_advanced_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own advanced tracking" ON daily_advanced_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own advanced tracking" ON daily_advanced_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advanced tracking" ON daily_advanced_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- tracking_achievements
ALTER TABLE tracking_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tracking achievements" ON tracking_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracking achievements" ON tracking_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNÇÃO: CALCULAR SCORE DIÁRIO
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_daily_tracking_score(p_user_id UUID, p_date DATE)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  tracking_record RECORD;
BEGIN
  -- Buscar dados do tracking avançado
  SELECT * INTO tracking_record 
  FROM daily_advanced_tracking 
  WHERE user_id = p_user_id AND date = p_date;
  
  IF tracking_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Cálculo do score baseado em diferentes critérios
  -- Energia (max 20 pontos)
  IF tracking_record.energy_morning >= 4 THEN score := score + 5; END IF;
  IF tracking_record.energy_afternoon >= 4 THEN score := score + 5; END IF;
  IF tracking_record.energy_evening >= 3 THEN score := score + 5; END IF;
  IF tracking_record.mood_general >= 4 THEN score := score + 5; END IF;
  
  -- Hábitos (max 30 pontos)
  IF tracking_record.morning_routine_completed THEN score := score + 10; END IF;
  IF tracking_record.meditation_minutes > 0 THEN score := score + 5; END IF;
  IF tracking_record.water_current_ml >= tracking_record.water_goal_ml THEN score := score + 10; END IF;
  IF tracking_record.workout_completed THEN score := score + 5; END IF;
  
  -- Sono (max 20 pontos)
  IF tracking_record.wake_up_naturally THEN score := score + 10; END IF;
  IF tracking_record.dreams_remembered THEN score := score + 5; END IF;
  IF tracking_record.bedtime IS NOT NULL THEN score := score + 5; END IF;
  
  -- Alimentação (max 15 pontos)
  IF tracking_record.meals_planned THEN score := score + 5; END IF;
  IF tracking_record.eating_mindfully THEN score := score + 5; END IF;
  IF NOT tracking_record.comfort_eating THEN score := score + 5; END IF;
  
  -- Produtividade (max 15 pontos)
  IF tracking_record.priorities_set THEN score := score + 5; END IF;
  IF tracking_record.goals_achieved > 0 THEN score := score + 5; END IF;
  IF tracking_record.focus_level >= 4 THEN score := score + 5; END IF;
  
  -- Atualizar score na tabela
  UPDATE daily_advanced_tracking 
  SET daily_score = score,
      tracking_completion_percent = (score * 100 / 100) -- Score máximo 100
  WHERE user_id = p_user_id AND date = p_date;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: VERIFICAR CONQUISTAS AUTOMÁTICAS
-- =====================================================

CREATE OR REPLACE FUNCTION check_tracking_achievements()
RETURNS TRIGGER AS $$
DECLARE
  streak_days INTEGER;
  water_streak INTEGER;
  exercise_streak INTEGER;
BEGIN
  -- Verificar streak de água (7 dias consecutivos atingindo meta)
  SELECT COUNT(*) INTO water_streak
  FROM daily_advanced_tracking
  WHERE user_id = NEW.user_id 
    AND date >= NEW.date - INTERVAL '6 days'
    AND date <= NEW.date
    AND water_current_ml >= water_goal_ml;
  
  IF water_streak >= 7 THEN
    INSERT INTO tracking_achievements (user_id, achievement_type, tracking_category, title, description, icon, points_earned, streak_days)
    VALUES (NEW.user_id, 'water_streak_7', 'water', 'Hidratação Perfeita', 'Atingiu meta de água por 7 dias seguidos', '💧', 100, 7)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Verificar streak de exercício
  SELECT COUNT(*) INTO exercise_streak
  FROM daily_advanced_tracking
  WHERE user_id = NEW.user_id 
    AND date >= NEW.date - INTERVAL '6 days'
    AND date <= NEW.date
    AND workout_completed = true;
  
  IF exercise_streak >= 7 THEN
    INSERT INTO tracking_achievements (user_id, achievement_type, tracking_category, title, description, icon, points_earned, streak_days)
    VALUES (NEW.user_id, 'exercise_streak_7', 'exercise', 'Atleta Consistente', 'Exercitou-se por 7 dias seguidos', '🏃‍♀️', 150, 7)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Verificar score perfeito
  IF NEW.daily_score >= 90 THEN
    INSERT INTO tracking_achievements (user_id, achievement_type, tracking_category, title, description, icon, points_earned)
    VALUES (NEW.user_id, 'perfect_day', 'general', 'Dia Perfeito', 'Atingiu score de 90+ pontos', '⭐', 200)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_tracking_achievements
  AFTER INSERT OR UPDATE ON daily_advanced_tracking
  FOR EACH ROW
  EXECUTE FUNCTION check_tracking_achievements();

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_daily_advanced_tracking_user_date ON daily_advanced_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tracking_achievements_user_type ON tracking_achievements(user_id, achievement_type);
CREATE INDEX IF NOT EXISTS idx_tracking_achievements_category ON tracking_achievements(tracking_category);

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE daily_advanced_tracking IS 'Tracking diário avançado com 8 categorias principais';
COMMENT ON TABLE tracking_achievements IS 'Conquistas e marcos de tracking';

COMMENT ON COLUMN daily_advanced_tracking.daily_score IS 'Score diário calculado (0-100)';
COMMENT ON COLUMN daily_advanced_tracking.tracking_completion_percent IS 'Percentual de completude do tracking';
COMMENT ON COLUMN tracking_achievements.is_milestone IS 'Indica se é uma conquista marco importante';