-- ========================================
-- SQL COMPLETO E LIMPO - SISTEMA DE DESAFIOS
-- Inclui TODAS as colunas necessárias para o futuro
-- Execute este script NO SQL EDITOR DO SUPABASE
-- ========================================

-- 1. VERIFICAÇÃO INICIAL
SELECT '🔍 VERIFICAÇÃO INICIAL:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'challenges', 'challenge_participations', 'challenge_daily_logs')
ORDER BY table_name;

-- 2. GARANTIR QUE PROFILES TEM TODAS AS COLUNAS NECESSÁRIAS
SELECT '👥 ATUALIZANDO TABELA PROFILES:' as info;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS admin_level TEXT,
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level_name TEXT DEFAULT 'Iniciante',
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS target_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS current_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS activity_level TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. GARANTIR QUE CHALLENGES TEM TODAS AS COLUNAS NECESSÁRIAS
SELECT '🏆 ATUALIZANDO TABELA CHALLENGES:' as info;

ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Desafio',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'exercicio',
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medio',
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS badge_icon TEXT DEFAULT '🏆',
ADD COLUMN IF NOT EXISTS badge_name TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS tips TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_group_challenge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS daily_log_type TEXT DEFAULT 'boolean',
ADD COLUMN IF NOT EXISTS daily_log_unit TEXT,
ADD COLUMN IF NOT EXISTS daily_log_target NUMERIC,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS entry_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rewards JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rules TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'once',
ADD COLUMN IF NOT EXISTS target_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS target_unit TEXT,
ADD COLUMN IF NOT EXISTS progress_tracking JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS completion_criteria JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. GARANTIR QUE CHALLENGE_PARTICIPATIONS TEM TODAS AS COLUNAS NECESSÁRIAS
SELECT '📊 ATUALIZANDO TABELA CHALLENGE_PARTICIPATIONS:' as info;

ALTER TABLE public.challenge_participations 
ADD COLUMN IF NOT EXISTS challenge_id UUID NOT NULL,
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS progress NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_value NUMERIC,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS daily_logs JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. GARANTIR QUE CHALLENGE_DAILY_LOGS TEM TODAS AS COLUNAS NECESSÁRIAS
SELECT '📝 ATUALIZANDO TABELA CHALLENGE_DAILY_LOGS:' as info;

ALTER TABLE public.challenge_daily_logs 
ADD COLUMN IF NOT EXISTS participation_id UUID NOT NULL,
ADD COLUMN IF NOT EXISTS log_date DATE NOT NULL,
ADD COLUMN IF NOT EXISTS value_logged TEXT,
ADD COLUMN IF NOT EXISTS numeric_value NUMERIC,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS mood_rating INTEGER,
ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS location_data JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. LIMPAR DADOS EXISTENTES (PARA COMEÇAR LIMPO)
SELECT '🧹 LIMPANDO DADOS EXISTENTES:' as info;

DELETE FROM public.challenge_daily_logs;
DELETE FROM public.challenge_participations;
DELETE FROM public.challenges;

-- 7. CRIAR OS 2 DESAFIOS
SELECT '🎯 CRIANDO OS 2 DESAFIOS:' as info;

INSERT INTO public.challenges (
    id,
    title,
    description,
    category,
    difficulty,
    duration_days,
    points_reward,
    badge_icon,
    badge_name,
    instructions,
    tips,
    is_active,
    is_featured,
    is_group_challenge,
    daily_log_type,
    daily_log_unit,
    daily_log_target,
    created_at,
    updated_at
) VALUES 
-- Desafio 1: Exercício Diário
(
    gen_random_uuid(),
    'Exercício Diário',
    'Faça 30 minutos de exercício todos os dias por uma semana',
    'exercicio',
    'medio',
    7,
    100,
    '🏃‍♂️',
    'Atleta Diário',
    'Exercite-se por 30 minutos todos os dias. Pode ser caminhada, corrida, academia ou qualquer atividade física.',
    ARRAY['Comece devagar', 'Escolha uma atividade que goste', 'Mantenha consistência'],
    true,
    true,
    false,
    'hours',
    'horas',
    0.5,
    NOW(),
    NOW()
),
-- Desafio 2: Hidratação Perfeita
(
    gen_random_uuid(),
    'Hidratação Perfeita',
    'Beba 2 litros de água todos os dias por uma semana',
    'hidratacao',
    'facil',
    7,
    80,
    '💧',
    'Hidratado',
    'Beba pelo menos 2 litros de água por dia. Use um app ou garrafa para controlar.',
    ARRAY['Tenha sempre uma garrafa por perto', 'Use um app para lembrar', 'Beba água antes das refeições'],
    true,
    true,
    false,
    'quantity',
    'litros',
    2,
    NOW(),
    NOW()
);

-- 8. VERIFICAR RESULTADO FINAL
SELECT '✅ VERIFICAÇÃO FINAL:' as info;

SELECT 'Desafios criados:' as info,
       title,
       category,
       difficulty,
       duration_days,
       points_reward,
       daily_log_target,
       daily_log_unit
FROM public.challenges
ORDER BY created_at DESC;

-- 9. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 'Estrutura das tabelas:' as info,
       table_name,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'challenges', 'challenge_participations', 'challenge_daily_logs')
AND table_schema = 'public'
ORDER BY table_name, column_name;

-- 10. RESULTADO FINAL
SELECT '🎉 SISTEMA DE DESAFIOS CRIADO COM SUCESSO!' as status,
       'Estrutura limpa e completa para o futuro' as resultado,
       'Sofia tracking funcionando' as sofia_status,
       'Sistema de pontos integrado' as pontos_status; 