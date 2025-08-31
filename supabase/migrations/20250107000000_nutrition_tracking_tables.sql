-- ========================================
-- OPENNUTRITRACKER - TABELAS DE TRACKING
-- Sistema de rastreamento nutricional avançado
-- ========================================

-- 1. TABELA DE TRACKING NUTRICIONAL
CREATE TABLE IF NOT EXISTS nutrition_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  foods JSONB NOT NULL, -- Array de alimentos com nome, quantidade e unidade
  total_calories INTEGER NOT NULL,
  total_protein DECIMAL(5,2) NOT NULL,
  total_carbs DECIMAL(5,2) NOT NULL,
  total_fat DECIMAL(5,2) NOT NULL,
  total_fiber DECIMAL(5,2) NOT NULL,
  total_sugar DECIMAL(5,2) DEFAULT 0,
  total_sodium DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE METAS NUTRICIONAIS
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calories INTEGER NOT NULL DEFAULT 2000,
  protein DECIMAL(5,2) NOT NULL DEFAULT 150,
  carbs DECIMAL(5,2) NOT NULL DEFAULT 250,
  fat DECIMAL(5,2) NOT NULL DEFAULT 65,
  fiber DECIMAL(5,2) NOT NULL DEFAULT 25,
  sugar DECIMAL(5,2) DEFAULT 50,
  sodium DECIMAL(5,2) DEFAULT 2300,
  -- Metas específicas por dieta
  is_keto BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_paleo BOOLEAN DEFAULT false,
  is_mediterranean BOOLEAN DEFAULT false,
  -- Metas de micronutrientes
  vitamin_c_goal DECIMAL(5,2) DEFAULT 90,
  vitamin_d_goal DECIMAL(5,2) DEFAULT 15,
  calcium_goal DECIMAL(5,2) DEFAULT 1000,
  iron_goal DECIMAL(5,2) DEFAULT 18,
  omega3_goal DECIMAL(5,2) DEFAULT 1.6,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. TABELA DE ALIMENTOS FAVORITOS
CREATE TABLE IF NOT EXISTS nutrition_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  food_id TEXT, -- ID do alimento na base OpenNutriTracker
  category TEXT,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, food_name)
);

-- 4. TABELA DE PADRÕES ALIMENTARES
CREATE TABLE IF NOT EXISTS nutrition_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'meal_timing', 'food_combination', 'nutrient_balance'
  pattern_description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  context_data JSONB, -- Dados adicionais sobre o padrão
  is_active BOOLEAN DEFAULT true,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE HISTÓRICO NUTRICIONAL DIÁRIO
CREATE TABLE IF NOT EXISTS nutrition_daily_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calories INTEGER DEFAULT 0,
  total_protein DECIMAL(5,2) DEFAULT 0,
  total_carbs DECIMAL(5,2) DEFAULT 0,
  total_fat DECIMAL(5,2) DEFAULT 0,
  total_fiber DECIMAL(5,2) DEFAULT 0,
  total_sugar DECIMAL(5,2) DEFAULT 0,
  total_sodium DECIMAL(5,2) DEFAULT 0,
  -- Micronutrientes
  total_vitamin_c DECIMAL(5,2) DEFAULT 0,
  total_vitamin_d DECIMAL(5,2) DEFAULT 0,
  total_calcium DECIMAL(5,2) DEFAULT 0,
  total_iron DECIMAL(5,2) DEFAULT 0,
  total_omega3 DECIMAL(5,2) DEFAULT 0,
  -- Métricas de qualidade
  health_score INTEGER DEFAULT 0,
  goal_achievement_rate DECIMAL(5,2) DEFAULT 0,
  meal_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 6. TABELA DE RECOMENDAÇÕES NUTRICIONAIS
CREATE TABLE IF NOT EXISTS nutrition_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- 'food_suggestion', 'meal_plan', 'nutrient_balance'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER DEFAULT 1, -- 1-5, onde 5 é mais importante
  is_implemented BOOLEAN DEFAULT false,
  context_data JSONB, -- Dados que geraram a recomendação
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para nutrition_tracking
CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_user_date ON nutrition_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_meal_type ON nutrition_tracking(meal_type);
CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_created_at ON nutrition_tracking(created_at);

-- Índices para nutrition_favorites
CREATE INDEX IF NOT EXISTS idx_nutrition_favorites_user_id ON nutrition_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_favorites_usage_count ON nutrition_favorites(usage_count);

