-- Script para verificar tabelas de autenticação
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se as tabelas de auth existem
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'auth'
ORDER BY tablename;

-- 2. Verificar se há usuários na tabela auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
LIMIT 5;

-- 3. Verificar se a tabela profiles existe e está linkada
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar se há dados na tabela profiles
SELECT user_id, full_name, email, created_at
FROM public.profiles
LIMIT 5;

-- 6. Verificar políticas RLS da tabela profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. Verificar se há alguma função ou trigger que pode estar causando problemas
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles'
OR event_object_schema = 'auth';