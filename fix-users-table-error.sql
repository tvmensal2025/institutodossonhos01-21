-- Script para corrigir erro "permission denied for table users"
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se existe alguma tabela 'users' (não deveria existir)
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Verificar se há alguma função que está tentando acessar 'users'
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) LIKE '%users%'
AND n.nspname NOT IN ('information_schema', 'pg_catalog');

-- 3. Verificar se há algum trigger que está tentando acessar 'users'
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE action_statement LIKE '%users%';

-- 4. Verificar se há alguma política RLS que está tentando acessar 'users'
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE qual LIKE '%users%' OR with_check LIKE '%users%';

-- 5. Verificar se há alguma view que está tentando acessar 'users'
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE definition LIKE '%users%';

-- 6. Corrigir políticas RLS que podem estar causando o problema
-- Recriar políticas mais simples para user_goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can view all goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can update all goals" ON public.user_goals;

-- Criar políticas simplificadas
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

-- Políticas para admins
CREATE POLICY "Admins can view all goals"
ON public.user_goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can update all goals"
ON public.user_goals
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- 7. Verificar se há alguma função que está sendo chamada automaticamente
-- e que pode estar tentando acessar 'users'
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%users%'
AND routine_schema = 'public';

-- 8. Verificar se há algum trigger que está sendo executado automaticamente
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_goals';

-- 9. Testar inserção simples
-- Desabilitar RLS temporariamente para teste
ALTER TABLE public.user_goals DISABLE ROW LEVEL SECURITY;

-- Testar inserção
INSERT INTO public.user_goals (
    user_id, 
    title, 
    description, 
    target_value, 
    unit, 
    difficulty, 
    status, 
    current_value,
    evidence_required,
    is_group_goal
) VALUES (
    auth.uid(),
    'Teste de Inserção',
    'Teste para verificar se a inserção funciona',
    10,
    'test',
    'easy',
    'pendente',
    0,
    true,
    false
);

-- Reabilitar RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- 10. Verificar se a inserção funcionou
SELECT * FROM public.user_goals WHERE title = 'Teste de Inserção';

-- Limpar teste
DELETE FROM public.user_goals WHERE title = 'Teste de Inserção'; 