-- ========================================
-- APLICAR MIGRAÇÃO DA COMUNIDADE
-- Execute este script no Supabase SQL Editor
-- ========================================

-- 1. VERIFICAÇÃO INICIAL
SELECT '🔍 VERIFICANDO TABELAS EXISTENTES:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name LIKE 'health_feed_%'
ORDER BY table_name;

-- 2. CRIAR TABELA DE POSTS DA COMUNIDADE
SELECT '💬 CRIANDO TABELA HEALTH_FEED_POSTS:' as info;

CREATE TABLE IF NOT EXISTS public.health_feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'conquista' CHECK (post_type IN ('conquista', 'progresso', 'meta', 'story')),
  media_urls TEXT[] DEFAULT '{}',
  achievements_data JSONB DEFAULT '{}',
  progress_data JSONB DEFAULT '{}',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  is_story BOOLEAN DEFAULT FALSE,
  story_expires_at TIMESTAMP WITH TIME ZONE NULL,
  location TEXT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA DE REAÇÕES
SELECT '❤️ CRIANDO TABELA HEALTH_FEED_REACTIONS:' as info;

CREATE TABLE IF NOT EXISTS public.health_feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.health_feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire', 'hands', 'trophy')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- 4. CRIAR TABELA DE COMENTÁRIOS
SELECT '💭 CRIANDO TABELA HEALTH_FEED_COMMENTS:' as info;

CREATE TABLE IF NOT EXISTS public.health_feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.health_feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID NULL REFERENCES public.health_feed_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR TABELA DE FOLLOWS/SEGUIR
SELECT '👥 CRIANDO TABELA HEALTH_FEED_FOLLOWS:' as info;

CREATE TABLE IF NOT EXISTS public.health_feed_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 6. CRIAR BUCKET PARA UPLOADS
SELECT '📸 CONFIGURANDO STORAGE:' as info;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-uploads', 'community-uploads', true)
ON CONFLICT DO NOTHING;

-- 7. CONFIGURAR RLS PARA POSTS
SELECT '🔒 CONFIGURANDO SEGURANÇA DOS POSTS:' as info;

ALTER TABLE public.health_feed_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view public posts" ON public.health_feed_posts;
CREATE POLICY "Everyone can view public posts" 
ON public.health_feed_posts 
FOR SELECT 
USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own posts" ON public.health_feed_posts;
CREATE POLICY "Users can view their own posts" 
ON public.health_feed_posts 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own posts" ON public.health_feed_posts;
CREATE POLICY "Users can create their own posts" 
ON public.health_feed_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.health_feed_posts;
CREATE POLICY "Users can update their own posts" 
ON public.health_feed_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.health_feed_posts;
CREATE POLICY "Users can delete their own posts" 
ON public.health_feed_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- 8. CONFIGURAR RLS PARA REAÇÕES
SELECT '🔒 CONFIGURANDO SEGURANÇA DAS REAÇÕES:' as info;

ALTER TABLE public.health_feed_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view reactions" ON public.health_feed_reactions;
CREATE POLICY "Everyone can view reactions" 
ON public.health_feed_reactions 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can create reactions" ON public.health_feed_reactions;
CREATE POLICY "Users can create reactions" 
ON public.health_feed_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reactions" ON public.health_feed_reactions;
CREATE POLICY "Users can update their own reactions" 
ON public.health_feed_reactions 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.health_feed_reactions;
CREATE POLICY "Users can delete their own reactions" 
ON public.health_feed_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- 9. CONFIGURAR RLS PARA COMENTÁRIOS
SELECT '🔒 CONFIGURANDO SEGURANÇA DOS COMENTÁRIOS:' as info;

ALTER TABLE public.health_feed_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view comments" ON public.health_feed_comments;
CREATE POLICY "Everyone can view comments" 
ON public.health_feed_comments 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON public.health_feed_comments;
CREATE POLICY "Users can create comments" 
ON public.health_feed_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.health_feed_comments;
CREATE POLICY "Users can update their own comments" 
ON public.health_feed_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.health_feed_comments;
CREATE POLICY "Users can delete their own comments" 
ON public.health_feed_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- 10. CONFIGURAR RLS PARA FOLLOWS
SELECT '🔒 CONFIGURANDO SEGURANÇA DOS FOLLOWS:' as info;

