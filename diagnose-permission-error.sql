-- Script para diagnosticar erro "permission denied for table users"
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se existe tabela 'users' (NÃO deveria existir)
SELECT 'PROBLEMA: Tabela users existe!' as alerta, schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'users'
UNION ALL
SELECT 'OK: Tabela users não existe' as alerta, 'N/A', 'N/A'
WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users');

-- 2. Verificar tabela auth.users (deveria existir)
SELECT 'OK: Tabela auth.users existe' as status, schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'auth'
UNION ALL
SELECT 'PROBLEMA: Tabela auth.users não existe!' as status, 'N/A', 'N/A'
WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'auth');

-- 3. Verificar estrutura da tabela user_goals
SELECT 'Estrutura user_goals:' as info, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_goals'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar políticas RLS que podem estar causando problema
SELECT 'Políticas RLS user_goals:' as info, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_goals';

-- 5. Verificar se há funções que acessam 'users' incorretamente
SELECT 'Funções problemáticas:' as info, routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%users%'
AND routine_definition NOT LIKE '%auth.users%'
AND routine_schema = 'public'
LIMIT 5;

-- 6. CORREÇÃO: Remover políticas problemáticas e recriar
DROP POLICY IF EXISTS "Admins can view all goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can update all goals" ON public.user_goals;

-- 7. Recriar apenas políticas básicas (sem referência a users)
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

-- 8. Verificar políticas após correção
SELECT 'Políticas após correção:' as info, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_goals';

-- 9. Testar se consegue inserir (remova comentários para testar)
-- INSERT INTO public.user_goals (
--     user_id, 
--     title, 
--     description,
--     category,
--     difficulty,
--     status
-- ) VALUES (
--     auth.uid(),
--     'Teste após correção',
--     'Teste para verificar se inserção funciona',
--     'saude',
--     'medio',
--     'pendente'
-- );

-- 10. Forçar refresh do schema
NOTIFY pgrst, 'reload schema';