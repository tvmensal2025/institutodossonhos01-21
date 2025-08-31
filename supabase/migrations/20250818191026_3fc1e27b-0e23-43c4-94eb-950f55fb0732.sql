-- Verificar e corrigir funções que podem estar causando divisão por zero

-- Primeira, vamos verificar as funções relacionadas às missões diárias
SELECT proname, prosrc 
FROM pg_proc 
WHERE prosrc LIKE '%/%' 
  AND (proname LIKE '%mission%' OR proname LIKE '%daily%' OR proname LIKE '%gamification%');

-- Remover triggers problemáticos que podem estar causando divisão por zero
DROP TRIGGER IF EXISTS update_user_gamification_trigger ON daily_responses;
DROP TRIGGER IF EXISTS save_mission_tracking_data_trigger ON daily_responses;

-- Recriar função de gamificação sem divisão por zero
CREATE OR REPLACE FUNCTION public.update_user_gamification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  user_total_xp INTEGER;
  new_level INTEGER;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Calcular XP total do usuário com proteção contra NULL
  SELECT COALESCE(SUM(points_earned), 0) INTO user_total_xp
  FROM daily_responses 
  WHERE user_id = NEW.user_id;
  
  -- Calcular novo nível com proteção contra divisão por zero
  IF user_total_xp > 0 THEN
    new_level := GREATEST(1, (user_total_xp / 1000) + 1);
  ELSE
    new_level := 1;
  END IF;
  
  -- Inserir ou atualizar gamificação
  INSERT INTO user_gamification (
    user_id, current_level, current_xp, total_xp, last_activity_date, updated_at
  ) VALUES (
    NEW.user_id, 
    new_level,
    CASE WHEN user_total_xp > 0 THEN user_total_xp % 1000 ELSE 0 END,
    user_total_xp,
    current_date,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    current_level = new_level,
    current_xp = CASE WHEN user_total_xp > 0 THEN user_total_xp % 1000 ELSE 0 END,
    total_xp = user_total_xp,
    last_activity_date = current_date,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Recriar função de tracking sem divisão por zero
CREATE OR REPLACE FUNCTION public.save_mission_tracking_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se é uma resposta sobre água, salvar no tracking
  IF NEW.question_id = 'water' THEN
    INSERT INTO water_tracking (user_id, amount_ml, source, recorded_at)
    VALUES (
      NEW.user_id, 
      CASE 
        WHEN NEW.answer ~ '^[0-9]+$' THEN 
          GREATEST(0, CAST(NEW.answer AS INTEGER) * 250)
        ELSE 250
      END,
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
      CASE 
        WHEN NEW.answer ~ '^[0-9\.]+$' THEN 
          GREATEST(0, CAST(NEW.answer AS DECIMAL))
        ELSE 8
      END,
      'daily_mission',
      NEW.date
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Verificar se as tabelas necessárias existem
CREATE TABLE IF NOT EXISTS user_gamification (
  user_id UUID PRIMARY KEY,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount_ml INTEGER NOT NULL,
  source TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sleep_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  hours DECIMAL,
  source TEXT,
  sleep_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar triggers apenas se as tabelas existirem
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_gamification') THEN
    CREATE TRIGGER update_user_gamification_trigger
      AFTER INSERT ON daily_responses
      FOR EACH ROW EXECUTE FUNCTION update_user_gamification();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'water_tracking') THEN
    CREATE TRIGGER save_mission_tracking_data_trigger
      AFTER INSERT ON daily_responses
      FOR EACH ROW EXECUTE FUNCTION save_mission_tracking_data();
  END IF;
END $$;