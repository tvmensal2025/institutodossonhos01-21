-- Script simples para verificar e corrigir problemas com a tabela profiles
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela profiles existe
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 4. Verificar políticas RLS da tabela profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Testar consulta simples na tabela profiles
SELECT user_id, full_name, email 
FROM public.profiles 
LIMIT 5;

-- 6. Recriar políticas RLS para profiles
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

-- 7. Verificar se há alguma função que está sendo chamada automaticamente
SELECT routine_name
FROM information_schema.routines
WHERE routine_definition LIKE '%profiles%'
AND routine_schema = 'public';

-- 8. Verificar se há algum trigger na tabela profiles
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- 9. Verificar se há alguma view que está tentando acessar profiles
SELECT schemaname, viewname
FROM pg_views
WHERE definition LIKE '%profiles%';

-- 10. Verificar se há alguma constraint que pode estar causando problemas
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'profiles';

-- 11. Verificar se há alguma index que pode estar causando problemas
SELECT indexname
FROM pg_indexes
WHERE tablename = 'profiles'; 