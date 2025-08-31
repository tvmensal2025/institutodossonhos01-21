-- Idempotent setup for alias learning and curated aliases

-- 1) Pending aliases table (for auto-logging unresolved/misresolved items)
CREATE TABLE IF NOT EXISTS public.nutrition_aliases_pending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_normalized TEXT UNIQUE NOT NULL,
  suggested_food_id UUID NULL REFERENCES public.nutrition_foods(id) ON DELETE SET NULL,
  occurrences INTEGER NOT NULL DEFAULT 1,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nutrition_aliases_pending ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nutrition_aliases_pending' AND policyname='nutrition_aliases_pending_read_all'
  ) THEN
    CREATE POLICY nutrition_aliases_pending_read_all ON public.nutrition_aliases_pending FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nutrition_aliases_pending' AND policyname='nutrition_aliases_pending_write_service'
  ) THEN
    CREATE POLICY nutrition_aliases_pending_write_service ON public.nutrition_aliases_pending
      FOR ALL TO authenticated, anon
      USING ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role')
      WITH CHECK ( current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
  END IF;
END $$;

-- 2) Curated aliases (map popular names to prepared variants with macros)
-- Carne de panela -> carne bovina cozida
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT public.normalize_text('carne de panela'), f.id
FROM public.nutrition_foods f
WHERE f.locale = 'pt-BR'
  AND public.normalize_text(f.canonical_name) = public.normalize_text('Carne bovina cozida')
ON CONFLICT (alias_normalized) DO NOTHING;

-- Bife -> carne bovina grelhada
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT public.normalize_text('bife'), f.id
FROM public.nutrition_foods f
WHERE f.locale = 'pt-BR'
  AND public.normalize_text(f.canonical_name) = public.normalize_text('Carne bovina grelhada')
ON CONFLICT (alias_normalized) DO NOTHING;

-- Batata -> batata cozida
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT public.normalize_text('batata'), f.id
FROM public.nutrition_foods f
WHERE f.locale = 'pt-BR'
  AND public.normalize_text(f.canonical_name) = public.normalize_text('Batata cozida')
ON CONFLICT (alias_normalized) DO NOTHING;

-- Arroz -> Arroz, branco, cozido
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT public.normalize_text('arroz'), f.id
FROM public.nutrition_foods f
WHERE f.locale = 'pt-BR'
  AND public.normalize_text(f.canonical_name) = public.normalize_text('Arroz, branco, cozido')
ON CONFLICT (alias_normalized) DO NOTHING;

-- Feijão -> Feijão carioca cozido (se existir) senão Feijão preto cozido
DO $$
DECLARE v_food_id UUID;
BEGIN
  SELECT id INTO v_food_id FROM public.nutrition_foods
   WHERE locale = 'pt-BR'
     AND public.normalize_text(canonical_name) = public.normalize_text('Feijão carioca cozido')
   LIMIT 1;
  IF v_food_id IS NULL THEN
    SELECT id INTO v_food_id FROM public.nutrition_foods
     WHERE locale = 'pt-BR'
       AND public.normalize_text(canonical_name) = public.normalize_text('Feijão preto cozido')
     LIMIT 1;
  END IF;
  IF v_food_id IS NOT NULL THEN
    INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
    VALUES (public.normalize_text('feijão'), v_food_id)
    ON CONFLICT (alias_normalized) DO NOTHING;
  END IF;
END $$;

-- Salada -> Salada verde
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT public.normalize_text('salada'), f.id
FROM public.nutrition_foods f
WHERE f.locale = 'pt-BR'
  AND public.normalize_text(f.canonical_name) = public.normalize_text('Salada verde')
ON CONFLICT (alias_normalized) DO NOTHING;

-- Farofa -> Farofa pronta
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT public.normalize_text('farofa'), f.id
FROM public.nutrition_foods f
WHERE f.locale = 'pt-BR'
  AND public.normalize_text(f.canonical_name) = public.normalize_text('Farofa pronta')
ON CONFLICT (alias_normalized) DO NOTHING;

-- Vinagrete -> Molho vinagrete
INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
SELECT public.normalize_text('vinagrete'), f.id
FROM public.nutrition_foods f
WHERE f.locale = 'pt-BR'
  AND public.normalize_text(f.canonical_name) = public.normalize_text('Molho vinagrete')
ON CONFLICT (alias_normalized) DO NOTHING;

-- Maionese -> Maionese (comercial) se existir
DO $$
DECLARE v_food_id2 UUID;
BEGIN
  SELECT id INTO v_food_id2 FROM public.nutrition_foods
   WHERE locale='pt-BR' AND (
     public.normalize_text(canonical_name) = public.normalize_text('Maionese') OR
     public.normalize_text(canonical_name) = public.normalize_text('Maionese (comercial)')
   )
   LIMIT 1;
  IF v_food_id2 IS NOT NULL THEN
    INSERT INTO public.nutrition_aliases (alias_normalized, food_id)
    VALUES (public.normalize_text('maionese'), v_food_id2)
    ON CONFLICT (alias_normalized) DO NOTHING;
  END IF;
END $$;



