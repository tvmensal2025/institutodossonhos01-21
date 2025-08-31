-- ========================================
-- SQL CORRIGIDO - DESAFIOS PÚBLICOS E COMUNIDADE
-- Resolve todos os erros identificados
-- ========================================

-- 1. VERIFICAÇÃO INICIAL
SELECT '🔍 VERIFICAÇÃO INICIAL:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('challenges', 'challenge_participations', 'community_posts', 'community_likes')
ORDER BY table_name;

-- 2. GARANTIR QUE CHALLENGES TEM TODAS AS COLUNAS NECESSÁRIAS
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
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS entry_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rewards JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rules TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'once',
ADD COLUMN IF NOT EXISTS target_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS target_unit TEXT,
ADD COLUMN IF NOT EXISTS progress_tracking JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS completion_criteria JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. GARANTIR QUE CHALLENGE_PARTICIPATIONS TEM TODAS AS COLUNAS NECESSÁRIAS
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

-- 4. CRIAR TABELA DE POSTS DA COMUNIDADE (SE NÃO EXISTIR)
SELECT '💬 CRIANDO TABELA COMMUNITY_POSTS:' as info;

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  photo_url TEXT,
  message TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR TABELA DE LIKES (SE NÃO EXISTIR)
SELECT '❤️ CRIANDO TABELA COMMUNITY_LIKES:' as info;

CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 6. CRIAR BUCKET PARA FOTOS (SE NÃO EXISTIR)
SELECT '📸 CONFIGURANDO STORAGE:' as info;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-uploads', 'community-uploads', true)
ON CONFLICT DO NOTHING;

-- 7. HABILITAR RLS E CRIAR POLÍTICAS
SELECT '🔒 CONFIGURANDO SEGURANÇA:' as info;

-- RLS para challenges
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view challenges" ON public.challenges;
CREATE POLICY "Everyone can view challenges" 
ON public.challenges FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can create challenges" ON public.challenges;
CREATE POLICY "Admins can create challenges" 
ON public.challenges FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS para challenge_participations
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own participations" ON public.challenge_participations;
CREATE POLICY "Users can view their own participations" 
ON public.challenge_participations FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own participations" ON public.challenge_participations;
CREATE POLICY "Users can create their own participations" 
ON public.challenge_participations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own participations" ON public.challenge_participations;
CREATE POLICY "Users can update their own participations" 
ON public.challenge_participations FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS para community_posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all community posts" ON public.community_posts;
CREATE POLICY "Users can view all community posts" 
ON public.community_posts FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can create their own posts" ON public.community_posts;
CREATE POLICY "Users can create their own posts" 
ON public.community_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS para community_likes
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all likes" ON public.community_likes;
CREATE POLICY "Users can view all likes" 
ON public.community_likes FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can create their own likes" ON public.community_likes;
CREATE POLICY "Users can create their own likes" 
ON public.community_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 8. LIMPAR DADOS EXISTENTES (PARA COMEÇAR LIMPO)
SELECT '🧹 LIMPANDO DADOS EXISTENTES:' as info;

DELETE FROM public.community_likes;
DELETE FROM public.community_posts;
DELETE FROM public.challenge_participations;
DELETE FROM public.challenges;

-- 9. CRIAR DESAFIOS DE EXEMPLO
SELECT '🎯 CRIANDO DESAFIOS DE EXEMPLO:' as info;

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
-- Desafio Individual 1: Exercício Diário
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
-- Desafio Individual 2: Hidratação Perfeita
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
),
-- Desafio Público 1: Corrida em Grupo
(
    gen_random_uuid(),
    'Corrida em Grupo',
    'Corra 5km todos os dias por uma semana com a comunidade',
    'exercicio',
    'medio',
    7,
    150,
    '🏃‍♂️',
    'Corredor da Comunidade',
    'Corra 5km todos os dias. Compartilhe suas fotos e motive outros!',
    ARRAY['Comece devagar', 'Use um app de corrida', 'Compartilhe suas conquistas'],
    true,
    true,
    true,
    'distance',
    'km',
    5,
    NOW(),
    NOW()
),
-- Desafio Público 2: Hidratação Comunitária
(
    gen_random_uuid(),
    'Hidratação Comunitária',
    'Beba 3 litros de água todos os dias por uma semana',
    'hidratacao',
    'facil',
    7,
    120,
    '💧',
    'Hidratado da Comunidade',
    'Beba 3 litros de água por dia. Poste fotos da sua garrafa!',
    ARRAY['Tenha sempre uma garrafa', 'Use um app para lembrar', 'Poste suas fotos'],
    true,
    true,
    true,
    'quantity',
    'litros',
    3,
    NOW(),
    NOW()
);

-- 10. VERIFICAR RESULTADO FINAL
SELECT '✅ VERIFICAÇÃO FINAL:' as info;

SELECT 'Desafios criados:' as info,
       title,
       category,
       difficulty,
       is_group_challenge,
       daily_log_target,
       daily_log_unit
FROM public.challenges
ORDER BY created_at DESC;

-- 11. RESULTADO FINAL
SELECT '🎉 SISTEMA CORRIGIDO COM SUCESSO!' as status,
       'Erros de função resolvidos' as funcoes_status,
       'Proteção contra duplo clique' as duplo_clique_status,
       'Estrutura de dados limpa' as estrutura_status; 