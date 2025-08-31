-- Nova migração para o sistema de Missão do Dia melhorado

-- 1. TABELA DE SESSÕES DE MISSÃO DIÁRIA
CREATE TABLE IF NOT EXISTS daily_mission_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_sections TEXT[] DEFAULT '{}',
  total_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 2. TABELA DE RESPOSTAS DIÁRIAS
CREATE TABLE IF NOT EXISTS daily_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  section TEXT NOT NULL CHECK (section IN ('morning', 'habits', 'mindset', 'saboteurs', 'saboteurs_results')),
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  text_response TEXT,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, question_id)
);

-- 3. TABELA DE CONQUISTAS DO USUÁRIO
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE INSIGHTS SEMANAIS
CREATE TABLE IF NOT EXISTS weekly_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  average_mood DECIMAL(3,2),
  average_energy DECIMAL(3,2),
  average_stress DECIMAL(3,2),
  most_common_gratitude TEXT,
  water_consistency DECIMAL(3,2),
  sleep_consistency DECIMAL(3,2),
  exercise_frequency DECIMAL(3,2),
  streak_days INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- 5. HABILITAR ROW LEVEL SECURITY
ALTER TABLE daily_mission_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS RLS
-- Políticas para daily_mission_sessions
CREATE POLICY "Users can view their own mission sessions" ON daily_mission_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mission sessions" ON daily_mission_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission sessions" ON daily_mission_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para daily_responses
CREATE POLICY "Users can view their own responses" ON daily_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own responses" ON daily_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses" ON daily_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_achievements
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para weekly_insights
CREATE POLICY "Users can view their own insights" ON weekly_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights" ON weekly_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights" ON weekly_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_daily_mission_sessions_user_date ON daily_mission_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_date ON daily_responses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_section ON daily_responses(user_id, section);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_type ON user_achievements(user_id, achievement_type);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_week ON weekly_insights(user_id, week_start_date);

-- 8. CRIAR FUNÇÃO PARA ATUALIZAR STREAK
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  current_streak INTEGER;
  last_completion_date DATE;
BEGIN
  -- Obter a data da última conclusão
  SELECT date INTO last_completion_date
  FROM daily_mission_sessions
  WHERE user_id = NEW.user_id
    AND is_completed = TRUE
    AND date < NEW.date
  ORDER BY date DESC
  LIMIT 1;

  -- Se não há data anterior, streak = 1
  IF last_completion_date IS NULL THEN
    current_streak := 1;
  -- Se a data anterior é ontem, incrementar streak
  ELSIF last_completion_date = NEW.date - INTERVAL '1 day' THEN
    SELECT streak_days INTO current_streak
    FROM daily_mission_sessions
    WHERE user_id = NEW.user_id
      AND date = last_completion_date;
    current_streak := current_streak + 1;
  -- Se há gap, resetar streak
  ELSE
    current_streak := 1;
  END IF;

  -- Atualizar streak
  NEW.streak_days := current_streak;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. CRIAR TRIGGER PARA ATUALIZAR STREAK
CREATE TRIGGER trigger_update_streak
  BEFORE UPDATE ON daily_mission_sessions
  FOR EACH ROW
  WHEN (OLD.is_completed = FALSE AND NEW.is_completed = TRUE)
  EXECUTE FUNCTION update_user_streak();

-- 10. CRIAR FUNÇÃO PARA GERAR INSIGHTS SEMANAIS
CREATE OR REPLACE FUNCTION generate_weekly_insights()
RETURNS TRIGGER AS $$
DECLARE
  week_start DATE;
  week_end DATE;
  avg_mood DECIMAL(3,2);
  avg_energy DECIMAL(3,2);
  avg_stress DECIMAL(3,2);
  most_gratitude TEXT;
  water_consistency DECIMAL(3,2);
  sleep_consistency DECIMAL(3,2);
  exercise_freq DECIMAL(3,2);
  total_points INTEGER;
