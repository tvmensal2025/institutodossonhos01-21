-- ================================================
-- MIGRAÇÃO COMPLETA PARA CORREÇÃO E SETUP TOTAL
-- ================================================

-- 1. CORRIGIR O TRIGGER QUE ESTÁ CAUSANDO ERRO
DROP TRIGGER IF EXISTS trigger_weekly_analysis ON weight_measurements;
DROP FUNCTION IF EXISTS generate_weekly_analysis();

-- Criar nova função corrigida
CREATE OR REPLACE FUNCTION generate_weekly_analysis()
RETURNS TRIGGER AS $$
DECLARE
  week_start DATE;
  week_end DATE;
  first_measurement RECORD;
  last_measurement RECORD;
  avg_measurement RECORD;
BEGIN
  -- Calcular início e fim da semana
  week_start = DATE_TRUNC('week', NEW.measurement_date::DATE);
  week_end = week_start + INTERVAL '6 days';
  
  -- Verificar se já existe análise para esta semana
  IF EXISTS (
    SELECT 1 FROM weekly_analyses wa
    WHERE wa.user_id = NEW.user_id 
    AND wa.semana_inicio = week_start
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Buscar primeira medição da semana
  SELECT wm.* INTO first_measurement
  FROM weight_measurements wm
  WHERE wm.user_id = NEW.user_id
  AND wm.measurement_date::DATE >= week_start
  AND wm.measurement_date::DATE <= week_end
  ORDER BY wm.measurement_date ASC
  LIMIT 1;
  
  -- Buscar última medição da semana
  SELECT wm.* INTO last_measurement
  FROM weight_measurements wm
  WHERE wm.user_id = NEW.user_id
  AND wm.measurement_date::DATE >= week_start
  AND wm.measurement_date::DATE <= week_end
  ORDER BY wm.measurement_date DESC
  LIMIT 1;
  
  -- Calcular médias da semana
  SELECT 
    AVG(wm.peso_kg) as peso_medio,
    AVG(wm.gordura_corporal_percent) as gordura_media,
    AVG(wm.massa_muscular_kg) as massa_media,
    AVG(wm.imc) as imc_medio
  INTO avg_measurement
  FROM weight_measurements wm
  WHERE wm.user_id = NEW.user_id
  AND wm.measurement_date::DATE >= week_start
  AND wm.measurement_date::DATE <= week_end;
  
  -- Inserir análise semanal
  INSERT INTO weekly_analyses (
    user_id,
    semana_inicio,
    semana_fim,
    peso_inicial,
    peso_final,
    variacao_peso,
    variacao_gordura_corporal,
    variacao_massa_muscular,
    media_imc,
    tendencia
  ) VALUES (
    NEW.user_id,
    week_start,
    week_end,
    first_measurement.peso_kg,
    last_measurement.peso_kg,
    COALESCE(last_measurement.peso_kg - first_measurement.peso_kg, 0),
    COALESCE(last_measurement.gordura_corporal_percent - first_measurement.gordura_corporal_percent, 0),
    COALESCE(last_measurement.massa_muscular_kg - first_measurement.massa_muscular_kg, 0),
    avg_measurement.imc_medio,
    CASE 
      WHEN COALESCE(last_measurement.peso_kg, 0) > COALESCE(first_measurement.peso_kg, 0) THEN 'aumento'
      WHEN COALESCE(last_measurement.peso_kg, 0) < COALESCE(first_measurement.peso_kg, 0) THEN 'diminuicao'
      ELSE 'estavel'
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger
CREATE TRIGGER trigger_weekly_analysis
  AFTER INSERT ON weight_measurements
  FOR EACH ROW
  EXECUTE FUNCTION generate_weekly_analysis();

-- 2. CRIAR TABELAS QUE FALTAM PARA OS GRÁFICOS

-- Tabela de missões diárias
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

-- Tabela de pontuação de usuários
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

-- Tabela de humor e bem-estar
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

-- Tabela de roda da vida
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

-- Tabela de categorias de atividades
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

-- Tabela de sessões de atividade
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

-- 3. ADICIONAR CAMPOS QUE FALTAM NAS TABELAS EXISTENTES
ALTER TABLE weight_measurements 
ADD COLUMN IF NOT EXISTS overall_health_score INTEGER CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
ADD COLUMN IF NOT EXISTS vitality_score INTEGER CHECK (vitality_score >= 0 AND vitality_score <= 100);

-- 4. HABILITAR RLS NAS NOVAS TABELAS
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_wheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE SEGURANÇA PARA TODAS AS NOVAS TABELAS

-- Políticas para daily_missions
DROP POLICY IF EXISTS "Users can view own missions" ON daily_missions;
DROP POLICY IF EXISTS "Users can insert own missions" ON daily_missions;
DROP POLICY IF EXISTS "Users can update own missions" ON daily_missions;

CREATE POLICY "Users can view own missions" ON daily_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions" ON daily_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" ON daily_missions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_scores
DROP POLICY IF EXISTS "Users can view own scores" ON user_scores;
DROP POLICY IF EXISTS "Users can insert own scores" ON user_scores;
DROP POLICY IF EXISTS "Users can update own scores" ON user_scores;

CREATE POLICY "Users can view own scores" ON user_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON user_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON user_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para mood_tracking
DROP POLICY IF EXISTS "Users can view own mood" ON mood_tracking;
DROP POLICY IF EXISTS "Users can insert own mood" ON mood_tracking;
DROP POLICY IF EXISTS "Users can update own mood" ON mood_tracking;

CREATE POLICY "Users can view own mood" ON mood_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood" ON mood_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood" ON mood_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para life_wheel
DROP POLICY IF EXISTS "Users can view own life wheel" ON life_wheel;
DROP POLICY IF EXISTS "Users can insert own life wheel" ON life_wheel;
DROP POLICY IF EXISTS "Users can update own life wheel" ON life_wheel;

CREATE POLICY "Users can view own life wheel" ON life_wheel
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life wheel" ON life_wheel
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life wheel" ON life_wheel
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para activity_categories
DROP POLICY IF EXISTS "Users can view own categories" ON activity_categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON activity_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON activity_categories;

CREATE POLICY "Users can view own categories" ON activity_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON activity_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON activity_categories
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para activity_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON activity_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON activity_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON activity_sessions;

CREATE POLICY "Users can view own sessions" ON activity_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON activity_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON activity_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date ON daily_missions(user_id, date_assigned DESC);
CREATE INDEX IF NOT EXISTS idx_user_scores_user_date ON user_scores(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_date ON mood_tracking(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_life_wheel_user_date ON life_wheel(user_id, evaluation_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_categories_user ON activity_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_date ON activity_sessions(user_id, session_date DESC);

-- 7. INSERIR DADOS DE EXEMPLO PARA TESTE (OPCIONAL)
-- Isso só será executado se não houver dados

-- Função para inserir dados de teste
CREATE OR REPLACE FUNCTION insert_test_data_if_needed() 
RETURNS void AS $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Buscar primeiro usuário existente
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Inserir algumas missões de exemplo se não existir
    INSERT INTO daily_missions (user_id, mission_type, title, description, points, target_value, current_value, is_completed, date_assigned, category)
    SELECT test_user_id, 'exercise', 'Caminhar 30 minutos', 'Faça uma caminhada de pelo menos 30 minutos', 50, 30, 0, false, CURRENT_DATE, 'health'
    WHERE NOT EXISTS (SELECT 1 FROM daily_missions WHERE user_id = test_user_id);
    
    INSERT INTO daily_missions (user_id, mission_type, title, description, points, target_value, current_value, is_completed, date_assigned, category)
    SELECT test_user_id, 'nutrition', 'Beber 2L de água', 'Manter-se hidratado bebendo pelo menos 2 litros de água', 30, 2000, 500, false, CURRENT_DATE, 'health'
    WHERE NOT EXISTS (SELECT 1 FROM daily_missions WHERE user_id = test_user_id AND mission_type = 'nutrition');
    
    -- Inserir pontuação do dia se não existir
    INSERT INTO user_scores (user_id, date, daily_score, missions_completed, total_missions, streak_days, level_points, current_level)
    SELECT test_user_id, CURRENT_DATE, 45, 1, 3, 5, 450, 2
    WHERE NOT EXISTS (SELECT 1 FROM user_scores WHERE user_id = test_user_id AND date = CURRENT_DATE);
    
    -- Inserir dados de humor se não existir
    INSERT INTO mood_tracking (user_id, date, mood_score, mood_emoji, energy_level, stress_level, sleep_quality, notes)
    SELECT test_user_id, CURRENT_DATE, 4, '😊', 4, 2, 4, 'Dia produtivo e animado'
    WHERE NOT EXISTS (SELECT 1 FROM mood_tracking WHERE user_id = test_user_id AND date = CURRENT_DATE);
    
    -- Inserir avaliação da roda da vida se não existir
    INSERT INTO life_wheel (user_id, evaluation_date, health_score, family_score, career_score, finances_score, relationships_score, personal_growth_score, leisure_score, spirituality_score, overall_satisfaction, notes)
    SELECT test_user_id, CURRENT_DATE, 8, 9, 7, 6, 8, 7, 6, 5, 7, 'Avaliação inicial do bem-estar geral'
    WHERE NOT EXISTS (SELECT 1 FROM life_wheel WHERE user_id = test_user_id);
    
    -- Inserir categorias de atividade se não existir
    INSERT INTO activity_categories (user_id, category_name, total_sessions, total_points, avg_score, last_activity_date, color_code, is_active)
    SELECT test_user_id, 'Exercícios', 15, 750, 8.2, CURRENT_DATE - INTERVAL '1 day', '#22C55E', true
    WHERE NOT EXISTS (SELECT 1 FROM activity_categories WHERE user_id = test_user_id AND category_name = 'Exercícios');
    
    INSERT INTO activity_categories (user_id, category_name, total_sessions, total_points, avg_score, last_activity_date, color_code, is_active)
    SELECT test_user_id, 'Meditação', 8, 320, 7.5, CURRENT_DATE - INTERVAL '2 days', '#8B5CF6', true
    WHERE NOT EXISTS (SELECT 1 FROM activity_categories WHERE user_id = test_user_id AND category_name = 'Meditação');
    
    INSERT INTO activity_categories (user_id, category_name, total_sessions, total_points, avg_score, last_activity_date, color_code, is_active)
    SELECT test_user_id, 'Alimentação Saudável', 12, 480, 6.8, CURRENT_DATE, '#F59E0B', true
    WHERE NOT EXISTS (SELECT 1 FROM activity_categories WHERE user_id = test_user_id AND category_name = 'Alimentação Saudável');
    
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Executar a função de teste
SELECT insert_test_data_if_needed();

-- Remover a função após uso
DROP FUNCTION insert_test_data_if_needed();

-- 8. COMENTÁRIO DE CONCLUSÃO
COMMENT ON SCHEMA public IS 'Sistema completo de saúde e bem-estar com todas as tabelas necessárias para gráficos e análises';