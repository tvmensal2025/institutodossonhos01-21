-- Corrigir função handle_new_user para capturar todos os campos e inicializar dados zerados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- 1. Criar profile para o novo usuário
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email,
    avatar_url,
    phone,
    birth_date,
    gender,
    city,
    state,
    height,
    bio,
    goals,
    achievements
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'phone',
    (NEW.raw_user_meta_data ->> 'birth_date')::DATE,
    NEW.raw_user_meta_data ->> 'gender',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state',
    (NEW.raw_user_meta_data ->> 'height')::DECIMAL,
    COALESCE(NEW.raw_user_meta_data ->> 'bio', 'Transformando minha vida através da saúde e bem-estar.'),
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data ? 'goals' THEN 
          ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'goals'))
        ELSE ARRAY['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis']
      END
    ),
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data ? 'achievements' THEN 
          ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'achievements'))
        ELSE ARRAY['Primeira semana completa', 'Primeira pesagem registrada']
      END
    )
  );

  -- 2. Inicializar dados físicos zerados
  INSERT INTO public.user_physical_data (
    user_id,
    altura_cm,
    idade,
    sexo,
    nivel_atividade
  )
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'height')::DECIMAL, 170),
    COALESCE(
      EXTRACT(YEAR FROM AGE((NEW.raw_user_meta_data ->> 'birth_date')::DATE)), 
      30
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'gender', 'nao_informado'),
    'moderado'
  );

  -- 3. Inicializar metas nutricionais padrão
  INSERT INTO public.nutrition_goals (
    user_id,
    calories,
    protein,
    carbs,
    fat,
    fiber
  )
  VALUES (
    NEW.id,
    2000,
    150,
    250,
    65,
    25
  );

  -- 4. Inicializar dados do Google Fit zerados (últimos 7 dias)
  INSERT INTO public.google_fit_data (
    user_id,
    data_date,
    steps_count,
    calories_burned,
    distance_meters,
    heart_rate_avg,
    active_minutes,
    sleep_duration_hours,
    weight_kg,
    height_cm,
    heart_rate_resting,
    heart_rate_max,
    sync_timestamp
  )
  SELECT 
    NEW.id,
    (CURRENT_DATE - INTERVAL '6 days' + (generate_series(0, 6) || ' days')::INTERVAL)::DATE,
    0,
    0,
    0,
    0,
    0,
    0,
    NULL,
    COALESCE((NEW.raw_user_meta_data ->> 'height')::DECIMAL, 170),
    NULL,
    NULL,
    NOW()
  FROM generate_series(0, 6);

  -- 5. Inicializar tracking de água zerado (últimos 7 dias)
  INSERT INTO public.water_tracking (
    user_id,
    date,
    amount_ml
  )
  SELECT 
    NEW.id,
    (CURRENT_DATE - INTERVAL '6 days' + (generate_series(0, 6) || ' days')::INTERVAL)::DATE,
    0
  FROM generate_series(0, 6);

  -- 6. Inicializar tracking de sono zerado (últimos 7 dias)
  INSERT INTO public.sleep_tracking (
    user_id,
    date,
    hours,
    quality
  )
  SELECT 
    NEW.id,
    (CURRENT_DATE - INTERVAL '6 days' + (generate_series(0, 6) || ' days')::INTERVAL)::DATE,
    0,
    NULL
  FROM generate_series(0, 6);

  -- 7. Inicializar tracking de humor zerado (últimos 7 dias)
  INSERT INTO public.mood_tracking (
    user_id,
    date,
    energy_level,
    stress_level,
    day_rating
  )
  SELECT 
    NEW.id,
    (CURRENT_DATE - INTERVAL '6 days' + (generate_series(0, 6) || ' days')::INTERVAL)::DATE,
    NULL,
    NULL,
    NULL
  FROM generate_series(0, 6);

  -- 8. Inicializar tracking de exercício zerado (últimos 7 dias)
  INSERT INTO public.exercise_tracking (
    user_id,
    date,
    exercise_type,
    duration_minutes,
    calories_burned
  )
  SELECT 
    NEW.id,
    (CURRENT_DATE - INTERVAL '6 days' + (generate_series(0, 6) || ' days')::INTERVAL)::DATE,
    'caminhada',
    0,
    0
  FROM generate_series(0, 6);

  -- 9. Inicializar primeira pesagem zerada
  INSERT INTO public.weight_measurements (
    user_id,
    peso_kg,
    imc,
    gordura_corporal_percent,
    massa_muscular_kg,
    agua_corporal_percent,
    measurement_date
  )
  VALUES (
    NEW.id,
    70.0,
    24.0,
    20.0,
    50.0,
    60.0,
    CURRENT_DATE
  );

  -- 10. Inicializar metas de peso padrão
  INSERT INTO public.user_goals (
    user_id,
    peso_meta_kg,
    gordura_corporal_meta_percent,
    imc_meta,
    status
  )
  VALUES (
    NEW.id,
    65.0,
    18.0,
    22.0,
    'ativo'
  );

  RETURN NEW;
END;
$$;
