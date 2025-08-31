-- Script para corrigir erro "permission denied for table users"
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há alguma política RLS que está causando problema
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_goals';

-- 2. Verificar se a tabela user_goals existe e está acessível
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_goals'
) as user_goals_exists;

-- 3. Verificar se há alguma política que está tentando acessar tabela users
SELECT * FROM pg_policies 
WHERE qual LIKE '%users%' OR with_check LIKE '%users%';

-- 4. Recriar políticas RLS para user_goals (mais permissivas para teste)
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;

-- Políticas mais simples para teste
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

-- 5. Verificar se há alguma função que está tentando acessar users
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_definition LIKE '%users%' 
AND routine_schema = 'public';

-- 6. Testar inserção manual (substitua o user_id por um ID válido)
-- INSERT INTO user_goals (user_id, title, description, target_value, unit, difficulty, status)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000', -- Substitua por um user_id válido
--   'Teste de Meta',
--   'Meta de teste para verificar inserção',
--   5.0,
--   'kg',
--   'medio',
--   'pendente'
-- );

-- 7. Verificar se há triggers que podem estar causando problema
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_goals'; 