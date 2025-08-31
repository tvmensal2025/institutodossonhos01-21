-- Idempotent fixes: relax daily_responses.section, harden RLS for sessions/lessons, harmonize weight_measurements types

-- 1) Relax daily_responses.section to include saboteurs and saboteurs_results
DO $$
DECLARE conname text;
BEGIN
  SELECT conname INTO conname
  FROM pg_constraint
  WHERE conrelid = 'public.daily_responses'::regclass
    AND contype = 'c';
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.daily_responses DROP CONSTRAINT %I', conname);
  END IF;
END $$;

ALTER TABLE public.daily_responses
  ADD CONSTRAINT daily_responses_section_check
  CHECK (section IN ('morning','habits','mindset','saboteurs','saboteurs_results'));

-- 2) Harden sessions policies (admin-only for writes)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='sessions' LOOP
    EXECUTE format('DROP POLICY %I ON public.sessions', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sessions" ON public.sessions
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update sessions" ON public.sessions
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete sessions" ON public.sessions
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- 3) Harden lessons policies (admin-only for writes; keep public view of published lessons)
DO $$
DECLARE pol2 record;
BEGIN
  FOR pol2 IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='lessons' LOOP
    EXECUTE format('DROP POLICY %I ON public.lessons', pol2.policyname);
  END LOOP;
END $$;

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view published lessons" 
ON public.lessons 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses c 
    JOIN public.course_modules cm ON c.id = cm.course_id 
    WHERE cm.id = lessons.module_id 
    AND c.is_published = true
  )
);

CREATE POLICY "Admin can insert lessons" 
ON public.lessons 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update lessons" 
ON public.lessons 
FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete lessons" 
ON public.lessons 
FOR DELETE 
USING (auth.jwt() ->> 'role' = 'admin');

-- 4) Harmonize weight_measurements column types if needed
DO $$ BEGIN
  -- circunferencia_abdominal_cm to DECIMAL(5,2)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='weight_measurements' AND column_name='circunferencia_abdominal_cm'
  ) THEN
    ALTER TABLE public.weight_measurements 
      ALTER COLUMN circunferencia_abdominal_cm TYPE DECIMAL(5,2)
      USING circunferencia_abdominal_cm::DECIMAL;
  END IF;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  -- agua_corporal_percent to DECIMAL(4,2)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='weight_measurements' AND column_name='agua_corporal_percent'
  ) THEN
    ALTER TABLE public.weight_measurements 
      ALTER COLUMN agua_corporal_percent TYPE DECIMAL(4,2)
      USING agua_corporal_percent::DECIMAL;
  END IF;
EXCEPTION WHEN others THEN NULL; END $$;


