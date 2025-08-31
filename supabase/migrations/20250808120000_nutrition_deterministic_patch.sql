-- Idempotent patch to support deterministic nutrition lookup
-- Safe: only additive changes

-- 1) Ensure base columns exist
ALTER TABLE IF EXISTS public.valores_nutricionais_completos
  ADD COLUMN IF NOT EXISTS carboidratos DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS proteina DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS gorduras DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS fibra DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS sodio_mg INTEGER,
  ADD COLUMN IF NOT EXISTS kcal INTEGER;

-- 2) Aliases table for canonical mapping
CREATE TABLE IF NOT EXISTS public.alimentos_alias (
  id BIGSERIAL PRIMARY KEY,
  alimento_id BIGINT NOT NULL REFERENCES public.alimentos_completos(id) ON DELETE CASCADE,
  alias_norm TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (alimento_id, alias_norm)
);
CREATE INDEX IF NOT EXISTS alimentos_alias_norm_idx ON public.alimentos_alias (alias_norm);

-- 3) Density table (g/ml)
CREATE TABLE IF NOT EXISTS public.alimentos_densidades (
  alimento_id BIGINT PRIMARY KEY REFERENCES public.alimentos_completos(id) ON DELETE CASCADE,
  densidade_g_ml DECIMAL(6,3) NOT NULL
);

-- 4) Edible Portion Factor (EPF)
CREATE TABLE IF NOT EXISTS public.alimentos_epf (
  alimento_id BIGINT PRIMARY KEY REFERENCES public.alimentos_completos(id) ON DELETE CASCADE,
  epf DECIMAL(5,2) NOT NULL -- fraction edible (0.0-1.0)
);

-- 5) Yield factors between states (raw/cooked)
CREATE TABLE IF NOT EXISTS public.alimentos_yield (
  id BIGSERIAL PRIMARY KEY,
  alimento_id BIGINT NOT NULL REFERENCES public.alimentos_completos(id) ON DELETE CASCADE,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  factor DECIMAL(6,3) NOT NULL,
  UNIQUE (alimento_id, from_state, to_state)
);
CREATE INDEX IF NOT EXISTS alimentos_yield_idx ON public.alimentos_yield (alimento_id, from_state, to_state);

-- 6) Recipes (composite foods)
CREATE TABLE IF NOT EXISTS public.receitas (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.receita_componentes (
  id BIGSERIAL PRIMARY KEY,
  receita_id BIGINT NOT NULL REFERENCES public.receitas(id) ON DELETE CASCADE,
  alimento_id BIGINT NOT NULL REFERENCES public.alimentos_completos(id) ON DELETE RESTRICT,
  grams DECIMAL(8,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS receita_comp_receita_idx ON public.receita_componentes (receita_id);


