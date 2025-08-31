-- =====================================================
-- CRIAR TABELA GOAL_UPDATES - EXECUTAR NO SUPABASE DASHBOARD
-- =====================================================

-- 1. Criar tabela goal_updates
CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS para permitir acesso dos usuários
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

-- =====================================================
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/editor
-- 2. Cole todo este código no SQL Editor
-- 3. Clique em "Run" para executar
-- 4. Verifique se a tabela foi criada na aba "Table Editor"
-- ===================================================== 