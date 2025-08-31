-- Criar tabelas necessárias para o sistema da Sofia

-- Tabela para conversas da Sofia
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

-- Políticas RLS para sofia_conversations
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

-- Tabela para análises preventivas
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

-- Políticas RLS para preventive_health_analyses
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

-- Tabela para atualizações de metas
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

-- Políticas RLS para goal_updates
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

-- Adicionar colunas que estão faltando em tabelas existentes
ALTER TABLE public.challenge_participations 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

ALTER TABLE public.challenge_participations 
ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;

ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT 100;

ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS peso_meta_kg NUMERIC;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_sofia_conversations_user_id ON public.sofia_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_sofia_conversations_created_at ON public.sofia_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_preventive_analyses_user_id ON public.preventive_health_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_updates_user_id ON public.goal_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_updates_goal_id ON public.goal_updates(goal_id);