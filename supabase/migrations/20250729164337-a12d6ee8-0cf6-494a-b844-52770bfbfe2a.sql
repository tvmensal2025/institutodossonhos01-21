-- Corrigir campos nullable críticos que são usados em políticas RLS

-- Primeiro, atualizar registros existentes que tenham valores NULL nos campos críticos
UPDATE public.challenges SET created_by = auth.uid() WHERE created_by IS NULL;
UPDATE public.custom_saboteurs SET created_by = auth.uid() WHERE created_by IS NULL;

-- Tornar campos NOT NULL onde necessário para segurança
-- Challenges: created_by é usado em políticas RLS e deveria ser NOT NULL
-- Primeiro verificar se há registros com created_by NULL
DO $$ 
BEGIN
  -- Só altera se não houver registros NULL
  IF NOT EXISTS (SELECT 1 FROM public.challenges WHERE created_by IS NULL) THEN
    ALTER TABLE public.challenges ALTER COLUMN created_by SET NOT NULL;
  END IF;
END $$;

-- Custom saboteurs: created_by é usado em políticas RLS  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.custom_saboteurs WHERE created_by IS NULL) THEN
    ALTER TABLE public.custom_saboteurs ALTER COLUMN created_by SET NOT NULL;
  END IF;
END $$;

-- Water tracking: user_id é crítico para RLS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.water_tracking WHERE user_id IS NULL) THEN
    ALTER TABLE public.water_tracking ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Sleep tracking: user_id é crítico para RLS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.sleep_tracking WHERE user_id IS NULL) THEN
    ALTER TABLE public.sleep_tracking ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Mood tracking: user_id é crítico para RLS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.mood_tracking WHERE user_id IS NULL) THEN
    ALTER TABLE public.mood_tracking ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;