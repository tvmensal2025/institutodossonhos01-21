-- Criar tabelas ausentes

-- Tabela weekly_chat_insights
CREATE TABLE IF NOT EXISTS public.weekly_chat_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  total_conversations INTEGER DEFAULT 0,
  average_sentiment NUMERIC(3,2) DEFAULT 0,
  dominant_emotions TEXT[] DEFAULT '{}',
  average_pain_level NUMERIC(3,2),
  average_stress_level NUMERIC(3,2),
  average_energy_level NUMERIC(3,2),
  most_discussed_topics TEXT[] DEFAULT '{}',
  main_concerns TEXT[] DEFAULT '{}',
  progress_noted TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  emotional_summary TEXT,
  ai_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para weekly_chat_insights
ALTER TABLE public.weekly_chat_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly insights" 
ON public.weekly_chat_insights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly insights" 
ON public.weekly_chat_insights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly insights" 
ON public.weekly_chat_insights 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Tabela challenge_daily_logs
CREATE TABLE IF NOT EXISTS public.challenge_daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'points',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para challenge_daily_logs
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge logs" 
ON public.challenge_daily_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenge logs" 
ON public.challenge_daily_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge logs" 
ON public.challenge_daily_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Tabela health_feed_reactions
CREATE TABLE IF NOT EXISTS public.health_feed_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para health_feed_reactions
ALTER TABLE public.health_feed_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reactions" 
ON public.health_feed_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reactions" 
ON public.health_feed_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.health_feed_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Tabela health_feed_comments
CREATE TABLE IF NOT EXISTS public.health_feed_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para health_feed_comments
ALTER TABLE public.health_feed_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments" 
ON public.health_feed_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.health_feed_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.health_feed_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Tabela chat_conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  conversation_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.chat_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Adicionar campo tools_data na tabela sessions
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS tools_data JSONB DEFAULT '{}';

-- Função has_role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário tem o role especificado
  -- Por enquanto, retorna true para admin se o usuário existe
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_uuid
  );
END;
$$;