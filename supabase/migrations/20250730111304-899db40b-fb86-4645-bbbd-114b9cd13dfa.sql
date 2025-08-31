-- Adicionar coluna gender na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goals jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]'::jsonb;

-- Criar tabela weekly_chat_insights
CREATE TABLE IF NOT EXISTS public.weekly_chat_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_start_date date NOT NULL,
  total_conversations integer NOT NULL DEFAULT 0,
  average_sentiment numeric NOT NULL DEFAULT 0,
  dominant_emotions text[] DEFAULT '{}',
  average_pain_level numeric,
  average_stress_level numeric,
  average_energy_level numeric,
  most_discussed_topics text[] DEFAULT '{}',
  main_concerns text[] DEFAULT '{}',
  progress_noted text[] DEFAULT '{}',
  recommendations text[] DEFAULT '{}',
  emotional_summary text,
  ai_analysis jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
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

-- Criar tabela chat_conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  message text NOT NULL,
  response text,
  sentiment_score numeric,
  emotion_tags text[] DEFAULT '{}',
  topic_tags text[] DEFAULT '{}',
  pain_level integer,
  stress_level integer,
  energy_level integer,
  session_id text,
  conversation_type text DEFAULT 'general',
  ai_analysis jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
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

-- Criar tabela google_fit_data
CREATE TABLE IF NOT EXISTS public.google_fit_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  data_type text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  source_app text,
  device_type text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  synced_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para google_fit_data
ALTER TABLE public.google_fit_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own google fit data" 
ON public.google_fit_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own google fit data" 
ON public.google_fit_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Criar função has_role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Por enquanto, verificar se o usuário é admin baseado no email
  -- Você pode personalizar esta lógica conforme necessário
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_uuid 
    AND (
      email LIKE '%admin%' 
      OR email = 'admin@institutodossonhos.com.br'
      OR raw_user_meta_data->>'role' = 'admin'
      OR email = 'contato@rafael-dias.com'
    )
  );
END;
$$;

-- Criar tabela water_intake (para tracking de água)
CREATE TABLE IF NOT EXISTS public.water_intake (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount_ml integer NOT NULL DEFAULT 250,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para water_intake
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own water intake" 
ON public.water_intake 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own water intake" 
ON public.water_intake 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water intake" 
ON public.water_intake 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_weekly_chat_insights_user_week ON weekly_chat_insights(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_date ON chat_conversations(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_type ON google_fit_data(user_id, data_type);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, recorded_at);