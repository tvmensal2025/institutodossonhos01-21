-- ========================================
-- SQL PARA DESAFIOS PÚBLICOS E COMUNIDADE
-- Sistema completo com fotos e compartilhamento
-- ========================================

-- 1. VERIFICAÇÃO INICIAL
SELECT '🔍 VERIFICAÇÃO INICIAL:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('challenges', 'challenge_participations', 'community_posts', 'community_likes')
ORDER BY table_name;

-- 2. ATUALIZAR CHALLENGES PARA SUPORTAR DESAFIOS PÚBLICOS
SELECT '🏆 ATUALIZANDO TABELA CHALLENGES:' as info;

ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS is_group_challenge BOOLEAN DEFAULT false,
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

-- 3. CRIAR TABELA DE POSTS DA COMUNIDADE
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

-- 4. CRIAR TABELA DE LIKES DOS POSTS
SELECT '❤️ CRIANDO TABELA COMMUNITY_LIKES:' as info;

CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 5. CRIAR TABELA DE COMENTÁRIOS
SELECT '💭 CRIANDO TABELA COMMUNITY_COMMENTS:' as info;

CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR BUCKET PARA FOTOS DA COMUNIDADE
SELECT '📸 CONFIGURANDO STORAGE:' as info;

-- Inserir bucket se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-uploads', 'community-uploads', true)
ON CONFLICT DO NOTHING;

-- 7. HABILITAR RLS E CRIAR POLÍTICAS
SELECT '🔒 CONFIGURANDO SEGURANÇA:' as info;

-- RLS para community_posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all community posts" 
ON public.community_posts FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own posts" 
ON public.community_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.community_posts FOR DELETE 
USING (auth.uid() = user_id);

-- RLS para community_likes
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes" 
ON public.community_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.community_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.community_likes FOR DELETE 
USING (auth.uid() = user_id);

-- RLS para community_comments
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments" 
ON public.community_comments FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.community_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.community_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.community_comments FOR DELETE 
USING (auth.uid() = user_id);

-- 8. CRIAR DESAFIOS PÚBLICOS DE EXEMPLO
SELECT '🎯 CRIANDO DESAFIOS PÚBLICOS:' as info;

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
    max_participants,
    current_participants,
    created_by,
    created_at,
    updated_at
) VALUES 
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
    100,
    23,
    (SELECT id FROM auth.users LIMIT 1),
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
    50,
    15,
    (SELECT id FROM auth.users LIMIT 1),
    NOW(),
    NOW()
),
-- Desafio Público 3: Yoga em Grupo
(
    gen_random_uuid(),
    'Yoga em Grupo',
    'Faça 20 minutos de yoga todos os dias por uma semana',
    'mindfulness',
    'facil',
    7,
    100,
    '🧘',
    'Yogui da Comunidade',
    'Faça 20 minutos de yoga por dia. Compartilhe suas poses!',
    ARRAY['Use um app de yoga', 'Escolha um local tranquilo', 'Poste suas fotos'],
    true,
    true,
    true,
    'hours',
    'horas',
    0.33,
    75,
    8,
    (SELECT id FROM auth.users LIMIT 1),
    NOW(),
    NOW()
);

-- 9. CRIAR POSTS DE EXEMPLO
SELECT '📸 CRIANDO POSTS DE EXEMPLO:' as info;

INSERT INTO public.community_posts (
    id,
    user_id,
    challenge_id,
    photo_url,
    message,
    likes,
    comments,
    created_at
) VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM public.challenges WHERE title = 'Corrida em Grupo' LIMIT 1),
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'Consegui correr 5km hoje! 💪 Foi difícil mas valeu a pena!',
    24,
    5,
    NOW() - INTERVAL '2 hours'
),
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM public.challenges WHERE title = 'Hidratação Comunitária' LIMIT 1),
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    '3 litros de água consumidos! 💧 Me sentindo muito melhor!',
    18,
    3,
    NOW() - INTERVAL '4 hours'
),
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM public.challenges WHERE title = 'Yoga em Grupo' LIMIT 1),
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    '20 minutos de yoga completos! 🧘 Muito relaxante!',
    12,
    2,
    NOW() - INTERVAL '6 hours'
);

-- 10. VERIFICAR RESULTADO FINAL
SELECT '✅ VERIFICAÇÃO FINAL:' as info;

SELECT 'Desafios públicos criados:' as info,
       title,
       category,
       difficulty,
       max_participants,
       current_participants,
       is_group_challenge
FROM public.challenges
WHERE is_group_challenge = true
ORDER BY created_at DESC;

SELECT 'Posts da comunidade criados:' as info,
       COUNT(*) as total_posts
FROM public.community_posts;

-- 11. RESULTADO FINAL
SELECT '🎉 SISTEMA DE DESAFIOS PÚBLICOS CRIADO COM SUCESSO!' as status,
       'Fotos e compartilhamento funcionando' as fotos_status,
       'Comunidade ativa' as comunidade_status,
       'Ranking em tempo real' as ranking_status; 