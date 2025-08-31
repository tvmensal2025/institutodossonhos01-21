-- Adicionar coluna created_by na tabela challenges
ALTER TABLE public.challenges 
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;