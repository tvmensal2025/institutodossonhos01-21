-- Unify user_profiles -> profiles (idempotent, non-destructive, no drops)
-- Goal: Keep profiles as single source of truth without breaking existing flows

-- 0) Safety: ensure base table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  height DECIMAL(5,2),
  target_weight DECIMAL(5,2),
  current_weight DECIMAL(5,2),
  age INTEGER,
  gender TEXT,
  activity_level TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1) Superset: add optional columns commonly found in user_profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR',
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- 2) Normalize gender values (EN -> PT) before enforcing a single CHECK
DO $$
BEGIN
  -- Normalize in profiles
  UPDATE public.profiles
     SET gender = CASE gender
                    WHEN 'male' THEN 'masculino'
                    WHEN 'female' THEN 'feminino'
                    WHEN 'other' THEN 'outro'
                    ELSE gender
                  END
   WHERE gender IN ('male','female','other');

  -- Normalize in user_profiles, if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    UPDATE public.user_profiles
       SET gender = CASE gender
                      WHEN 'male' THEN 'masculino'
                      WHEN 'female' THEN 'feminino'
                      WHEN 'other' THEN 'outro'
                      ELSE gender
                    END
     WHERE gender IN ('male','female','other');
  END IF;
END $$;

-- 3) Enforce single canonical CHECK for gender on profiles (drop any prior gender checks)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
     WHERE n.nspname = 'public'
       AND t.relname = 'profiles'
       AND c.contype = 'c'
       AND pg_get_constraintdef(c.oid) ILIKE '%gender%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_gender_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_gender_check
      CHECK (gender IS NULL OR gender IN ('masculino','feminino','outro'));
  END IF;
END $$;

-- 4) Merge data from user_profiles into profiles without overwriting existing non-null values
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    -- Update existing profiles with missing fields
    UPDATE public.profiles p
       SET full_name     = COALESCE(p.full_name,     up.full_name),
           email         = COALESCE(p.email,         up.email),
           avatar_url    = COALESCE(p.avatar_url,    up.avatar_url),
           phone         = COALESCE(p.phone,         up.phone),
           date_of_birth = COALESCE(p.date_of_birth, up.date_of_birth),
           gender        = COALESCE(p.gender,        up.gender),
           address       = COALESCE(p.address,       up.address),
           city          = COALESCE(p.city,          up.city),
           state         = COALESCE(p.state,         up.state),
           country       = COALESCE(p.country,       up.country),
           timezone      = COALESCE(p.timezone,      up.timezone),
           language      = COALESCE(p.language,      up.language),
           preferences   = COALESCE(NULLIF(p.preferences, '{}'::jsonb), up.preferences, '{}'::jsonb)
      FROM public.user_profiles up
     WHERE up.user_id IS NOT NULL
       AND up.user_id = p.user_id;

    -- Insert missing profiles
    INSERT INTO public.profiles
      (user_id, full_name, email, avatar_url, phone, date_of_birth, gender,
       address, city, state, country, timezone, language, preferences)
    SELECT up.user_id,
           up.full_name, up.email, up.avatar_url, up.phone, up.date_of_birth, up.gender,
           up.address, up.city, up.state,
           COALESCE(up.country,'Brasil'),
           COALESCE(up.timezone,'America/Sao_Paulo'),
           COALESCE(up.language,'pt-BR'),
           COALESCE(up.preferences, '{}'::jsonb)
      FROM public.user_profiles up
      LEFT JOIN public.profiles p ON p.user_id = up.user_id
     WHERE up.user_id IS NOT NULL
       AND p.user_id IS NULL
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

-- 5) Ensure triggers/timestamps exist (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Define function unconditionally (safe), create trigger only if user_profiles exists
CREATE OR REPLACE FUNCTION public.sync_user_profiles_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.profiles
      (user_id, full_name, email, avatar_url, phone, date_of_birth, gender,
       address, city, state, country, timezone, language, preferences)
    VALUES
      (NEW.user_id, NEW.full_name, NEW.email, NEW.avatar_url, NEW.phone,
       NEW.date_of_birth, NEW.gender, NEW.address, NEW.city, NEW.state,
       COALESCE(NEW.country,'Brasil'), COALESCE(NEW.timezone,'America/Sao_Paulo'),
       COALESCE(NEW.language,'pt-BR'), COALESCE(NEW.preferences,'{}'::jsonb))
    ON CONFLICT (user_id) DO UPDATE SET
      full_name     = COALESCE(EXCLUDED.full_name,     profiles.full_name),
      email         = COALESCE(EXCLUDED.email,         profiles.email),
      avatar_url    = COALESCE(EXCLUDED.avatar_url,    profiles.avatar_url),
      phone         = COALESCE(EXCLUDED.phone,         profiles.phone),
      date_of_birth = COALESCE(EXCLUDED.date_of_birth, profiles.date_of_birth),
      gender        = COALESCE(EXCLUDED.gender,        profiles.gender),
      address       = COALESCE(EXCLUDED.address,       profiles.address),
      city          = COALESCE(EXCLUDED.city,          profiles.city),
      state         = COALESCE(EXCLUDED.state,         profiles.state),
      country       = COALESCE(EXCLUDED.country,       profiles.country),
      timezone      = COALESCE(EXCLUDED.timezone,      profiles.timezone),
      language      = COALESCE(EXCLUDED.language,      profiles.language),
      preferences   = COALESCE(NULLIF(EXCLUDED.preferences,'{}'::jsonb), profiles.preferences, '{}'::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.profiles SET
      full_name     = COALESCE(NEW.full_name,     profiles.full_name),
      email         = COALESCE(NEW.email,         profiles.email),
      avatar_url    = COALESCE(NEW.avatar_url,    profiles.avatar_url),
      phone         = COALESCE(NEW.phone,         profiles.phone),
      date_of_birth = COALESCE(NEW.date_of_birth, profiles.date_of_birth),
      gender        = COALESCE(NEW.gender,        profiles.gender),
      address       = COALESCE(NEW.address,       profiles.address),
      city          = COALESCE(NEW.city,          profiles.city),
      state         = COALESCE(NEW.state,         profiles.state),
      country       = COALESCE(NEW.country,       profiles.country),
      timezone      = COALESCE(NEW.timezone,      profiles.timezone),
      language      = COALESCE(NEW.language,      profiles.language),
      preferences   = COALESCE(NULLIF(NEW.preferences,'{}'::jsonb), profiles.preferences, '{}'::jsonb),
      updated_at    = now()
    WHERE profiles.user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Do not delete from profiles to avoid data loss
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_user_profiles'
    ) THEN
      CREATE TRIGGER trg_sync_user_profiles
        AFTER INSERT OR UPDATE ON public.user_profiles
        FOR EACH ROW EXECUTE FUNCTION public.sync_user_profiles_to_profiles();
    END IF;
  END IF;
END $$;

-- 7) Post-check guidance (run manually in read-only to verify)
-- -- Missing profiles after merge (should be 0):
-- -- SELECT COUNT(*) FROM public.user_profiles up
-- --  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = up.user_id);
-- -- Non-canonical genders (should be 0):
-- -- SELECT COUNT(*) FROM public.profiles WHERE gender IS NOT NULL AND gender NOT IN ('masculino','feminino','outro');


