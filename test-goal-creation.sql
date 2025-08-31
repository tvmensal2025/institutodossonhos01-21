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

-- 5. Testar inserção de meta (comentado para segurança)
-- INSERT INTO public.user_goals (
--     user_id, 
--     title, 
--     description, 
--     target_value, 
--     unit, 
--     difficulty, 
--     status, 
--     current_value,
--     evidence_required,
--     is_group_goal
-- ) VALUES (
--     auth.uid(),
--     'Teste de Inserção',
--     'Teste para verificar se a inserção funciona',
--     10,
--     'test',
--     'easy',
--     'pendente',
--     0,
--     true,
--     false
-- );

-- 6. Verificar se há alguma função que está sendo chamada automaticamente
SELECT routine_name
FROM information_schema.routines
WHERE routine_definition LIKE '%user_goals%'
AND routine_schema = 'public';

-- 7. Verificar se há algum trigger na tabela user_goals
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'user_goals'; 