-- Índices para nutrition_patterns
CREATE INDEX IF NOT EXISTS idx_nutrition_patterns_user_type ON nutrition_patterns(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_nutrition_patterns_active ON nutrition_patterns(is_active);

-- Índices para nutrition_daily_summary
CREATE INDEX IF NOT EXISTS idx_nutrition_daily_summary_user_date ON nutrition_daily_summary(user_id, date);
CREATE INDEX IF NOT EXISTS idx_nutrition_daily_summary_health_score ON nutrition_daily_summary(health_score);

-- Índices para nutrition_recommendations
CREATE INDEX IF NOT EXISTS idx_nutrition_recommendations_user_priority ON nutrition_recommendations(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_nutrition_recommendations_implemented ON nutrition_recommendations(is_implemented);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE nutrition_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_recommendations ENABLE ROW LEVEL SECURITY;

-- Políticas para nutrition_tracking
CREATE POLICY "Users can view own nutrition tracking" ON nutrition_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition tracking" ON nutrition_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition tracking" ON nutrition_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition tracking" ON nutrition_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para nutrition_goals
CREATE POLICY "Users can view own nutrition goals" ON nutrition_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition goals" ON nutrition_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition goals" ON nutrition_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition goals" ON nutrition_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para nutrition_favorites
CREATE POLICY "Users can view own nutrition favorites" ON nutrition_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition favorites" ON nutrition_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition favorites" ON nutrition_favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition favorites" ON nutrition_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para nutrition_patterns
CREATE POLICY "Users can view own nutrition patterns" ON nutrition_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition patterns" ON nutrition_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition patterns" ON nutrition_patterns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition patterns" ON nutrition_patterns
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para nutrition_daily_summary
CREATE POLICY "Users can view own nutrition daily summary" ON nutrition_daily_summary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition daily summary" ON nutrition_daily_summary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition daily summary" ON nutrition_daily_summary
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition daily summary" ON nutrition_daily_summary
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para nutrition_recommendations
CREATE POLICY "Users can view own nutrition recommendations" ON nutrition_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition recommendations" ON nutrition_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition recommendations" ON nutrition_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition recommendations" ON nutrition_recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_nutrition_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_nutrition_tracking_updated_at
  BEFORE UPDATE ON nutrition_tracking
  FOR EACH ROW EXECUTE FUNCTION update_nutrition_updated_at();

CREATE TRIGGER update_nutrition_goals_updated_at
  BEFORE UPDATE ON nutrition_goals
  FOR EACH ROW EXECUTE FUNCTION update_nutrition_updated_at();

CREATE TRIGGER update_nutrition_daily_summary_updated_at
  BEFORE UPDATE ON nutrition_daily_summary
  FOR EACH ROW EXECUTE FUNCTION update_nutrition_updated_at();

-- Função para calcular resumo diário automaticamente
CREATE OR REPLACE FUNCTION calculate_daily_nutrition_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir ou atualizar resumo diário
  INSERT INTO nutrition_daily_summary (
    user_id, date, total_calories, total_protein, total_carbs, 
    total_fat, total_fiber, total_sugar, total_sodium, meal_count
  )
  SELECT 
    user_id,
    date,
    SUM(total_calories),
    SUM(total_protein),
    SUM(total_carbs),
    SUM(total_fat),
    SUM(total_fiber),
    SUM(total_sugar),
    SUM(total_sodium),
    COUNT(*)
  FROM nutrition_tracking
  WHERE user_id = NEW.user_id AND date = NEW.date
  GROUP BY user_id, date
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein = EXCLUDED.total_protein,
    total_carbs = EXCLUDED.total_carbs,
    total_fat = EXCLUDED.total_fat,
    total_fiber = EXCLUDED.total_fiber,
    total_sugar = EXCLUDED.total_sugar,
    total_sodium = EXCLUDED.total_sodium,
    meal_count = EXCLUDED.meal_count,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular resumo diário
CREATE TRIGGER trigger_calculate_daily_summary
  AFTER INSERT OR UPDATE OR DELETE ON nutrition_tracking
  FOR EACH ROW EXECUTE FUNCTION calculate_daily_nutrition_summary();

-- Função para atualizar contador de uso de favoritos
CREATE OR REPLACE FUNCTION update_favorite_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contador de uso para cada alimento na refeição
  INSERT INTO nutrition_favorites (user_id, food_name, food_id, category, usage_count)
  SELECT 
    NEW.user_id,
    food->>'name' as food_name,
    food->>'id' as food_id,
    'unknown' as category,
    1 as usage_count
  FROM jsonb_array_elements(NEW.foods) as food
  ON CONFLICT (user_id, food_name) DO UPDATE SET
    usage_count = nutrition_favorites.usage_count + 1,
    last_used = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar favoritos
CREATE TRIGGER trigger_update_favorite_usage
  AFTER INSERT ON nutrition_tracking
  FOR EACH ROW EXECUTE FUNCTION update_favorite_usage_count();

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir metas nutricionais padrão para usuários existentes (opcional)
-- Esta query pode ser executada manualmente se necessário
/*
INSERT INTO nutrition_goals (user_id, calories, protein, carbs, fat, fiber)
SELECT id, 2000, 150, 250, 65, 25
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM nutrition_goals);
*/
