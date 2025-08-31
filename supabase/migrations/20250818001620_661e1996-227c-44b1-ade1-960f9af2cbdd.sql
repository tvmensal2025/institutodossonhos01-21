-- Ajustar estrutura da tabela challenges para corrigir erros
-- Adicionar colunas faltantes na tabela challenges
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS badge_reward TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS daily_log_type TEXT DEFAULT 'quantity',
ADD COLUMN IF NOT EXISTS daily_log_unit TEXT DEFAULT 'vez',
ADD COLUMN IF NOT EXISTS daily_log_target NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS badge_icon TEXT DEFAULT '🏆',
ADD COLUMN IF NOT EXISTS badge_name TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS tips TEXT[],
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Corrigir estrutura da tabela challenge_participations
ALTER TABLE public.challenge_participations
ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar campos existentes com valores padrão onde necessário
UPDATE public.challenges 
SET xp_reward = points_reward 
WHERE xp_reward IS NULL AND points_reward IS NOT NULL;

-- Criar constraint única para participações de desafio
ALTER TABLE public.challenge_participations 
DROP CONSTRAINT IF EXISTS challenge_participations_user_challenge_unique;

ALTER TABLE public.challenge_participations 
ADD CONSTRAINT challenge_participations_user_challenge_unique 
UNIQUE (user_id, challenge_id);

-- Verificar estrutura das tabelas
SELECT 'Estrutura da tabela challenges:' as info,
       column_name, 
       data_type, 
       is_nullable, 
       column_default
FROM information_schema.columns 
WHERE table_name = 'challenges' 
AND table_schema = 'public'
ORDER BY ordinal_position;