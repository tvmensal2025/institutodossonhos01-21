-- ✅ CORREÇÃO: Sistema de cardápios - Adicionar coluna plan_type ausente

-- 1. Adicionar coluna plan_type na tabela meal_plan_history
ALTER TABLE public.meal_plan_history 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'custom';

-- 2. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_meal_plan_history_plan_type 
ON public.meal_plan_history(plan_type);

-- 3. Atualizar registros existentes com valor padrão
UPDATE public.meal_plan_history 
SET plan_type = 'custom' 
WHERE plan_type IS NULL;