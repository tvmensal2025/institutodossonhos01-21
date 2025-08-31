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

-- 5) Minimal seed (PT-BR priority), idempotent by canonical_name
-- Helper upsert via ON CONFLICT requires unique constraint - we use insert-if-not-exists pattern
WITH upsert_arroz AS (
  SELECT id FROM public.nutrition_foods WHERE canonical_name = 'Arroz, branco, cozido' LIMIT 1
), ins_arroz AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg, source, source_ref
  )
  SELECT 'Arroz, branco, cozido', 'arroz branco cozido', 'pt-BR', 'cozido', 130, 2.7, 0.3, 28.0, 0.4, 1, 'TACO', 'TACO 4a ed.'
  WHERE NOT EXISTS (SELECT 1 FROM upsert_arroz)
  RETURNING id
), arroz_id AS (
  SELECT id FROM upsert_arroz UNION ALL SELECT id FROM ins_arroz
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT alias, (SELECT id FROM arroz_id)
FROM (VALUES ('arroz branco'), ('arroz cozido'), ('arroz, branco, cozido'), ('arroz')) v(alias)
ON CONFLICT (alias_normalized) DO NOTHING;

-- Arroz yield: cru -> cozido 2.5
INSERT INTO public.nutrition_yields (food_id, from_state, to_state, factor)
SELECT (SELECT id FROM arroz_id), 'cru', 'cozido', 2.5
WHERE NOT EXISTS (
  SELECT 1 FROM public.nutrition_yields 
  WHERE food_id = (SELECT id FROM arroz_id) AND from_state='cru' AND to_state='cozido'
);

-- Frango grelhado
WITH upsert_frango AS (
  SELECT id FROM public.nutrition_foods WHERE canonical_name = 'Frango, peito, grelhado' LIMIT 1
), ins_frango AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg, source, source_ref
  )
  SELECT 'Frango, peito, grelhado', 'frango peito grelhado', 'pt-BR', 'grelhado', 165, 31.0, 3.6, 0.0, 0.0, 74, 'TACO', 'TACO 4a ed.'
  WHERE NOT EXISTS (SELECT 1 FROM upsert_frango)
  RETURNING id
), frango_id AS (
  SELECT id FROM upsert_frango UNION ALL SELECT id FROM ins_frango
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT alias, (SELECT id FROM frango_id)
FROM (VALUES ('frango grelhado'), ('peito de frango'), ('frango')) v(alias)
ON CONFLICT (alias_normalized) DO NOTHING;

-- Frango yield: cru -> grelhado 0.7 (perda de água)
INSERT INTO public.nutrition_yields (food_id, from_state, to_state, factor)
SELECT (SELECT id FROM frango_id), 'cru', 'grelhado', 0.7
WHERE NOT EXISTS (
  SELECT 1 FROM public.nutrition_yields 
  WHERE food_id = (SELECT id FROM frango_id) AND from_state='cru' AND to_state='grelhado'
);

-- Batata frita (com absorção de óleo)
WITH upsert_batata AS (
  SELECT id FROM public.nutrition_foods WHERE canonical_name = 'Batata frita' LIMIT 1
), ins_batata AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg, oil_absorption_factor, source, source_ref
  )
  SELECT 'Batata frita', 'batata frita', 'pt-BR', 'frito', 312, 3.4, 14.5, 41.0, 3.8, 210, 12, 'TACO', 'Valores aproximados TACO'
  WHERE NOT EXISTS (SELECT 1 FROM upsert_batata)
  RETURNING id
), batata_id AS (
  SELECT id FROM upsert_batata UNION ALL SELECT id FROM ins_batata
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT alias, (SELECT id FROM batata_id)
FROM (VALUES ('batata frita'), ('batata, frita')) v(alias)
ON CONFLICT (alias_normalized) DO NOTHING;

-- Molho de tomate
WITH upsert_molho AS (
  SELECT id FROM public.nutrition_foods WHERE canonical_name = 'Molho de tomate' LIMIT 1
), ins_molho AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg, source, source_ref
  )
  SELECT 'Molho de tomate', 'molho de tomate', 'pt-BR', 'pronto', 29, 1.5, 0.2, 5.0, 1.5, 400, 'TACO', 'TACO 4a ed.'
  WHERE NOT EXISTS (SELECT 1 FROM upsert_molho)
  RETURNING id
), molho_id AS (
  SELECT id FROM upsert_molho UNION ALL SELECT id FROM ins_molho
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT alias, (SELECT id FROM molho_id)
FROM (VALUES ('molho de tomate'), ('molho')) v(alias)
ON CONFLICT (alias_normalized) DO NOTHING;

-- Azeite de oliva (densidade para mL->g)
WITH upsert_azeite AS (
  SELECT id FROM public.nutrition_foods WHERE canonical_name = 'Azeite de oliva' LIMIT 1
), ins_azeite AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg, density_g_ml, source, source_ref
  )
  SELECT 'Azeite de oliva', 'azeite de oliva', 'pt-BR', 'liquido', 884, 0, 100, 0, 0, 0, 0.91, 'TACO', 'TACO 4a ed.'
  WHERE NOT EXISTS (SELECT 1 FROM upsert_azeite)
  RETURNING id
), azeite_id AS (
  SELECT id FROM upsert_azeite UNION ALL SELECT id FROM ins_azeite
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT alias, (SELECT id FROM azeite_id)
FROM (VALUES ('azeite'), ('azeite extra virgem'), ('azeite de oliva extra virgem')) v(alias)
ON CONFLICT (alias_normalized) DO NOTHING;

-- 6) Notes: This seed is minimal and can be expanded via admin endpoint.