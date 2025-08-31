-- 1) Adicionar coluna system_prompt
ALTER TABLE public.ai_configurations
ADD COLUMN IF NOT EXISTS system_prompt text;

-- 2) Garantir chave única/índice para on_conflict(functionality)
CREATE UNIQUE INDEX IF NOT EXISTS ai_configurations_functionality_unique_idx
ON public.ai_configurations(functionality);

-- 3) Permitir INSERT (mantendo segurança semelhante ao UPDATE existente)
-- Observação: já existe política UPDATE true. Vamos espelhar para INSERT.
CREATE POLICY IF NOT EXISTS "Authenticated users can insert AI configurations"
ON public.ai_configurations
FOR INSERT
WITH CHECK (true);
