-- Adicionar coluna is_active à ai_configurations e alinhar com o frontend
BEGIN;

ALTER TABLE public.ai_configurations
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- Backfill: se já estiver habilitado, marcar ativo
UPDATE public.ai_configurations
SET is_active = COALESCE(is_enabled, false)
WHERE is_active IS DISTINCT FROM COALESCE(is_enabled, false);

-- Índice para filtragem por ativo
CREATE INDEX IF NOT EXISTS idx_ai_configurations_active
  ON public.ai_configurations(is_active);

-- Garantir updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_ai_configurations_updated_at'
  ) THEN
    CREATE TRIGGER update_ai_configurations_updated_at
    BEFORE UPDATE ON public.ai_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

COMMIT;
