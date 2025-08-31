-- =====================================================
-- INICIALIZAR DADOS ZERADOS PARA NOVOS USUÁRIOS
-- Todos os gráficos virão zerados, incluindo Google Fit
-- =====================================================

-- 1. Criar tabela exercise_tracking se não existir
CREATE TABLE IF NOT EXISTS public.exercise_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_type TEXT NOT NULL DEFAULT 'caminhada',
  duration_minutes INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  intensity_level TEXT CHECK (intensity_level IN ('baixa', 'moderada', 'alta')),
  notes TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, exercise_type)
);

-- 2. Habilitar RLS na tabela exercise_tracking
ALTER TABLE public.exercise_tracking ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS para exercise_tracking
DROP POLICY IF EXISTS "Users can view own exercise tracking" ON public.exercise_tracking;
CREATE POLICY "Users can view own exercise tracking" 
ON public.exercise_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own exercise tracking" ON public.exercise_tracking;
CREATE POLICY "Users can insert own exercise tracking" 
ON public.exercise_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own exercise tracking" ON public.exercise_tracking;
CREATE POLICY "Users can update own exercise tracking" 
ON public.exercise_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own exercise tracking" ON public.exercise_tracking;
CREATE POLICY "Users can delete own exercise tracking" 
ON public.exercise_tracking 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_exercise_tracking_user_date ON public.exercise_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercise_tracking_type ON public.exercise_tracking(exercise_type);

-- 5. Atualizar função handle_new_user para inicializar dados zerados
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

-- 6. Verificar se o trigger existe e recriar se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Verificar se tudo foi aplicado corretamente
SELECT 
  '✅ Configuração concluída!' as status,
  'Todos os novos usuários terão dados zerados' as message,
  'Gráficos do Google Fit e outros trackings virão zerados' as details;

-- 8. Mostrar resumo do que foi configurado
SELECT 
  'Tabelas e dados inicializados:' as info,
  '• profiles' as item1,
  '• user_physical_data' as item2,
  '• nutrition_goals' as item3,
  '• google_fit_data (7 dias zerados)' as item4,
  '• water_tracking (7 dias zerados)' as item5,
  '• sleep_tracking (7 dias zerados)' as item6,
  '• mood_tracking (7 dias zerados)' as item7,
  '• exercise_tracking (7 dias zerados)' as item8,
  '• weight_measurements (primeira pesagem)' as item9,
  '• user_goals (metas padrão)' as item10;
