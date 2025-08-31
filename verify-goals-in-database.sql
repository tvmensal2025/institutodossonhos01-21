-- Script para verificar se as metas foram salvas no banco
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há metas na tabela
SELECT 'Total de metas na tabela:' as info, COUNT(*) as total
FROM public.user_goals;

-- 2. Mostrar todas as metas (últimas 10)
SELECT 'Últimas metas criadas:' as info, 
       id, 
       user_id, 
       title, 
       description,
       category,
       status,
       created_at
FROM public.user_goals
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar metas do usuário específico (do log)
SELECT 'Metas do usuário 7b6db6a7-1514-4593-98fb-f6f8f5c58f84:' as info,
       id, 
       title, 
       description,
       category,
       status,
       created_at
FROM public.user_goals
WHERE user_id = '7b6db6a7-1514-4593-98fb-f6f8f5c58f84'
ORDER BY created_at DESC;

-- 4. Verificar se há metas com títulos específicos dos logs
SELECT 'Metas com títulos dos logs:' as info,
       id, 
       user_id,
       title, 
       description,
       created_at
FROM public.user_goals
WHERE title IN ('Beber mais água', 'Ganhar massa muscular')
ORDER BY created_at DESC;

-- 5. Verificar estrutura da tabela
SELECT 'Estrutura da tabela:' as info,
       column_name, 
       data_type, 
       is_nullable
FROM information_schema.columns
WHERE table_name = 'user_goals'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar se RLS está realmente desabilitado
SELECT 'Status RLS:' as info,
       relname as table_name,
       relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'user_goals';

-- 7. Verificar políticas RLS ativas
SELECT 'Políticas RLS ativas:' as info,
       policyname,
       cmd,
       qual
FROM pg_policies 
WHERE tablename = 'user_goals';