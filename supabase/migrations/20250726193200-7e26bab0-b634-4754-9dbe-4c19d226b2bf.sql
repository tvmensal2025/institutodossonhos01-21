-- Criar tabelas para o sistema HealthFeed

-- Tabela de posts do feed
CREATE TABLE IF NOT EXISTS public.health_feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('conquista', 'progresso', 'rotina', 'meta', 'story')),
  media_urls TEXT[] DEFAULT '{}',
  achievements_data JSONB DEFAULT '{}',
  progress_data JSONB DEFAULT '{}',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  is_story BOOLEAN DEFAULT FALSE,
  story_expires_at TIMESTAMP WITH TIME ZONE NULL,
  location TEXT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de reações aos posts
CREATE TABLE IF NOT EXISTS public.health_feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.health_feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire', 'hands', 'trophy')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS public.health_feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.health_feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID NULL REFERENCES public.health_feed_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de follows/seguir usuários
CREATE TABLE IF NOT EXISTS public.health_feed_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Tabela de grupos/comunidades
CREATE TABLE IF NOT EXISTS public.health_feed_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NULL,
  image_url TEXT NULL,
  group_type TEXT NOT NULL CHECK (group_type IN ('objetivo', 'localizacao', 'idade', 'experiencia')),
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de membros dos grupos
CREATE TABLE IF NOT EXISTS public.health_feed_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.health_feed_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Tabela de rankings
CREATE TABLE IF NOT EXISTS public.health_feed_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ranking_type TEXT NOT NULL CHECK (ranking_type IN ('geral', 'peso', 'exercicio', 'hidratacao', 'metas', 'social')),
  points INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  level_name TEXT DEFAULT 'Iniciante',
  badges TEXT[] DEFAULT '{}',
  week_points INTEGER DEFAULT 0,
  month_points INTEGER DEFAULT 0,
  year_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, ranking_type)
);

-- Tabela de badges/conquistas especiais
CREATE TABLE IF NOT EXISTS public.health_feed_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  post_id UUID NULL REFERENCES public.health_feed_posts(id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.health_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_badges ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para posts
CREATE POLICY "Users can view public posts and own posts"
  ON public.health_feed_posts
  FOR SELECT
  USING (
    visibility = 'public' OR 
    user_id = auth.uid() OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.health_feed_follows 
      WHERE following_id = health_feed_posts.user_id AND follower_id = auth.uid()
    ))
  );

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

-- Políticas RLS para reações
CREATE POLICY "Users can view all reactions"
  ON public.health_feed_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reactions"
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

-- Políticas RLS para comentários
CREATE POLICY "Users can view comments on visible posts"
  ON public.health_feed_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.health_feed_posts 
      WHERE id = health_feed_comments.post_id AND (
        visibility = 'public' OR 
        user_id = auth.uid() OR
        (visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.health_feed_follows 
          WHERE following_id = health_feed_posts.user_id AND follower_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can create comments on visible posts"
  ON public.health_feed_comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.health_feed_posts 
      WHERE id = health_feed_comments.post_id AND (
        visibility = 'public' OR 
        user_id = auth.uid() OR
        (visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.health_feed_follows 
          WHERE following_id = health_feed_posts.user_id AND follower_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.health_feed_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.health_feed_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para follows
CREATE POLICY "Users can view all follows"
  ON public.health_feed_follows
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own follows"
  ON public.health_feed_follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON public.health_feed_follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- Políticas RLS para rankings
CREATE POLICY "Users can view all rankings"
  ON public.health_feed_rankings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own ranking"
  ON public.health_feed_rankings
  FOR ALL
  USING (auth.uid() = user_id);

-- Políticas RLS para badges
CREATE POLICY "Users can view all badges"
  ON public.health_feed_badges
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own badges"
  ON public.health_feed_badges
  FOR ALL
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_health_feed_posts_user_created 
  ON public.health_feed_posts(user_id, created_at DESC);

CREATE INDEX idx_health_feed_posts_type_created 
  ON public.health_feed_posts(post_type, created_at DESC);

CREATE INDEX idx_health_feed_posts_visibility_created 
  ON public.health_feed_posts(visibility, created_at DESC);

CREATE INDEX idx_health_feed_reactions_post_id 
  ON public.health_feed_reactions(post_id);

CREATE INDEX idx_health_feed_comments_post_id 
  ON public.health_feed_comments(post_id, created_at);

CREATE INDEX idx_health_feed_follows_follower 
  ON public.health_feed_follows(follower_id);

CREATE INDEX idx_health_feed_follows_following 
  ON public.health_feed_follows(following_id);

CREATE INDEX idx_health_feed_rankings_type_points 
  ON public.health_feed_rankings(ranking_type, points DESC);

-- Triggers para updated_at
CREATE TRIGGER update_health_feed_posts_updated_at
  BEFORE UPDATE ON public.health_feed_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_feed_comments_updated_at
  BEFORE UPDATE ON public.health_feed_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_feed_rankings_updated_at
  BEFORE UPDATE ON public.health_feed_rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();