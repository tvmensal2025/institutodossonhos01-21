-- ========================================
-- MIGRAÇÃO CRÍTICA: CORREÇÃO DO SISTEMA
-- ========================================

-- 1. CORRIGIR TRIGGERS AUSENTES
-- Verificar se o trigger para criar profiles existe
DO $$
BEGIN
  -- Recriar o trigger para profiles se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    -- Criar trigger para criar profiles automaticamente
    CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $function$
    BEGIN
      INSERT INTO public.profiles (user_id, full_name, email)
      VALUES (
        NEW.id, 
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.email
      );
      RETURN NEW;
    END;
    $function$;

    -- Criar trigger
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
  END IF;
END $$;

-- 2. CRIAR FUNÇÃO PARA ROLES SE NÃO EXISTIR
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;

-- Criar trigger para roles se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_role_created'
  ) THEN
    CREATE TRIGGER on_auth_user_role_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
  END IF;
END $$;

-- 3. CORRIGIR DADOS EXISTENTES
-- Criar profiles para usuários que não têm
INSERT INTO public.profiles (user_id, full_name, email)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', 'Usuário'),
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- Criar roles para usuários que não têm
INSERT INTO public.user_roles (user_id, role)
SELECT 
  au.id,
  'user'::app_role
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL;

-- 4. CRIAR TRIGGER PARA ATUALIZAR user_name AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.auto_update_user_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.user_name := get_user_display_name(NEW.user_id);
    RETURN NEW;
END;
$function$;

-- Adicionar triggers nas tabelas que precisam de user_name
DO $$
BEGIN
  -- Trigger para assessments
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_assessments_user_name'
  ) THEN
    CREATE TRIGGER update_assessments_user_name
      BEFORE INSERT OR UPDATE ON assessments
      FOR EACH ROW EXECUTE FUNCTION auto_update_user_name();
  END IF;

  -- Trigger para health_diary  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_health_diary_user_name'
  ) THEN
    CREATE TRIGGER update_health_diary_user_name
      BEFORE INSERT OR UPDATE ON health_diary
      FOR EACH ROW EXECUTE FUNCTION auto_update_user_name();
  END IF;
END $$;

-- 5. ATUALIZAR DADOS EXISTENTES COM user_name
UPDATE assessments 
SET user_name = get_user_display_name(user_id)
WHERE user_name IS NULL;

UPDATE health_diary 
SET user_name = get_user_display_name(user_id)
WHERE user_name IS NULL;

-- 6. CORRIGIR FUNÇÃO DE STREAK PARA SER MAIS ROBUSTA
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  current_streak INTEGER;
  last_completion_date DATE;
BEGIN
  -- Verificar se está marcando como completo
  IF NEW.is_completed = TRUE THEN
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
      SELECT COALESCE(streak_days, 0) INTO current_streak
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
  ELSE
    -- Se não está completo, manter streak em 0
    NEW.streak_days := 0;
  END IF;

  RETURN NEW;
END;
$function$;

-- Recriar trigger para streak
DROP TRIGGER IF EXISTS update_streak_trigger ON daily_mission_sessions;
CREATE TRIGGER update_streak_trigger
  BEFORE INSERT OR UPDATE ON daily_mission_sessions
  FOR EACH ROW EXECUTE FUNCTION update_user_streak();

-- 7. CORRIGIR FUNÇÃO DE INSIGHTS SEMANAIS
CREATE OR REPLACE FUNCTION public.generate_weekly_insights()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
    COALESCE((COUNT(CASE WHEN answer IN ('2L', '3L ou mais') THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0)
  INTO water_consistency
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end
    AND question_id = 'water_intake';

  -- Calcular consistência de sono (dias com 8h+)
  SELECT 
    COALESCE((COUNT(CASE WHEN answer IN ('8h', '9h+') THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0)
  INTO sleep_consistency
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end
    AND question_id = 'sleep_hours';

  -- Calcular frequência de exercício
  SELECT 
    COALESCE((COUNT(CASE WHEN answer = 'Sim' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0)
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
$function$;

-- 8. ADICIONAR CONSTRAINT PARA PREVENIR VALORES NEGATIVOS
ALTER TABLE daily_mission_sessions 
ADD CONSTRAINT check_positive_points CHECK (total_points >= 0);

ALTER TABLE daily_mission_sessions 
ADD CONSTRAINT check_positive_streak CHECK (streak_days >= 0);

-- 9. ATUALIZAR DADOS INCONSISTENTES
UPDATE daily_mission_sessions 
SET total_points = 0 
WHERE total_points < 0;

UPDATE daily_mission_sessions 
SET streak_days = 0 
WHERE streak_days < 0;

-- 10. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_daily_mission_sessions_user_date 
ON daily_mission_sessions(user_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_responses_user_date 
ON daily_responses(user_id, date);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
ON user_roles(user_id);