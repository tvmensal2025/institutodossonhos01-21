-- =================================================================
-- BACKUP COMPLETO DAS FUNÇÕES DO SUPABASE - HEALTH NEXUS
-- Data: 19 de Janeiro de 2025
-- =================================================================

-- Função: add_knowledge
CREATE OR REPLACE FUNCTION public.add_knowledge(p_user_id uuid, p_category text, p_key_info text, p_value_info jsonb, p_importance_score integer DEFAULT 5, p_tags text[] DEFAULT '{}'::text[])
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  knowledge_id UUID;
BEGIN
  INSERT INTO public.user_knowledge (
    user_id,
    category, 
    key_info,
    value_info,
    importance_score,
    tags
  ) VALUES (
    p_user_id,
    p_category,
    p_key_info, 
    p_value_info,
    p_importance_score,
    p_tags
  )
  RETURNING id INTO knowledge_id;
  
  RETURN knowledge_id;
END;
$function$;

-- Função: auto_calculate_heart_zones
CREATE OR REPLACE FUNCTION public.auto_calculate_heart_zones()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_age INTEGER;
  avg_resting_hr INTEGER;
  zones JSONB;
BEGIN
  -- Buscar idade do usuário
  SELECT age INTO user_age FROM public.profiles WHERE user_id = NEW.user_id;
  
  -- Calcular FC de repouso média dos últimos dados
  SELECT AVG(heart_rate_bpm)::INTEGER INTO avg_resting_hr
  FROM public.heart_rate_data 
  WHERE user_id = NEW.user_id 
    AND activity_type = 'rest' 
    AND recorded_at >= NOW() - INTERVAL '30 days';
  
  -- Se não tem dados de repouso, usar padrão
  IF avg_resting_hr IS NULL THEN
    avg_resting_hr := 60;
  END IF;
  
  -- Calcular zonas
  IF user_age IS NOT NULL THEN
    zones := calculate_heart_rate_zones(user_age, avg_resting_hr);
    NEW.zones := zones;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Função: auto_save_session_progress
