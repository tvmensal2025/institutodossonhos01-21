-- ========================================
-- MIGRAÇÃO COMPLETA DO SISTEMA DE COMUNIDADE
-- HealthFeed - Sistema de Posts e Interações
-- ========================================

-- 1. CRIAR TABELA DE POSTS DA COMUNIDADE
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

-- 2. CRIAR TABELA DE REAÇÕES
CREATE TABLE IF NOT EXISTS public.health_feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.health_feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire', 'hands', 'trophy')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- 3. CRIAR TABELA DE COMENTÁRIOS
CREATE TABLE IF NOT EXISTS public.health_feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.health_feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID NULL REFERENCES public.health_feed_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA DE FOLLOWS/SEGUIR
CREATE TABLE IF NOT EXISTS public.health_feed_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 5. CRIAR TABELA DE GRUPOS/COMUNIDADES
CREATE TABLE IF NOT EXISTS public.health_feed_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT TRUE,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR TABELA DE MEMBROS DOS GRUPOS
CREATE TABLE IF NOT EXISTS public.health_feed_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.health_feed_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 7. CRIAR BUCKET PARA UPLOADS DA COMUNIDADE
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-uploads', 'community-uploads', true)
ON CONFLICT DO NOTHING;

-- 8. CONFIGURAR RLS (ROW LEVEL SECURITY)

-- RLS para health_feed_posts
ALTER TABLE public.health_feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view public posts" 
ON public.health_feed_posts 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their own posts" 
ON public.health_feed_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" 
ON public.health_feed_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.health_feed_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.health_feed_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS para health_feed_reactions
ALTER TABLE public.health_feed_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view reactions" 
ON public.health_feed_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reactions" 
ON public.health_feed_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" 
ON public.health_feed_reactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.health_feed_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS para health_feed_comments
ALTER TABLE public.health_feed_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view comments" 
ON public.health_feed_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.health_feed_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.health_feed_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.health_feed_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS para health_feed_follows
ALTER TABLE public.health_feed_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follows" 
ON public.health_feed_follows 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create follows" 
ON public.health_feed_follows 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" 
ON public.health_feed_follows 
FOR DELETE 
USING (auth.uid() = follower_id);

-- RLS para health_feed_groups
ALTER TABLE public.health_feed_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view public groups" 
ON public.health_feed_groups 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create groups" 
ON public.health_feed_groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" 
ON public.health_feed_groups 
FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS para health_feed_group_members
ALTER TABLE public.health_feed_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view group members" 
ON public.health_feed_group_members 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join groups" 
ON public.health_feed_group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" 
ON public.health_feed_group_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- 9. CRIAR ÍNDICES PARA PERFORMANCE
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

-- 10. CRIAR FUNÇÕES ÚTEIS

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

-- 11. INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- Descomente as linhas abaixo se quiser dados de exemplo

/*
INSERT INTO public.health_feed_posts (user_id, content, post_type, location, tags) VALUES
(
  (SELECT id FROM auth.users LIMIT 1),
  'Consegui correr 5km hoje! 🏃‍♀️ Meta da semana concluída!',
  'conquista',
  'Parque da Cidade',
  ARRAY['corrida', 'meta', 'conquista']
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Atingi minha meta de beber 2L de água por dia durante toda a semana! 💧',
  'meta',
  'Casa',
  ARRAY['hidratação', 'meta', 'saúde']
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Primeira semana de exercícios completa! Estou muito orgulhosa do meu progresso.',
  'progresso',
  'Academia',
  ARRAY['exercícios', 'progresso', 'consistência']
);
*/

-- 12. VERIFICAÇÃO FINAL
SELECT '✅ MIGRAÇÃO HEALTH_FEED COMPLETA' as status;
SELECT 'Tabelas criadas:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'health_feed_%'
ORDER BY table_name; 