-- Meal Plans Schema — idempotent and safe
-- Creates: meal_plans, meal_plan_items with RLS and helpful triggers

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 0.1) Helper function to update updated_at (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1) Tables
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  context JSONB NOT NULL DEFAULT '{}'::jsonb, -- constraints and intake snapshot
  source TEXT NOT NULL DEFAULT 'planner_v1', -- ai/planner identifier
  model_version TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  total_kcal NUMERIC NOT NULL DEFAULT 0,
  protein_g NUMERIC NOT NULL DEFAULT 0,
  fat_g NUMERIC NOT NULL DEFAULT 0,
  carbs_g NUMERIC NOT NULL DEFAULT 0,
  fiber_g NUMERIC NOT NULL DEFAULT 0,
  sodium_mg NUMERIC NOT NULL DEFAULT 0,
  cost_estimate NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  slot TEXT NOT NULL, -- breakfast, lunch, snack, dinner, supper
  item_name TEXT NOT NULL,
  food_id UUID REFERENCES public.nutrition_foods(id) ON DELETE SET NULL,
  grams NUMERIC NOT NULL DEFAULT 0,
  ml NUMERIC,
  state TEXT,
  kcal NUMERIC NOT NULL DEFAULT 0,
  protein_g NUMERIC NOT NULL DEFAULT 0,
  fat_g NUMERIC NOT NULL DEFAULT 0,
  carbs_g NUMERIC NOT NULL DEFAULT 0,
  fiber_g NUMERIC NOT NULL DEFAULT 0,
  sodium_mg NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON public.meal_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_plan ON public.meal_plan_items(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_slot ON public.meal_plan_items(slot);

-- 3) Triggers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_meal_plans_updated_at') THEN
    CREATE TRIGGER trg_meal_plans_updated_at
    BEFORE UPDATE ON public.meal_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- 4) RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- meal_plans policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plans' AND policyname='meal_plans_select_own'
  ) THEN
    CREATE POLICY meal_plans_select_own ON public.meal_plans
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plans' AND policyname='meal_plans_insert_own'
  ) THEN
    CREATE POLICY meal_plans_insert_own ON public.meal_plans
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plans' AND policyname='meal_plans_update_own'
  ) THEN
    CREATE POLICY meal_plans_update_own ON public.meal_plans
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plans' AND policyname='meal_plans_delete_own'
  ) THEN
    CREATE POLICY meal_plans_delete_own ON public.meal_plans
      FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- meal_plan_items policies (join to parent)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plan_items' AND policyname='meal_plan_items_select_own'
  ) THEN
    CREATE POLICY meal_plan_items_select_own ON public.meal_plan_items
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.meal_plans mp WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
      ));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plan_items' AND policyname='meal_plan_items_mutate_own'
  ) THEN
    CREATE POLICY meal_plan_items_mutate_own ON public.meal_plan_items
      FOR ALL USING (EXISTS (
        SELECT 1 FROM public.meal_plans mp WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
      )) WITH CHECK (EXISTS (
        SELECT 1 FROM public.meal_plans mp WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
      ));
  END IF;
END $$;

-- 5) Service role write-through (optional) — allow service role to bypass
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plans' AND policyname='meal_plans_service_write'
  ) THEN
    CREATE POLICY meal_plans_service_write ON public.meal_plans
      FOR ALL TO authenticated, anon
      USING ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role')
      WITH CHECK ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plan_items' AND policyname='meal_plan_items_service_write'
  ) THEN
    CREATE POLICY meal_plan_items_service_write ON public.meal_plan_items
      FOR ALL TO authenticated, anon
      USING ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role')
      WITH CHECK ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
  END IF;
END $$;


