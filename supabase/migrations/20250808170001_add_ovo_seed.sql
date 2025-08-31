-- Idempotent seed for egg (ovo) to fix deterministic nutrition for common case
-- Adds 'Ovo de galinha cozido' with canonical macros per 100 g based on TACO

-- Ensure base schema exists (no-op if already applied)
DO $$ BEGIN
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='nutrition_foods';
  IF NOT FOUND THEN
    RAISE NOTICE 'nutrition_foods missing. Apply 20250808160500_nutrition_deterministic_full.sql first.';
  END IF;
END $$;

-- Upsert food row
WITH upsert_egg AS (
  SELECT id FROM public.nutrition_foods
  WHERE canonical_name_normalized = public.normalize_text('Ovo de galinha cozido')
    AND locale = 'pt-BR'
    AND state = 'cozido'
  LIMIT 1
), ins_egg AS (
  INSERT INTO public.nutrition_foods (
    canonical_name, canonical_name_normalized, locale, state, unit_basis,
    kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg,
    source, source_ref, is_recipe
  )
  SELECT
    'Ovo de galinha cozido', public.normalize_text('Ovo de galinha cozido'), 'pt-BR', 'cozido', 'per_100g',
    155, 13.0, 11.0, 1.1, 0.0, 124,
    'TACO', 'TACO 4a ed.', false
  WHERE NOT EXISTS (SELECT 1 FROM upsert_egg)
  ON CONFLICT (canonical_name_normalized, locale, state)
  DO UPDATE SET updated_at = now()
  RETURNING id
), egg_id AS (
  SELECT id FROM upsert_egg UNION ALL SELECT id FROM ins_egg
)
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT v.alias, (SELECT id FROM egg_id)
FROM (VALUES
  ('ovo'),
  ('ovos'),
  ('ovo cozido'),
  ('ovos cozidos'),
  ('ovo de galinha'),
  ('ovo de galinha cozido')
) AS v(alias)
ON CONFLICT (alias_normalized) DO UPDATE SET food_id = EXCLUDED.food_id;


