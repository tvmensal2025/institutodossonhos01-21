-- Corrigir tabelas existentes e remover políticas duplicadas se necessário

-- Remover políticas duplicadas se existirem
DROP POLICY IF EXISTS "Users can view their own goal updates" ON public.goal_updates;
DROP POLICY IF EXISTS "Users can create their own goal updates" ON public.goal_updates;

-- Criar tabela goal_updates se não existir
CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;

-- Recriar políticas para goal_updates
DROP POLICY IF EXISTS "Users can view their own goal updates" ON public.goal_updates;
CREATE POLICY "Users can view their own goal updates" 
ON public.goal_updates 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own goal updates" ON public.goal_updates;
CREATE POLICY "Users can create their own goal updates" 
ON public.goal_updates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Criar tabela sofia_conversations se não existir
CREATE TABLE IF NOT EXISTS public.sofia_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  character_type TEXT NOT NULL DEFAULT 'sofia',
  conversation_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sofia_conversations ENABLE ROW LEVEL SECURITY;

-- Políticas para sofia_conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.sofia_conversations;
CREATE POLICY "Users can view their own conversations" 
ON public.sofia_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own conversations" ON public.sofia_conversations;
CREATE POLICY "Users can create their own conversations" 
ON public.sofia_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Criar tabela preventive_health_analyses se não existir
CREATE TABLE IF NOT EXISTS public.preventive_health_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL,
  risk_score INTEGER,
  risk_factors TEXT[],
  recommendations TEXT[],
  analysis_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.preventive_health_analyses ENABLE ROW LEVEL SECURITY;

-- Políticas para preventive_health_analyses
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.preventive_health_analyses;
CREATE POLICY "Users can view their own analyses" 
ON public.preventive_health_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own analyses" ON public.preventive_health_analyses;
CREATE POLICY "Users can create their own analyses" 
ON public.preventive_health_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Adicionar colunas que podem estar faltando
ALTER TABLE public.challenge_participations 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

ALTER TABLE public.challenge_participations 
ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;

ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT 100;

ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS peso_meta_kg NUMERIC;