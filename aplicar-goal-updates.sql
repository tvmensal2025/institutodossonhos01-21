-- Aplicar tabela goal_updates que está faltando
-- Este script deve ser executado no Supabase Dashboard

-- 1. Criar tabela goal_updates se não existir
CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS
CREATE POLICY "Users can create their own goal updates" 
ON public.goal_updates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own goal updates" 
ON public.goal_updates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal updates" 
ON public.goal_updates 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Verificar se a tabela foi criada
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'goal_updates' 
AND table_schema = 'public'
ORDER BY ordinal_position; 