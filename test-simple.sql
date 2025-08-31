-- Script simples para testar criação de meta
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela user_goals existe
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'user_goals';

-- 2. Verificar estrutura da tabela user_goals
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_goals'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS da tabela user_goals
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'user_goals';

-- 4. Recriar políticas RLS para user_goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;

CREATE POLICY "Users can view their own goals"
ON public.user_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.user_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.user_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.user_goals
FOR DELETE
USING (auth.uid() = user_id); 