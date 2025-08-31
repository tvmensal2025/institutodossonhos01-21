-- Script para verificar e corrigir problemas com a tabela profiles
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela profiles existe
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 4. Verificar políticas RLS da tabela profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Verificar se há alguma função que está tentando acessar profiles incorretamente
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) LIKE '%profiles%'
AND n.nspname NOT IN ('information_schema', 'pg_catalog');

-- 6. Verificar se há algum trigger na tabela profiles
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- 7. Testar consulta simples na tabela profiles
SELECT user_id, full_name, email 
FROM public.profiles 
LIMIT 5;

-- 8. Verificar se há alguma política RLS que pode estar causando problemas
-- Recriar políticas RLS para profiles se necessário
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 9. Verificar se há alguma função que está sendo chamada automaticamente
-- e que pode estar tentando acessar profiles
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%profiles%'
AND routine_schema = 'public';

-- 10. Testar inserção de perfil se necessário
-- INSERT INTO public.profiles (user_id, full_name, email)
-- VALUES (auth.uid(), 'Teste', 'teste@teste.com')
-- ON CONFLICT (user_id) DO UPDATE SET
--   full_name = EXCLUDED.full_name,
--   email = EXCLUDED.email;

-- 11. Verificar se há alguma view que está tentando acessar profiles
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE definition LIKE '%profiles%';

-- 12. Verificar se há alguma constraint que pode estar causando problemas
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_name = 'profiles';

-- 13. Verificar se há alguma index que pode estar causando problemas
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'profiles'; 