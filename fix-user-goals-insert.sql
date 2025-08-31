-- Script para verificar e corrigir problemas de inserção na tabela user_goals
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela user_goals existe e sua estrutura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_goals';

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_goals FROM user_goals;

-- 4. Verificar metas pendentes
SELECT COUNT(*) as pendentes FROM user_goals WHERE status = 'pendente';

-- 5. Testar inserção manual (substitua o user_id por um ID válido)
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

-- 6. Recriar políticas RLS se necessário
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can view all goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can update goal status" ON public.user_goals;

-- Recriar políticas
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

-- Políticas para admin
CREATE POLICY "Admins can view all goals" 
ON public.user_goals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can update goal status" 
ON public.user_goals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- 7. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_goals'; 