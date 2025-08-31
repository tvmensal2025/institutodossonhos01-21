-- Adicionar coluna course_id na tabela lessons (estava faltando)
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS course_id uuid;

-- Criar tabela health_feed_posts para o HealthFeed
CREATE TABLE IF NOT EXISTS public.health_feed_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content text NOT NULL,
  post_type text DEFAULT 'conquista',
  media_urls text[] DEFAULT '{}',
  achievements_data jsonb DEFAULT '{}'::jsonb,
  progress_data jsonb DEFAULT '{}'::jsonb,
  visibility text DEFAULT 'public',
  location text,
  tags text[] DEFAULT '{}',
  is_story boolean DEFAULT false,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para health_feed_posts
ALTER TABLE public.health_feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view public posts" 
ON public.health_feed_posts 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create their own posts" 
ON public.health_feed_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.health_feed_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar tabela health_feed_reactions
CREATE TABLE IF NOT EXISTS public.health_feed_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

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

-- Criar tabela health_feed_comments
CREATE TABLE IF NOT EXISTS public.health_feed_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

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

-- Corrigir a coluna admin_status na tabela user_goals (deve ser text, não enum)
ALTER TABLE public.user_goals ALTER COLUMN admin_status TYPE text;

-- Criar função para auto-criar perfil quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    full_name,
    email,
    phone,
    birth_date,
    city,
    state,
    avatar_url,
    gender,
    bio
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    (NEW.raw_user_meta_data ->> 'birth_date')::date,
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'gender',
    'Transformando minha vida através da saúde e bem-estar.'
  );
  RETURN NEW;
END;
$$;

-- Criar trigger para auto-criar perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar perfil para usuário existente se não existir
INSERT INTO public.profiles (
  user_id,
  full_name,
  email,
  phone,
  birth_date,
  city,
  state,
  gender,
  bio
)
SELECT 
  u.id,
  u.raw_user_meta_data ->> 'full_name',
  u.email,
  u.raw_user_meta_data ->> 'phone',
  (u.raw_user_meta_data ->> 'birth_date')::date,
  u.raw_user_meta_data ->> 'city',
  u.raw_user_meta_data ->> 'state',
  u.raw_user_meta_data ->> 'gender',
  'Transformando minha vida através da saúde e bem-estar.'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_health_feed_posts_user_public ON health_feed_posts(user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_health_feed_reactions_post ON health_feed_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_comments_post ON health_feed_comments(post_id);