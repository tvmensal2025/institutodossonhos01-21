-- Adicionar coluna evidence_required que está faltando
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN DEFAULT FALSE;

-- Também vou verificar se há outras colunas que podem estar faltando
-- baseado no que vi no código
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS transform_to_challenge BOOLEAN DEFAULT FALSE;