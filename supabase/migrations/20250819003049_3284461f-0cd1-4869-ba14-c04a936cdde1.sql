-- =====================================================
-- CORREÇÃO DAS ESTRUTURAS DE TRACKING - DADOS CORRETOS
-- =====================================================

-- Verificar e corrigir estrutura da tabela water_tracking
DO $$ 
BEGIN
    -- Remover coluna recorded_at se existir e adicionar date
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'water_tracking' AND column_name = 'recorded_at') THEN
        ALTER TABLE water_tracking DROP COLUMN recorded_at;
    END IF;
    
    -- Adicionar coluna date se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'water_tracking' AND column_name = 'date') THEN
        ALTER TABLE water_tracking ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    -- Adicionar coluna source se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'water_tracking' AND column_name = 'source') THEN
        ALTER TABLE water_tracking ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;
END $$;

-- Verificar e corrigir estrutura da tabela sleep_tracking
DO $$ 
BEGIN
    -- Remover coluna sleep_date se existir e adicionar date
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sleep_tracking' AND column_name = 'sleep_date') THEN
        ALTER TABLE sleep_tracking DROP COLUMN sleep_date;
    END IF;
    
    -- Adicionar coluna date se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sleep_tracking' AND column_name = 'date') THEN
        ALTER TABLE sleep_tracking ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    -- Adicionar coluna source se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sleep_tracking' AND column_name = 'source') THEN
        ALTER TABLE sleep_tracking ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;
END $$;

-- Verificar e corrigir estrutura da tabela mood_tracking
DO $$ 
BEGIN
    -- Adicionar coluna source se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_tracking' AND column_name = 'source') THEN
        ALTER TABLE mood_tracking ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;
END $$;

-- =====================================================
-- CRIAR TABELAS NOVAS NECESSÁRIAS
-- =====================================================

-- Criar tabela nutrition_tracking
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

-- Criar tabela exercise_tracking
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

-- Criar tabela daily_advanced_tracking
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
-- HABILITAR RLS E CRIAR POLÍTICAS
-- =====================================================

-- Políticas para nutrition_tracking
ALTER TABLE nutrition_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own nutrition tracking" ON nutrition_tracking;
CREATE POLICY "Users can manage their own nutrition tracking" ON nutrition_tracking
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para exercise_tracking  
ALTER TABLE exercise_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own exercise tracking" ON exercise_tracking;
CREATE POLICY "Users can manage their own exercise tracking" ON exercise_tracking
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para daily_advanced_tracking
ALTER TABLE daily_advanced_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own advanced tracking" ON daily_advanced_tracking;
CREATE POLICY "Users can manage their own advanced tracking" ON daily_advanced_tracking
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CRIAR ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_user_date ON nutrition_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercise_tracking_user_date ON exercise_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_advanced_tracking_user_date ON daily_advanced_tracking(user_id, date);

-- Recriar índices existentes se necessário
DROP INDEX IF EXISTS idx_water_tracking_user_date;
DROP INDEX IF EXISTS idx_sleep_tracking_user_date; 
DROP INDEX IF EXISTS idx_mood_tracking_user_date;

CREATE INDEX IF NOT EXISTS idx_water_tracking_user_date ON water_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_tracking_user_date ON sleep_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_date ON mood_tracking(user_id, date);

-- =====================================================
-- CONSTRAINTS ÚNICOS
-- =====================================================

-- Garantir que não há duplicados por usuário/data
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_water_tracking_user_date' 
        AND table_name = 'water_tracking'
    ) THEN
        ALTER TABLE water_tracking ADD CONSTRAINT unique_water_tracking_user_date UNIQUE (user_id, date);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_sleep_tracking_user_date' 
        AND table_name = 'sleep_tracking'
    ) THEN
        ALTER TABLE sleep_tracking ADD CONSTRAINT unique_sleep_tracking_user_date UNIQUE (user_id, date);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_mood_tracking_user_date' 
        AND table_name = 'mood_tracking'
    ) THEN
        ALTER TABLE mood_tracking ADD CONSTRAINT unique_mood_tracking_user_date UNIQUE (user_id, date);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;