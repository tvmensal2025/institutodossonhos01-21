-- Adicionar colunas que estão faltando na tabela challenges baseado no formData
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS badge_icon TEXT DEFAULT '🏆',
ADD COLUMN IF NOT EXISTS badge_name TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS tips TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS daily_log_type TEXT DEFAULT 'boolean',
ADD COLUMN IF NOT EXISTS daily_log_target NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS daily_log_unit TEXT DEFAULT 'dia',
ADD COLUMN IF NOT EXISTS is_group_challenge BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_participants INTEGER;

-- Renomear xp_reward para points_reward se necessário (para compatibilidade)
-- Manter ambas as colunas para não quebrar código existente
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS xp_reward INTEGER;

-- Atualizar valores existentes
UPDATE public.challenges 
SET points_reward = COALESCE(xp_reward, 100) 
WHERE points_reward IS NULL;

UPDATE public.challenges 
SET xp_reward = COALESCE(points_reward, 100) 
WHERE xp_reward IS NULL;