CREATE OR REPLACE FUNCTION public.auto_save_session_progress(p_user_id uuid, p_session_id text, p_progress_data jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE user_sessions 
  SET 
    auto_save_data = p_progress_data,
    last_activity = NOW()
  WHERE user_id = p_user_id 
    AND session_id = p_session_id;
    
  RETURN FOUND;
END;
$function$;

-- Função: calculate_heart_rate_zones
CREATE OR REPLACE FUNCTION public.calculate_heart_rate_zones(age integer, resting_hr integer DEFAULT 60)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  max_hr INTEGER;
  zone1_min INTEGER;
  zone1_max INTEGER;
  zone2_min INTEGER;
  zone2_max INTEGER;
  zone3_min INTEGER;
  zone3_max INTEGER;
  zone4_min INTEGER;
  zone4_max INTEGER;
  zone5_min INTEGER;
  zone5_max INTEGER;
BEGIN
  -- Calcular frequência cardíaca máxima
  max_hr := 220 - age;
  
  -- Calcular zonas usando método de Karvonen
  zone1_min := resting_hr + ((max_hr - resting_hr) * 0.50)::INTEGER;
  zone1_max := resting_hr + ((max_hr - resting_hr) * 0.60)::INTEGER;
  
  zone2_min := resting_hr + ((max_hr - resting_hr) * 0.60)::INTEGER;
  zone2_max := resting_hr + ((max_hr - resting_hr) * 0.70)::INTEGER;
  
  zone3_min := resting_hr + ((max_hr - resting_hr) * 0.70)::INTEGER;
  zone3_max := resting_hr + ((max_hr - resting_hr) * 0.80)::INTEGER;
  
  zone4_min := resting_hr + ((max_hr - resting_hr) * 0.80)::INTEGER;
  zone4_max := resting_hr + ((max_hr - resting_hr) * 0.90)::INTEGER;
  
  zone5_min := resting_hr + ((max_hr - resting_hr) * 0.90)::INTEGER;
  zone5_max := max_hr;
  
  RETURN jsonb_build_object(
    'max_hr', max_hr,
    'resting_hr', resting_hr,
    'zone1', jsonb_build_object('name', 'Recuperação', 'min', zone1_min, 'max', zone1_max, 'color', '#4CAF50'),
    'zone2', jsonb_build_object('name', 'Base Aeróbica', 'min', zone2_min, 'max', zone2_max, 'color', '#2196F3'),
    'zone3', jsonb_build_object('name', 'Aeróbico', 'min', zone3_min, 'max', zone3_max, 'color', '#FF9800'),
    'zone4', jsonb_build_object('name', 'Limiar', 'min', zone4_min, 'max', zone4_max, 'color', '#FF5722'),
    'zone5', jsonb_build_object('name', 'Neuromuscular', 'min', zone5_min, 'max', zone5_max, 'color', '#F44336')
  );
END;
$function$;

-- Função: calculate_level_from_xp
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(total_xp integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Cada nível requer 1000 XP
  RETURN GREATEST(1, (total_xp / 1000) + 1);
END;
$function$;

-- Função: calculate_user_level
CREATE OR REPLACE FUNCTION public.calculate_user_level(points integer)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  CASE 
    WHEN points >= 10000 THEN RETURN 'Mestre';
    WHEN points >= 5000 THEN RETURN 'Especialista';
    WHEN points >= 2000 THEN RETURN 'Avançado';
    WHEN points >= 1000 THEN RETURN 'Experiente';
    WHEN points >= 500 THEN RETURN 'Intermediário';
    WHEN points >= 100 THEN RETURN 'Dedicado';
    ELSE RETURN 'Iniciante';
  END CASE;
END;
$function$;

-- Função: check_achievements
CREATE OR REPLACE FUNCTION public.check_achievements()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

  RETURN NEW;
END;
$function$;

-- Função: complete_session_cycle
CREATE OR REPLACE FUNCTION public.complete_session_cycle(p_user_id uuid, p_session_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_current_cycle INTEGER;
  v_next_date DATE;
  v_result JSONB;
BEGIN
  -- Buscar ciclo atual
  SELECT cycle_number INTO v_current_cycle
  FROM user_sessions
  WHERE user_id = p_user_id AND session_id = p_session_id;
  
  -- Calcular próxima data (30 dias)
  v_next_date := CURRENT_DATE + INTERVAL '30 days';
  
  -- Atualizar sessão atual como completa e bloqueada
  UPDATE user_sessions 
  SET 
    status = 'completed',
    progress = 100,
    completed_at = NOW(),
    is_locked = TRUE,
    next_available_date = v_next_date
  WHERE user_id = p_user_id AND session_id = p_session_id;
  
  v_result := jsonb_build_object(
    'cycle_completed', v_current_cycle,
    'next_cycle', v_current_cycle + 1,
    'next_available_date', v_next_date,
    'status', 'success'
  );
  
  RETURN v_result;
END;
$function$;

-- Função: generate_weekly_insights
CREATE OR REPLACE FUNCTION public.generate_weekly_insights()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
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
  session_total_points INTEGER;
  total_water_count INTEGER;
  total_sleep_count INTEGER;
  total_exercise_count INTEGER;
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
    session_total_points
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

-- Função: process_health_wheel_responses
CREATE OR REPLACE FUNCTION public.process_health_wheel_responses(p_user_id uuid, p_session_id text, p_system_name text, p_responses jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_score INTEGER := 0;
  v_question_count INTEGER;
  v_yes_count INTEGER;
BEGIN
  -- Calcular score baseado nas respostas
  SELECT 
    jsonb_array_length(p_responses),
    (SELECT COUNT(*) FROM jsonb_array_elements_text(p_responses) WHERE value = 'Não')
  INTO v_question_count, v_yes_count;
  
  -- Score = (número de "Não" / total de questões) * 100
  IF v_question_count > 0 THEN
    v_score := ROUND((v_yes_count::NUMERIC / v_question_count::NUMERIC) * 100);
  END IF;
  
  -- Salvar resposta
  INSERT INTO health_wheel_responses (
    user_id,
    session_id,
    system_name,
    responses,
    score,
    updated_at
  )
  VALUES (
    p_user_id,
    p_session_id,
    p_system_name,
    p_responses,
    v_score,
    NOW()
  )
  ON CONFLICT (user_id, session_id, system_name) 
  DO UPDATE SET
    responses = EXCLUDED.responses,
    score = EXCLUDED.score,
    updated_at = NOW();
    
  RETURN v_score;
END;
$function$;

-- Função: update_user_streak
CREATE OR REPLACE FUNCTION public.update_user_streak()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- =================================================================
-- FUNÇÕES DE VALIDAÇÃO E TESTE
-- =================================================================

-- Função: validate_system_health
CREATE OR REPLACE FUNCTION public.validate_system_health()
 RETURNS TABLE(component text, status text, details text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  role_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Contar usuários
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO role_count FROM user_roles;
  
  -- Contar triggers críticos
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger pt
  JOIN pg_class pc ON pt.tgrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'auth' 
    AND pc.relname = 'users'
    AND pt.tgname IN ('on_auth_user_created', 'on_auth_user_role_created');

  -- Retornar status
  RETURN QUERY VALUES 
    ('Users', 'OK', user_count::TEXT || ' users found'),
    ('Profiles', CASE WHEN profile_count = user_count THEN 'OK' ELSE 'ERROR' END, 
     profile_count::TEXT || '/' || user_count::TEXT || ' profiles'),
    ('Roles', CASE WHEN role_count = user_count THEN 'OK' ELSE 'ERROR' END,
     role_count::TEXT || '/' || user_count::TEXT || ' roles'),
    ('Triggers', CASE WHEN trigger_count >= 2 THEN 'OK' ELSE 'ERROR' END,
     trigger_count::TEXT || ' auth triggers active');
END;
$function$;

-- Função: debug_user_setup
CREATE OR REPLACE FUNCTION public.debug_user_setup(input_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(user_id uuid, email text, has_profile boolean, has_role boolean, role_name text, profile_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    (p.id IS NOT NULL) as has_profile,
    (ur.user_id IS NOT NULL) as has_role,
    COALESCE(ur.role::TEXT, '') as role_name,
    COALESCE(p.full_name, '') as profile_name
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.user_id
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  WHERE (input_user_id IS NULL OR au.id = input_user_id)
  ORDER BY au.created_at DESC;
END;
$function$;