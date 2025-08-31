-- Adicionar colunas que o código está tentando usar mas não existem
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS estimated_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_points INTEGER DEFAULT 0;

-- Verificar se a coluna data_inicio deve ser renomeada para deadline em alguns casos
-- ou se ambas devem coexistir (pelo que vejo no código, target_date é mais usado)