-- ===== MELHORIAS INCREMENTAIS DO SISTEMA =====
-- Adicionando tracking de água, sono e humor para integrar com Daily Missions

-- 1. Tabela de tracking de água
CREATE TABLE IF NOT EXISTS water_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
  source VARCHAR DEFAULT 'manual' CHECK (source IN ('manual', 'daily_mission', 'device')),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de tracking de sono
CREATE TABLE IF NOT EXISTS sleep_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hours DECIMAL(3,1) NOT NULL CHECK (hours > 0 AND hours <= 24),
  quality INTEGER CHECK (quality BETWEEN 1 AND 5),
  source VARCHAR DEFAULT 'manual' CHECK (source IN ('manual', 'daily_mission', 'device')),
  sleep_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de tracking de humor
CREATE TABLE IF NOT EXISTS mood_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  day_rating INTEGER CHECK (day_rating BETWEEN 1 AND 10),
  gratitude_note TEXT,
  source VARCHAR DEFAULT 'manual' CHECK (source IN ('manual', 'daily_mission', 'journal')),
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de gamificação real (melhorar o que já existe)
CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_level INTEGER DEFAULT 1 CHECK (current_level > 0),
  current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
  total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  best_streak INTEGER DEFAULT 0 CHECK (best_streak >= 0),
  badges JSONB DEFAULT '[]'::jsonb,
  rank VARCHAR DEFAULT 'Bronze' CHECK (rank IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de desafios diários (melhorar gamificação)
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  challenge_type VARCHAR NOT NULL CHECK (challenge_type IN ('water', 'exercise', 'mindfulness', 'social', 'goals')),
  difficulty VARCHAR DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  target_value INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 50 CHECK (xp_reward > 0),
  category VARCHAR DEFAULT 'Geral',
  is_active BOOLEAN DEFAULT TRUE,
  expires_in_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de participação em desafios
CREATE TABLE IF NOT EXISTS user_challenge_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0),
  target INTEGER NOT NULL CHECK (target > 0),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  challenge_date DATE DEFAULT CURRENT_DATE,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, challenge_date)
);

-- ===== HABILITANDO RLS EM TODAS AS TABELAS =====

ALTER TABLE water_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_participation ENABLE ROW LEVEL SECURITY;

-- ===== POLÍTICAS RLS =====

-- Water tracking policies
CREATE POLICY "Users can insert own water tracking" ON water_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own water tracking" ON water_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own water tracking" ON water_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Sleep tracking policies
CREATE POLICY "Users can insert own sleep tracking" ON sleep_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own sleep tracking" ON sleep_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep tracking" ON sleep_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Mood tracking policies
CREATE POLICY "Users can insert own mood tracking" ON mood_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own mood tracking" ON mood_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own mood tracking" ON mood_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Gamification policies
CREATE POLICY "Users can view own gamification" ON user_gamification
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gamification" ON user_gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gamification" ON user_gamification
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily challenges policies (todos podem ver)
CREATE POLICY "Everyone can view active challenges" ON daily_challenges
  FOR SELECT USING (is_active = true);

-- Challenge participation policies
CREATE POLICY "Users can insert own participation" ON user_challenge_participation
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own participation" ON user_challenge_participation
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON user_challenge_participation
  FOR UPDATE USING (auth.uid() = user_id);

-- ===== FUNÇÕES MELHORADAS =====

-- Função para calcular nível baseado no XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(total_xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Cada nível requer 1000 XP
  RETURN GREATEST(1, (total_xp / 1000) + 1);
END;
$$;

-- Função para atualizar gamificação automaticamente
CREATE OR REPLACE FUNCTION update_user_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_total_xp INTEGER;
  new_level INTEGER;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Calcular XP total do usuário
  SELECT COALESCE(SUM(points_earned), 0) INTO user_total_xp
  FROM daily_responses 
  WHERE user_id = NEW.user_id;
  
  -- Calcular novo nível
  new_level := calculate_level_from_xp(user_total_xp);
  
  -- Inserir ou atualizar gamificação
  INSERT INTO user_gamification (
    user_id, current_level, current_xp, total_xp, last_activity_date, updated_at
  ) VALUES (
    NEW.user_id, 
    new_level,
    user_total_xp % 1000, -- XP atual no nível
    user_total_xp,
    current_date,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    current_level = new_level,
    current_xp = user_total_xp % 1000,
    total_xp = user_total_xp,
    last_activity_date = current_date,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Trigger para atualizar gamificação quando ganhar pontos
CREATE OR REPLACE TRIGGER trigger_update_gamification
  AFTER INSERT OR UPDATE ON daily_responses
  FOR EACH ROW EXECUTE FUNCTION update_user_gamification();

-- Função para inserir dados de tracking automaticamente
CREATE OR REPLACE FUNCTION save_mission_tracking_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se é uma resposta sobre água, salvar no tracking
  IF NEW.question_id = 'water' THEN
    INSERT INTO water_tracking (user_id, amount_ml, source, recorded_at)
    VALUES (
      NEW.user_id, 
      (CAST(NEW.answer AS INTEGER) * 250), -- 1 copo = 250ml
      'daily_mission',
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Se é uma resposta sobre sono, salvar no tracking
  IF NEW.question_id = 'sleep' THEN
    INSERT INTO sleep_tracking (user_id, hours, source, sleep_date)
    VALUES (
      NEW.user_id,
      CAST(NEW.answer AS DECIMAL),
      'daily_mission',
      NEW.date
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Se é uma resposta sobre energia/humor, salvar no tracking
  IF NEW.question_id IN ('energy', 'mood') THEN
    INSERT INTO mood_tracking (
      user_id, 
      energy_level, 
      day_rating,
      gratitude_note,
      source, 
      recorded_date
    )
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.question_id = 'energy' THEN CAST(NEW.answer AS INTEGER) ELSE NULL END,
      CASE WHEN NEW.question_id = 'mood' THEN CAST(NEW.answer AS INTEGER) ELSE NULL END,
      NEW.text_response,
      'daily_mission',
      NEW.date
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para salvar tracking data automaticamente
CREATE OR REPLACE TRIGGER trigger_save_tracking_data
  AFTER INSERT OR UPDATE ON daily_responses
  FOR EACH ROW EXECUTE FUNCTION save_mission_tracking_data();

-- ===== DADOS INICIAIS PARA DESAFIOS =====

INSERT INTO daily_challenges (title, description, challenge_type, difficulty, target_value, xp_reward, category) VALUES
('Hidratação Diária', 'Beba pelo menos 8 copos de água hoje', 'water', 'easy', 8, 50, 'Saúde'),
('Exercício Matinal', 'Faça pelo menos 30 minutos de exercício', 'exercise', 'medium', 30, 100, 'Fitness'),
('Momento Mindfulness', 'Pratique 10 minutos de meditação ou respiração', 'mindfulness', 'easy', 10, 75, 'Bem-estar'),
('Progresso nas Metas', 'Atualize o progresso de pelo menos 2 metas', 'goals', 'medium', 2, 120, 'Produtividade'),
('Interação Social', 'Participe do feed da comunidade', 'social', 'easy', 1, 60, 'Comunidade')
ON CONFLICT DO NOTHING;