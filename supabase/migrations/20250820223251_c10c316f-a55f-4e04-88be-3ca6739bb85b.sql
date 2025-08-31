-- Adicionar colunas faltantes na tabela taco_foods para compatibilidade com sofia-deterministic
ALTER TABLE public.taco_foods 
ADD COLUMN IF NOT EXISTS codigo integer,
ADD COLUMN IF NOT EXISTS carboidrato_g numeric,
ADD COLUMN IF NOT EXISTS fibra_alimentar_g numeric,
ADD COLUMN IF NOT EXISTS sodio_mg numeric;

-- Atualizar código baseado no número do alimento se não existir
UPDATE public.taco_foods 
SET codigo = numero_alimento 
WHERE codigo IS NULL;