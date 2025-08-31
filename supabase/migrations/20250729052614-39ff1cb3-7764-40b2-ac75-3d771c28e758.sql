-- Adicionar coluna challenge_id que está faltando na tabela user_goals
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES public.challenges(id);

-- Adicionar outras colunas que vejo que o código está tentando usar mas não existem
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medio',
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT FALSE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_goals_challenge_id ON public.user_goals(challenge_id);