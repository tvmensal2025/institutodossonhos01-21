-- Corrigir as funções restantes com search_path inadequado

-- 7. Atualizar função update_user_streak com search_path
CREATE OR REPLACE FUNCTION public.update_user_streak()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- 8. Atualizar função update_food_analysis_updated_at com search_path
CREATE OR REPLACE FUNCTION public.update_food_analysis_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 9. Atualizar função generate_weekly_insights com search_path
CREATE OR REPLACE FUNCTION public.generate_weekly_insights()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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
$function$;

-- 10. Atualizar função check_achievements com search_path
CREATE OR REPLACE FUNCTION public.check_achievements()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- 11. Atualizar função user_has_active_subscription com search_path
CREATE OR REPLACE FUNCTION public.user_has_active_subscription(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_subscriptions 
    WHERE user_id = user_uuid 
      AND status = 'active' 
      AND current_period_end > NOW()
  );
END;
$function$;

-- 12. Atualizar função user_has_content_access com search_path
CREATE OR REPLACE FUNCTION public.user_has_content_access(user_uuid uuid, content_type_param character varying, content_id_param character varying)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Verifica se tem assinatura ativa
  IF user_has_active_subscription(user_uuid) THEN
    RETURN TRUE;
  END IF;
  
  -- Verifica acesso específico ao conteúdo
  RETURN EXISTS (
    SELECT 1 
    FROM content_access 
    WHERE user_id = user_uuid 
      AND content_type = content_type_param 
      AND content_id = content_id_param 
      AND access_granted = true
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$function$;

-- 13. Atualizar função has_role com search_path
CREATE OR REPLACE FUNCTION public.has_role(user_uuid uuid, role_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se o usuário é admin baseado no email
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_uuid 
    AND (
      email LIKE '%admin%' 
      OR email = 'admin@institutodossonhos.com.br'
      OR email = 'teste@institutodossonhos.com'
      OR email = 'contato@rafael-dias.com'
      OR raw_user_meta_data->>'role' = 'admin'
    )
  );
END;
$function$;