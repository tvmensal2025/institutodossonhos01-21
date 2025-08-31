-- =====================================================
-- SISTEMA COMPLETO DE TRACKING - CORREÇÃO DAS TABELAS
-- =====================================================

-- Corrigir tabela water_tracking para incluir coluna date
ALTER TABLE water_tracking 
DROP COLUMN IF EXISTS recorded_at,
ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Corrigir tabela sleep_tracking 
ALTER TABLE sleep_tracking 
DROP COLUMN IF EXISTS sleep_date,
ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Corrigir tabela mood_tracking - adicionar colunas que faltam
ALTER TABLE mood_tracking 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Criar tabela de tracking nutricional se não existir
CREATE TABLE IF NOT EXISTS nutrition_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT CHECK (meal_type IN ('cafe_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia')),
  foods_consumed JSONB DEFAULT '[]'::jsonb,
  total_calories INTEGER DEFAULT 0,
  total_protein DECIMAL(8,2) DEFAULT 0,
  total_carbs DECIMAL(8,2) DEFAULT 0,
  total_fat DECIMAL(8,2) DEFAULT 0,
  total_fiber DECIMAL(8,2) DEFAULT 0,
  total_sugar DECIMAL(8,2) DEFAULT 0,
  total_sodium DECIMAL(8,2) DEFAULT 0,
  notes TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela exercise_tracking se não existir
CREATE TABLE IF NOT EXISTS exercise_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER DEFAULT 0,
  intensity_level TEXT CHECK (intensity_level IN ('baixa', 'moderada', 'alta')),
  notes TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela daily_advanced_tracking se não existir
CREATE TABLE IF NOT EXISTS daily_advanced_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  wake_up_time TIME,
  energy_morning INTEGER CHECK (energy_morning >= 1 AND energy_morning <= 10),
  energy_afternoon INTEGER CHECK (energy_afternoon >= 1 AND energy_afternoon <= 10),
  energy_evening INTEGER CHECK (energy_evening >= 1 AND energy_evening <= 10),
  stress_triggers TEXT[],
  gratitude_notes TEXT[],
  water_goal_ml INTEGER DEFAULT 2000,
  water_current_ml INTEGER DEFAULT 0,
  bedtime TIME,
  sleep_quality_detailed INTEGER CHECK (sleep_quality_detailed >= 1 AND sleep_quality_detailed <= 10),
  dream_recall BOOLEAN DEFAULT false,
  natural_wake BOOLEAN DEFAULT false,
  workout_planned BOOLEAN DEFAULT false,
  workout_completed BOOLEAN DEFAULT false,
  workout_satisfaction INTEGER CHECK (workout_satisfaction >= 1 AND workout_satisfaction <= 10),
  steps_goal INTEGER DEFAULT 10000,
  meal_planning BOOLEAN DEFAULT false,
  mindful_eating BOOLEAN DEFAULT false,
  comfort_eating BOOLEAN DEFAULT false,
  meal_satisfaction INTEGER CHECK (meal_satisfaction >= 1 AND meal_satisfaction <= 10),
  priorities_set BOOLEAN DEFAULT false,
  goals_achieved INTEGER DEFAULT 0,
  focus_level INTEGER CHECK (focus_level >= 1 AND focus_level <= 10),
  day_highlight TEXT,
  improvement_area TEXT,
  tomorrow_intention TEXT,
  personal_growth_moment TEXT,
  daily_score INTEGER CHECK (daily_score >= 1 AND daily_score <= 100),
  tracking_completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- POLÍTICAS RLS PARA AS TABELAS
-- =====================================================

-- Políticas para nutrition_tracking
ALTER TABLE nutrition_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own nutrition tracking" ON nutrition_tracking
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para exercise_tracking
ALTER TABLE exercise_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own exercise tracking" ON exercise_tracking
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para daily_advanced_tracking
ALTER TABLE daily_advanced_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own advanced tracking" ON daily_advanced_tracking
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_user_date ON nutrition_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercise_tracking_user_date ON exercise_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_advanced_tracking_user_date ON daily_advanced_tracking(user_id, date);

