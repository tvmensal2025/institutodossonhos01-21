-- Corrigir problemas nas tabelas

-- 1. Criar tabela goal_updates que está faltando
CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Adicionar colunas faltantes na tabela user_sessions
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS tools_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS auto_save_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS cycle_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS next_available_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 3. Adicionar colunas faltantes na tabela sessions
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS tools JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tools_data JSONB DEFAULT '{}';

-- 4. Criar tabela health_feed_posts se não existir
CREATE TABLE IF NOT EXISTS public.health_feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  achievement_type TEXT,
  achievement_data JSONB,
  tags TEXT[],
  visibility TEXT DEFAULT 'public',
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Criar políticas RLS para goal_updates
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own goal updates" 
ON public.goal_updates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own goal updates" 
ON public.goal_updates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all goal updates" 
ON public.goal_updates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 6. Criar políticas RLS para health_feed_posts
ALTER TABLE public.health_feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own health feed posts" 
ON public.health_feed_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own health feed posts" 
ON public.health_feed_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public posts are viewable by everyone" 
ON public.health_feed_posts 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can update their own health feed posts" 
ON public.health_feed_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health feed posts" 
ON public.health_feed_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_health_feed_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_health_feed_posts_updated_at
  BEFORE UPDATE ON public.health_feed_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_health_feed_posts_updated_at();