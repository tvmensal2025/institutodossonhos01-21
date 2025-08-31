-- Safe RBAC/Admin canonicalization and weight_measurements trigger unification
-- This migration is designed to be idempotent and additive.

-- 1) Ensure role enum/table exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='user_roles'
  ) THEN
    CREATE TABLE public.user_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      role public.app_role NOT NULL,
      assigned_at timestamptz DEFAULT now(),
      assigned_by uuid,
      UNIQUE(user_id, role)
    );
  END IF;
END $$;

-- 2) RLS for user_roles (idempotent)
DO $$
BEGIN
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_roles';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- 3) Canonical helpers: has_role and is_admin_user (security definer, stable)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- Robust admin detection with fallbacks to profiles.role / profiles.is_admin if present
CREATE OR REPLACE FUNCTION public.is_admin_user(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_uid uuid := COALESCE(_uid, auth.uid());
  is_admin boolean := false;
  col_exists boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  -- Primary: user_roles
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = v_uid AND role = 'admin'
  ) INTO is_admin;

  -- Fallback 1: profiles.is_admin (if column exists)
  IF NOT is_admin THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='profiles' AND column_name='is_admin'
    ) INTO col_exists;
    IF col_exists THEN
      SELECT TRUE INTO is_admin
      FROM public.profiles p
      WHERE p.user_id = v_uid AND COALESCE(p.is_admin, false) = true
      LIMIT 1;
      is_admin := COALESCE(is_admin, false);
    END IF;
  END IF;

  -- Fallback 2: profiles.role in ('admin','owner') (if column exists)
  IF NOT is_admin THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='profiles' AND column_name='role'
    ) INTO col_exists;
    IF col_exists THEN
      SELECT TRUE INTO is_admin
      FROM public.profiles p
      WHERE p.user_id = v_uid AND p.role IN ('admin','owner')
      LIMIT 1;
      is_admin := COALESCE(is_admin, false);
    END IF;
  END IF;

  RETURN COALESCE(is_admin, false);
END;
$$;

-- 4) Ensure update_updated_at_column exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5) Unify weight_measurements IMC calculation trigger/function
-- Recreate the calculate_imc function (idempotent), referencing user_physical_profiles.height_cm
CREATE OR REPLACE FUNCTION public.calculate_imc()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_height_cm integer;
BEGIN
  SELECT height_cm INTO user_height_cm
  FROM public.user_physical_profiles
  WHERE user_id = NEW.user_id
  LIMIT 1;

  IF user_height_cm IS NOT NULL THEN
    NEW.imc := NEW.peso_kg / POWER(user_height_cm / 100.0, 2);
    NEW.rce := NEW.circunferencia_abdominal_cm / user_height_cm::decimal;

    IF NEW.rce >= 0.6 THEN
      NEW.risco_cardiometabolico := 'ALTO';
    ELSIF NEW.rce >= 0.5 THEN
      NEW.risco_cardiometabolico := 'MODERADO';
    ELSE
      NEW.risco_cardiometabolico := 'BAIXO';
    END IF;

    IF NEW.imc < 18.5 THEN
      NEW.classificacao_imc := 'Abaixo do peso';
    ELSIF NEW.imc < 25 THEN
      NEW.classificacao_imc := 'Peso normal';
    ELSIF NEW.imc < 30 THEN
      NEW.classificacao_imc := 'Sobrepeso';
    ELSIF NEW.imc < 35 THEN
      NEW.classificacao_imc := 'Obesidade grau I';
    ELSIF NEW.imc < 40 THEN
      NEW.classificacao_imc := 'Obesidade grau II';
    ELSE
      NEW.classificacao_imc := 'Obesidade grau III';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop old trigger names and recreate a single canonical trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='weight_measurements'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS calculate_imc_trigger ON public.weight_measurements';
    EXECUTE 'DROP TRIGGER IF EXISTS weight_measurements_calculate_imc_trigger ON public.weight_measurements';
    EXECUTE 'CREATE TRIGGER weight_measurements_calculate_imc_trigger
              BEFORE INSERT OR UPDATE ON public.weight_measurements
              FOR EACH ROW EXECUTE FUNCTION public.calculate_imc()';
  END IF;
END $$;

-- Ensure updated_at triggers exist without duplicating
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='weight_measurements'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_weight_measurements_updated_at') THEN
      EXECUTE 'CREATE TRIGGER update_weight_measurements_updated_at
                BEFORE UPDATE ON public.weight_measurements
                FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_physical_profiles'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_physical_profiles_updated_at') THEN
      EXECUTE 'CREATE TRIGGER update_user_physical_profiles_updated_at
                BEFORE UPDATE ON public.user_physical_profiles
                FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
    END IF;
  END IF;
END $$;

-- 6) Add admin policies additively (do not remove user policies)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='weight_measurements'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins manage weight measurements" ON public.weight_measurements';
    EXECUTE 'CREATE POLICY "Admins manage weight measurements" ON public.weight_measurements
              FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user())';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_physical_profiles'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins manage physical profiles" ON public.user_physical_profiles';
    EXECUTE 'CREATE POLICY "Admins manage physical profiles" ON public.user_physical_profiles
              FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user())';
  END IF;
END $$;

-- 7) Guidance-only (no-op): For future CHECK constraints on saboteur domain or other enums,
-- prefer: ALTER TABLE ... ADD CONSTRAINT ... CHECK (...) NOT VALID; then clean data and VALIDATE.


