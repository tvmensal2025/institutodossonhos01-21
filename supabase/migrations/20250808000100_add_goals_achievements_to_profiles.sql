-- Adiciona colunas de metas e conquistas ao perfil de usuários
-- Seguro para executar várias vezes (IF NOT EXISTS)

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT ARRAY[]::text[];

COMMIT;

-- Verificação rápida (opcional):
-- SELECT column_name
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name IN ('goals','achievements');








