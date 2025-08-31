-- Deterministic Nutrition Schema (idempotent)
-- 1) Tables
CREATE TABLE IF NOT EXISTS public.nutrition_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  canonical_name_normalized TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  state TEXT NOT NULL DEFAULT 'raw',
  unit_basis TEXT NOT NULL DEFAULT 'per_100g',
  kcal NUMERIC NOT NULL,
  protein_g NUMERIC NOT NULL,
  fat_g NUMERIC NOT NULL,
  carbs_g NUMERIC NOT NULL,
  fiber_g NUMERIC NOT NULL DEFAULT 0,
  sodium_mg NUMERIC NOT NULL DEFAULT 0,
  density_g_ml NUMERIC,
  edible_portion_factor NUMERIC,
  oil_absorption_factor NUMERIC DEFAULT 0,
  source TEXT NOT NULL,
  source_ref TEXT,
  is_recipe BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nutrition_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_normalized TEXT UNIQUE NOT NULL,
  food_id UUID NOT NULL REFERENCES public.nutrition_foods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nutrition_yields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES public.nutrition_foods(id) ON DELETE CASCADE,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  factor NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.nutrition_foods(id) ON DELETE CASCADE,
  ingredient_food_id UUID NOT NULL REFERENCES public.nutrition_foods(id) ON DELETE RESTRICT,
  grams NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_nutrition_foods_canonical_name ON public.nutrition_foods(canonical_name);
CREATE INDEX IF NOT EXISTS idx_nutrition_foods_canonical_name_norm ON public.nutrition_foods(canonical_name_normalized);
CREATE INDEX IF NOT EXISTS idx_nutrition_foods_locale ON public.nutrition_foods(locale);
CREATE INDEX IF NOT EXISTS idx_nutrition_foods_state ON public.nutrition_foods(state);
CREATE INDEX IF NOT EXISTS idx_nutrition_aliases_alias ON public.nutrition_aliases(alias_normalized);
CREATE INDEX IF NOT EXISTS idx_nutrition_yields_food_states ON public.nutrition_yields(food_id, from_state, to_state);

-- 3) RLS (read allowed)
ALTER TABLE public.nutrition_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_yields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nutrition_foods' AND policyname='nutrition_foods_read_all'
  ) THEN
    CREATE POLICY "nutrition_foods_read_all" ON public.nutrition_foods FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nutrition_aliases' AND policyname='nutrition_aliases_read_all'
  ) THEN
    CREATE POLICY "nutrition_aliases_read_all" ON public.nutrition_aliases FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nutrition_yields' AND policyname='nutrition_yields_read_all'
  ) THEN
    CREATE POLICY "nutrition_yields_read_all" ON public.nutrition_yields FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='recipe_items' AND policyname='recipe_items_read_all'
  ) THEN
    CREATE POLICY "recipe_items_read_all" ON public.recipe_items FOR SELECT USING (true);
  END IF;
END $$;

-- 4) Update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_nutrition_foods_updated_at'
  ) THEN
    CREATE TRIGGER trg_nutrition_foods_updated_at
    BEFORE UPDATE ON public.nutrition_foods
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;