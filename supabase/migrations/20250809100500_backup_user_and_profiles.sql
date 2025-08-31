-- Backup tables before unifying profiles (idempotent)

DO $$
BEGIN
  -- Backup profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'profiles'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = '_backup_profiles_unify'
  ) THEN
    EXECUTE 'CREATE TABLE public._backup_profiles_unify AS TABLE public.profiles WITH DATA';
  END IF;

  -- Backup user_profiles if present
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = '_backup_user_profiles_unify'
  ) THEN
    EXECUTE 'CREATE TABLE public._backup_user_profiles_unify AS TABLE public.user_profiles WITH DATA';
  END IF;
END $$;

-- Note: This migration only creates backups. No schema/data changes are applied here.






