-- Deterministic Nutrition Schema – full, idempotent
-- Safe to run multiple times

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 0.1) Helper normalization function
CREATE OR REPLACE FUNCTION public.normalize_text(input_text TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(
    regexp_replace(lower(trim(unaccent(coalesce(input_text, '')))), '[^a-z0-9 ]', ' ', 'g'),
    '\\s+', ' ', 'g'
  )
$$;

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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT nutrition_foods_nonnegative CHECK (
    kcal >= 0 AND protein_g >= 0 AND fat_g >= 0 AND carbs_g >= 0 AND fiber_g >= 0 AND sodium_mg >= 0
  )
);

-- Unique key for deterministic upsert
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'nutrition_foods' AND c.conname = 'nutrition_foods_unique_norm_locale_state'
  ) THEN
    ALTER TABLE public.nutrition_foods
      ADD CONSTRAINT nutrition_foods_unique_norm_locale_state
      UNIQUE (canonical_name_normalized, locale, state);
  END IF;
END $$;

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

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'nutrition_yields' AND c.conname = 'nutrition_yields_unique_food_states'
  ) THEN
    ALTER TABLE public.nutrition_yields
      ADD CONSTRAINT nutrition_yields_unique_food_states
      UNIQUE (food_id, from_state, to_state);
  END IF;
END $$;

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
-- Fuzzy search support
CREATE INDEX IF NOT EXISTS idx_nutrition_foods_canonical_trgm ON public.nutrition_foods USING gin (canonical_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_nutrition_aliases_trgm ON public.nutrition_aliases USING gin (alias_normalized gin_trgm_ops);

-- 2.1) Helper search function using trigram distance
CREATE OR REPLACE FUNCTION public.search_food_by_name(q TEXT, q_locale TEXT)
RETURNS TABLE (id uuid, canonical_name text, similarity real)
LANGUAGE sql STABLE AS $$
  SELECT f.id, f.canonical_name, similarity(f.canonical_name, q) AS similarity
  FROM public.nutrition_foods f
  WHERE f.locale = q_locale
  ORDER BY f.canonical_name <-> q
  LIMIT 5
$$;

-- 3) RLS
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

-- Write policies for service role only
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nutrition_foods' AND policyname='nutrition_foods_write_service'
  ) THEN
    CREATE POLICY nutrition_foods_write_service ON public.nutrition_foods
      FOR ALL TO authenticated, anon
      USING ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role')
      WITH CHECK ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nutrition_aliases' AND policyname='nutrition_aliases_write_service'
  ) THEN
    CREATE POLICY nutrition_aliases_write_service ON public.nutrition_aliases
      FOR ALL TO authenticated, anon
      USING ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role')
      WITH CHECK ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nutrition_yields' AND policyname='nutrition_yields_write_service'
  ) THEN
    CREATE POLICY nutrition_yields_write_service ON public.nutrition_yields
      FOR ALL TO authenticated, anon
      USING ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role')
      WITH CHECK ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='recipe_items' AND policyname='recipe_items_write_service'
  ) THEN
    CREATE POLICY recipe_items_write_service ON public.recipe_items
      FOR ALL TO authenticated, anon
      USING ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role')
      WITH CHECK ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
  END IF;
END $$;

-- 4) Triggers to auto-maintain normalized/updated_at
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

-- Auto-normalize canonical name
CREATE OR REPLACE FUNCTION public.nutrition_foods_set_normalized()
RETURNS TRIGGER AS $$
BEGIN
  NEW.canonical_name_normalized := public.normalize_text(NEW.canonical_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_nutrition_foods_set_norm'
  ) THEN
    CREATE TRIGGER trg_nutrition_foods_set_norm
    BEFORE INSERT OR UPDATE ON public.nutrition_foods
    FOR EACH ROW EXECUTE FUNCTION public.nutrition_foods_set_normalized();
  END IF;
END $$;

-- Auto-normalize alias
CREATE OR REPLACE FUNCTION public.nutrition_aliases_set_normalized()
RETURNS TRIGGER AS $$
BEGIN
  NEW.alias_normalized := public.normalize_text(NEW.alias_normalized);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_nutrition_aliases_set_norm'
  ) THEN
    CREATE TRIGGER trg_nutrition_aliases_set_norm
    BEFORE INSERT OR UPDATE ON public.nutrition_aliases
    FOR EACH ROW EXECUTE FUNCTION public.nutrition_aliases_set_normalized();
  END IF;
END $$;