BEGIN
  -- Calcular semana
  week_start := DATE_TRUNC('week', NEW.date)::DATE;
  week_end := week_start + INTERVAL '6 days';

  -- Calcular médias de humor, energia e estresse
  SELECT 
    AVG(CASE WHEN question_id = 'day_rating' THEN answer::DECIMAL ELSE NULL END),
    AVG(CASE WHEN question_id = 'morning_energy' THEN answer::DECIMAL ELSE NULL END),
    AVG(CASE WHEN question_id = 'stress_level' THEN answer::DECIMAL ELSE NULL END)
  INTO avg_mood, avg_energy, avg_stress
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end;

  -- Encontrar gratidão mais comum
  SELECT answer INTO most_gratitude
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end
    AND question_id = 'gratitude'
  GROUP BY answer
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Calcular consistência de água (dias com 2L+)
  SELECT 
    (COUNT(CASE WHEN answer IN ('2L', '3L ou mais') THEN 1 END)::DECIMAL / COUNT(*)) * 100
  INTO water_consistency
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end
    AND question_id = 'water_intake';

  -- Calcular consistência de sono (dias com 8h+)
  SELECT 
    (COUNT(CASE WHEN answer IN ('8h', '9h+') THEN 1 END)::DECIMAL / COUNT(*)) * 100
  INTO sleep_consistency
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end
    AND question_id = 'sleep_hours';

  -- Calcular frequência de exercício
  SELECT 
    (COUNT(CASE WHEN answer = 'Sim' THEN 1 END)::DECIMAL / COUNT(*)) * 100
  INTO exercise_freq
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end
    AND question_id = 'physical_activity';

  -- Calcular pontos totais
  SELECT COALESCE(SUM(total_points), 0) INTO total_points
  FROM daily_mission_sessions
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end;

  -- Inserir ou atualizar insights
  INSERT INTO weekly_insights (
    user_id,
    week_start_date,
    average_mood,
    average_energy,
    average_stress,
    most_common_gratitude,
    water_consistency,
    sleep_consistency,
    exercise_frequency,
    total_points
  ) VALUES (
    NEW.user_id,
    week_start,
    avg_mood,
    avg_energy,
    avg_stress,
    most_gratitude,
    water_consistency,
    sleep_consistency,
    exercise_freq,
    total_points
  )
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    average_mood = EXCLUDED.average_mood,
    average_energy = EXCLUDED.average_energy,
    average_stress = EXCLUDED.average_stress,
    most_common_gratitude = EXCLUDED.most_common_gratitude,
    water_consistency = EXCLUDED.water_consistency,
    sleep_consistency = EXCLUDED.sleep_consistency,
    exercise_frequency = EXCLUDED.exercise_frequency,
    total_points = EXCLUDED.total_points;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. CRIAR TRIGGER PARA GERAR INSIGHTS
CREATE TRIGGER trigger_generate_weekly_insights
  AFTER UPDATE ON daily_mission_sessions
  FOR EACH ROW
  WHEN (OLD.is_completed = FALSE AND NEW.is_completed = TRUE)
  EXECUTE FUNCTION generate_weekly_insights();

-- 12. CRIAR FUNÇÃO PARA VERIFICAR CONQUISTAS
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  achievement_count INTEGER;
  streak_days INTEGER;
  water_days INTEGER;
  exercise_days INTEGER;
  gratitude_days INTEGER;
BEGIN
  -- Verificar conquista de streak
  SELECT streak_days INTO streak_days
  FROM daily_mission_sessions
  WHERE user_id = NEW.user_id
    AND date = NEW.date;

  -- Conquista de 7 dias seguidos
  IF streak_days >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, progress, target)
    VALUES (NEW.user_id, 'streak_7', 'Consistência Semanal', 'Completou 7 dias seguidos de reflexões', '🔥', 7, 7)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  -- Conquista de 30 dias seguidos
  IF streak_days >= 30 THEN
    INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, progress, target)
    VALUES (NEW.user_id, 'streak_30', 'Mestre da Reflexão', 'Completou 30 dias seguidos de reflexões', '👑', 30, 30)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  -- Verificar conquista de hidratação (7 dias com 2L+)
  SELECT COUNT(*) INTO water_days
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND question_id = 'water_intake'
    AND answer IN ('2L', '3L ou mais')
    AND date >= NEW.date - INTERVAL '6 days'
    AND date <= NEW.date;

  IF water_days >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, progress, target)
    VALUES (NEW.user_id, 'hydration_7', 'Hidratação Perfeita', 'Manteve hidratação adequada por 7 dias', '💧', 7, 7)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  -- Verificar conquista de exercício (7 dias)
  SELECT COUNT(*) INTO exercise_days
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND question_id = 'physical_activity'
    AND answer = 'Sim'
    AND date >= NEW.date - INTERVAL '6 days'
    AND date <= NEW.date;

  IF exercise_days >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, progress, target)
    VALUES (NEW.user_id, 'exercise_7', 'Atleta da Semana', 'Praticou exercício por 7 dias seguidos', '🏃‍♀️', 7, 7)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  -- Verificar conquista de gratidão (7 dias)
  SELECT COUNT(*) INTO gratitude_days
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND question_id = 'gratitude'
    AND date >= NEW.date - INTERVAL '6 days'
    AND date <= NEW.date;

  IF gratitude_days >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, progress, target)
    VALUES (NEW.user_id, 'gratitude_7', 'Coração Grato', 'Praticou gratidão por 7 dias seguidos', '🙏', 7, 7)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. CRIAR TRIGGER PARA VERIFICAR CONQUISTAS
CREATE TRIGGER trigger_check_achievements
  AFTER UPDATE ON daily_mission_sessions
  FOR EACH ROW
  WHEN (OLD.is_completed = FALSE AND NEW.is_completed = TRUE)
  EXECUTE FUNCTION check_achievements(); 