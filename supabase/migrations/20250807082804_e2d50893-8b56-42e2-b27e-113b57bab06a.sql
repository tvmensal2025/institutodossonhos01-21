-- Verificar se a tabela sofia_conversations existe, se não, criar
CREATE TABLE IF NOT EXISTS public.sofia_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  sofia_response TEXT NOT NULL,
  context_data JSONB,
  conversation_type TEXT DEFAULT 'chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.sofia_conversations ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes caso existam e criar novas
DROP POLICY IF EXISTS "Users can view own conversations" ON public.sofia_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.sofia_conversations;

-- Criar políticas RLS para que usuários vejam apenas suas conversas
CREATE POLICY "Users can view own conversations" 
ON public.sofia_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" 
ON public.sofia_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Verificar se existe a tabela profiles, se não, criar
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  age INTEGER,
  current_weight NUMERIC,
  target_weight NUMERIC,
  height NUMERIC,
  gender TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes caso existam e criar novas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Criar políticas RLS para profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);