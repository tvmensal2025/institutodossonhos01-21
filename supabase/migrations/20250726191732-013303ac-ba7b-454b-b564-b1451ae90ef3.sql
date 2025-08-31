-- Adicionar apenas a coluna updated_at na tabela user_goals
ALTER TABLE public.user_goals 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();