-- 5) Minimal seed (idempotent)
-- Arroz
WITH upsert_arroz AS (
  SELECT id FROM public.nutrition_foods WHERE canonical_name_normalized = public.normalize_text('Arroz, branco, cozido') AND locale='pt-BR' AND state='cozido' LIMIT 1
), ins_arroz AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg, source, source_ref
  )
  SELECT 'Arroz, branco, cozido', public.normalize_text('Arroz, branco, cozido'), 'pt-BR', 'cozido', 130, 2.7, 0.3, 28.0, 0.4, 1, 'TACO', 'TACO 4a ed.'
  WHERE NOT EXISTS (SELECT 1 FROM upsert_arroz)
  ON CONFLICT (canonical_name_normalized, locale, state) DO UPDATE SET updated_at = now()
  RETURNING id
), arroz_id AS (
  SELECT id FROM upsert_arroz UNION ALL SELECT id FROM ins_arroz
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT v.alias, (SELECT id FROM arroz_id)
FROM (VALUES ('arroz branco'), ('arroz cozido'), ('arroz, branco, cozido'), ('arroz')) AS v(alias)
ON CONFLICT (alias_normalized) DO NOTHING;

-- Use direct lookup to avoid CTE scope issues
INSERT INTO public.nutrition_yields (food_id, from_state, to_state, factor)
SELECT f.id, 'cru', 'cozido', 2.5
FROM public.nutrition_foods f
WHERE f.canonical_name_normalized = public.normalize_text('Arroz, branco, cozido')
  AND f.locale = 'pt-BR'
  AND f.state = 'cozido'
ON CONFLICT (food_id, from_state, to_state) DO NOTHING;

-- Frango grelhado
WITH upsert_frango AS (
  SELECT id FROM public.nutrition_foods WHERE canonical_name_normalized = public.normalize_text('Frango, peito, grelhado') AND locale='pt-BR' AND state='grelhado' LIMIT 1
), ins_frango AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg, source, source_ref
  )
  SELECT 'Frango, peito, grelhado', public.normalize_text('Frango, peito, grelhado'), 'pt-BR', 'grelhado', 165, 31.0, 3.6, 0.0, 0.0, 74, 'TACO', 'TACO 4a ed.'
  WHERE NOT EXISTS (SELECT 1 FROM upsert_frango)
  ON CONFLICT (canonical_name_normalized, locale, state) DO UPDATE SET updated_at = now()
  RETURNING id
), frango_id AS (
  SELECT id FROM upsert_frango UNION ALL SELECT id FROM ins_frango
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT v.alias, (SELECT id FROM frango_id)
FROM (VALUES ('frango grelhado'), ('peito de frango'), ('frango')) v(alias)
ON CONFLICT (alias_normalized) DO NOTHING;

INSERT INTO public.nutrition_yields (food_id, from_state, to_state, factor)
SELECT f.id, 'cru', 'grelhado', 0.7
FROM public.nutrition_foods f
WHERE f.canonical_name_normalized = public.normalize_text('Frango, peito, grelhado')
  AND f.locale = 'pt-BR'
  AND f.state = 'grelhado'
ON CONFLICT (food_id, from_state, to_state) DO NOTHING;

-- Batata frita
WITH upsert_batata AS (
  SELECT id FROM public.nutrition_foods WHERE canonical_name_normalized = public.normalize_text('Batata frita') AND locale='pt-BR' AND state='frito' LIMIT 1
), ins_batata AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg, oil_absorption_factor, source, source_ref
  )
  SELECT 'Batata frita', public.normalize_text('Batata frita'), 'pt-BR', 'frito', 312, 3.4, 14.5, 41.0, 3.8, 210, 12, 'TACO', 'Valores aproximados TACO'
  WHERE NOT EXISTS (SELECT 1 FROM upsert_batata)
  ON CONFLICT (canonical_name_normalized, locale, state) DO UPDATE SET updated_at = now()
  RETURNING id
), batata_id AS (
  SELECT id FROM upsert_batata UNION ALL SELECT id FROM ins_batata
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT v.alias, (SELECT id FROM batata_id)
FROM (VALUES ('batata frita'), ('batata, frita')) v(alias)
ON CONFLICT (alias_normalized) DO NOTHING;

-- Molho de tomate
WITH upsert_molho AS (
  SELECT id FROM public.nutrition_foods WHERE canonical_name_normalized = public.normalize_text('Molho de tomate') AND locale='pt-BR' AND state='pronto' LIMIT 1
), ins_molho AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg, source, source_ref
  )
  SELECT 'Molho de tomate', public.normalize_text('Molho de tomate'), 'pt-BR', 'pronto', 29, 1.5, 0.2, 5.0, 1.5, 400, 'TACO', 'TACO 4a ed.'
  WHERE NOT EXISTS (SELECT 1 FROM upsert_molho)
  ON CONFLICT (canonical_name_normalized, locale, state) DO UPDATE SET updated_at = now()
  RETURNING id
), molho_id AS (
  SELECT id FROM upsert_molho UNION ALL SELECT id FROM ins_molho
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT v.alias, (SELECT id FROM molho_id)
FROM (VALUES ('molho de tomate'), ('molho')) v(alias)
ON CONFLICT (alias_normalized) DO NOTHING;

-- Azeite de oliva
WITH upsert_azeite AS (
  SELECT id FROM public.nutrition_foods WHERE canonical_name_normalized = public.normalize_text('Azeite de oliva') AND locale='pt-BR' AND state='liquido' LIMIT 1
), ins_azeite AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg, density_g_ml, source, source_ref
  )
  SELECT 'Azeite de oliva', public.normalize_text('Azeite de oliva'), 'pt-BR', 'liquido', 884, 0, 100, 0, 0, 0, 0.91, 'TACO', 'TACO 4a ed.'
  WHERE NOT EXISTS (SELECT 1 FROM upsert_azeite)
  ON CONFLICT (canonical_name_normalized, locale, state) DO UPDATE SET updated_at = now()
  RETURNING id
), azeite_id AS (
  SELECT id FROM upsert_azeite UNION ALL SELECT id FROM ins_azeite
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT v.alias, (SELECT id FROM azeite_id)
FROM (VALUES ('azeite'), ('azeite extra virgem'), ('azeite de oliva extra virgem')) v(alias)
ON CONFLICT (alias_normalized) DO NOTHING;


