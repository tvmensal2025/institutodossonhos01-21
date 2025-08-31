-- Fix division by zero in generate_weekly_insights function
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
  total_points INTEGER;
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

  -- Encontrar gratidão mais comum
  SELECT answer INTO most_gratitude
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end
    AND question_id = 'gratitude'
  GROUP BY answer
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Calcular consistência de água (prevenir divisão por zero)
  SELECT COUNT(*) INTO total_water_count
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end
    AND question_id = 'water_intake';

  IF total_water_count > 0 THEN
    SELECT 
      (COUNT(CASE WHEN answer IN ('2L', '3L ou mais') THEN 1 END)::DECIMAL / total_water_count) * 100
    INTO water_consistency
    FROM daily_responses
    WHERE user_id = NEW.user_id
      AND date BETWEEN week_start AND week_end
      AND question_id = 'water_intake';
  ELSE
    water_consistency := 0;
  END IF;

  -- Calcular consistência de sono (prevenir divisão por zero)
  SELECT COUNT(*) INTO total_sleep_count
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end
    AND question_id = 'sleep_hours';

  IF total_sleep_count > 0 THEN
    SELECT 
      (COUNT(CASE WHEN answer IN ('8h', '9h+') THEN 1 END)::DECIMAL / total_sleep_count) * 100
    INTO sleep_consistency
    FROM daily_responses
    WHERE user_id = NEW.user_id
      AND date BETWEEN week_start AND week_end
      AND question_id = 'sleep_hours';
  ELSE
    sleep_consistency := 0;
  END IF;

  -- Calcular frequência de exercício (prevenir divisão por zero)
  SELECT COUNT(*) INTO total_exercise_count
  FROM daily_responses
  WHERE user_id = NEW.user_id
    AND date BETWEEN week_start AND week_end
    AND question_id = 'physical_activity';

  IF total_exercise_count > 0 THEN
    SELECT 
      (COUNT(CASE WHEN answer = 'Sim' THEN 1 END)::DECIMAL / total_exercise_count) * 100
    INTO exercise_freq
    FROM daily_responses
    WHERE user_id = NEW.user_id
      AND date BETWEEN week_start AND week_end
      AND question_id = 'physical_activity';
  ELSE
    exercise_freq := 0;
  END IF;

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