ALTER TABLE public.health_feed_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view follows" ON public.health_feed_follows;
CREATE POLICY "Users can view follows" 
ON public.health_feed_follows 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can create follows" ON public.health_feed_follows;
CREATE POLICY "Users can create follows" 
ON public.health_feed_follows 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can delete their own follows" ON public.health_feed_follows;
CREATE POLICY "Users can delete their own follows" 
ON public.health_feed_follows 
FOR DELETE 
USING (auth.uid() = follower_id);

-- 11. CRIAR ÍNDICES PARA PERFORMANCE
SELECT '⚡ CRIANDO ÍNDICES:' as info;

CREATE INDEX IF NOT EXISTS idx_health_feed_posts_user_id ON public.health_feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_posts_created_at ON public.health_feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_feed_posts_post_type ON public.health_feed_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_health_feed_posts_is_public ON public.health_feed_posts(is_public);

CREATE INDEX IF NOT EXISTS idx_health_feed_reactions_post_id ON public.health_feed_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_reactions_user_id ON public.health_feed_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_health_feed_comments_post_id ON public.health_feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_comments_user_id ON public.health_feed_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_health_feed_follows_follower_id ON public.health_feed_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_follows_following_id ON public.health_feed_follows(following_id);

-- 12. CRIAR FUNÇÕES ÚTEIS
SELECT '🔧 CRIANDO FUNÇÕES:' as info;

-- Função para contar reações de um post
CREATE OR REPLACE FUNCTION get_post_reactions_count(post_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'like', COALESCE(COUNT(*) FILTER (WHERE reaction_type = 'like'), 0),
    'love', COALESCE(COUNT(*) FILTER (WHERE reaction_type = 'love'), 0),
    'fire', COALESCE(COUNT(*) FILTER (WHERE reaction_type = 'fire'), 0),
    'hands', COALESCE(COUNT(*) FILTER (WHERE reaction_type = 'hands'), 0),
    'trophy', COALESCE(COUNT(*) FILTER (WHERE reaction_type = 'trophy'), 0)
  ) INTO result
  FROM public.health_feed_reactions
  WHERE post_id = post_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário reagiu a um post
CREATE OR REPLACE FUNCTION has_user_reacted(post_uuid UUID, user_uuid UUID, reaction_type_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.health_feed_reactions
    WHERE post_id = post_uuid 
    AND user_id = user_uuid 
    AND reaction_type = reaction_type_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. INSERIR DADOS DE EXEMPLO (OPCIONAL)
SELECT '📝 INSERINDO DADOS DE EXEMPLO:' as info;

-- Inserir posts de exemplo se não existirem
INSERT INTO public.health_feed_posts (user_id, content, post_type, location, tags) 
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Consegui correr 5km hoje! 🏃‍♀️ Meta da semana concluída!',
  'conquista',
  'Parque da Cidade',
  ARRAY['corrida', 'meta', 'conquista']
WHERE NOT EXISTS (
  SELECT 1 FROM public.health_feed_posts 
  WHERE content LIKE '%correr 5km%'
);

INSERT INTO public.health_feed_posts (user_id, content, post_type, location, tags) 
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Atingi minha meta de beber 2L de água por dia durante toda a semana! 💧',
  'meta',
  'Casa',
  ARRAY['hidratação', 'meta', 'saúde']
WHERE NOT EXISTS (
  SELECT 1 FROM public.health_feed_posts 
  WHERE content LIKE '%2L de água%'
);

INSERT INTO public.health_feed_posts (user_id, content, post_type, location, tags) 
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Primeira semana de exercícios completa! Estou muito orgulhosa do meu progresso.',
  'progresso',
  'Academia',
  ARRAY['exercícios', 'progresso', 'consistência']
WHERE NOT EXISTS (
  SELECT 1 FROM public.health_feed_posts 
  WHERE content LIKE '%Primeira semana de exercícios%'
);

-- 14. VERIFICAÇÃO FINAL
SELECT '✅ MIGRAÇÃO COMPLETA!' as status;
SELECT 'Tabelas criadas:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'health_feed_%'
ORDER BY table_name;

SELECT 'Posts criados:' as info;
SELECT COUNT(*) as total_posts FROM public.health_feed_posts;

SELECT 'Configuração RLS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'health_feed_%'
ORDER BY tablename, policyname; 