-- Corrigir índices existentes
DROP INDEX IF EXISTS idx_water_tracking_user_date;
DROP INDEX IF EXISTS idx_sleep_tracking_user_date; 
DROP INDEX IF EXISTS idx_mood_tracking_user_date;

CREATE INDEX IF NOT EXISTS idx_water_tracking_user_date ON water_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_tracking_user_date ON sleep_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_date ON mood_tracking(user_id, date);

-- =====================================================
-- TRIGGERS PARA TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nutrition_tracking_updated_at
  BEFORE UPDATE ON nutrition_tracking
  FOR EACH ROW EXECUTE FUNCTION update_tracking_updated_at();

CREATE TRIGGER trigger_exercise_tracking_updated_at
  BEFORE UPDATE ON exercise_tracking
  FOR EACH ROW EXECUTE FUNCTION update_tracking_updated_at();

CREATE TRIGGER trigger_daily_advanced_tracking_updated_at
  BEFORE UPDATE ON daily_advanced_tracking
  FOR EACH ROW EXECUTE FUNCTION update_tracking_updated_at();

-- =====================================================
-- FUNÇÃO PARA SALVAR DADOS DE TRACKING AUTOMÁTICO
-- =====================================================

CREATE OR REPLACE FUNCTION save_daily_tracking_data(
  p_user_id UUID,
  p_date DATE,
  p_water_ml INTEGER DEFAULT NULL,
  p_sleep_hours DECIMAL DEFAULT NULL,
  p_sleep_quality INTEGER DEFAULT NULL,
  p_mood_score INTEGER DEFAULT NULL,
  p_energy_level INTEGER DEFAULT NULL,
  p_stress_level INTEGER DEFAULT NULL,
  p_exercise_type TEXT DEFAULT NULL,
  p_exercise_duration INTEGER DEFAULT NULL,
  p_source TEXT DEFAULT 'daily_mission'
)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}';
BEGIN
  -- Salvar água se fornecida
  IF p_water_ml IS NOT NULL THEN
    INSERT INTO water_tracking (user_id, date, amount_ml, source)
    VALUES (p_user_id, p_date, p_water_ml, p_source)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET amount_ml = amount_ml + EXCLUDED.amount_ml;
    
    result := result || jsonb_build_object('water_saved', true);
  END IF;
  
  -- Salvar sono se fornecido
  IF p_sleep_hours IS NOT NULL OR p_sleep_quality IS NOT NULL THEN
    INSERT INTO sleep_tracking (user_id, date, hours, quality, source)
    VALUES (p_user_id, p_date, p_sleep_hours, p_sleep_quality, p_source)
    ON CONFLICT (user_id, date)
    DO UPDATE SET 
      hours = COALESCE(EXCLUDED.hours, sleep_tracking.hours),
      quality = COALESCE(EXCLUDED.quality, sleep_tracking.quality);
    
    result := result || jsonb_build_object('sleep_saved', true);
  END IF;
  
  -- Salvar mood se fornecido
  IF p_mood_score IS NOT NULL OR p_energy_level IS NOT NULL OR p_stress_level IS NOT NULL THEN
    INSERT INTO mood_tracking (user_id, date, mood_score, energy_level, stress_level, source)
    VALUES (p_user_id, p_date, p_mood_score, p_energy_level, p_stress_level, p_source)
    ON CONFLICT (user_id, date)
    DO UPDATE SET 
      mood_score = COALESCE(EXCLUDED.mood_score, mood_tracking.mood_score),
      energy_level = COALESCE(EXCLUDED.energy_level, mood_tracking.energy_level),
      stress_level = COALESCE(EXCLUDED.stress_level, mood_tracking.stress_level);
    
    result := result || jsonb_build_object('mood_saved', true);
  END IF;
  
  -- Salvar exercício se fornecido
  IF p_exercise_type IS NOT NULL THEN
    INSERT INTO exercise_tracking (user_id, date, exercise_type, duration_minutes, source)
    VALUES (p_user_id, p_date, p_exercise_type, p_exercise_duration, p_source)
    ON CONFLICT DO NOTHING;
    
    result := result || jsonb_build_object('exercise_saved', true);
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;