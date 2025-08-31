-- Remover/limpar chaves somente se a coluna existir (idempotente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='ai_configurations' AND column_name='api_key'
  ) THEN
    EXECUTE 'DELETE FROM public.ai_configurations WHERE api_key IS NOT NULL AND api_key <> '''''' ';
    EXECUTE 'UPDATE public.ai_configurations SET api_key = NULL';
  END IF;
END $$;