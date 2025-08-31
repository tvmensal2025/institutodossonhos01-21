-- Script para corrigir estrutura da tabela user_goals
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura atual da tabela user_goals
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_goals'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar colunas que podem estar faltando
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS challenge_id UUID;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS target_value NUMERIC;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medio';
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS target_date DATE;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT false;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN DEFAULT true;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS estimated_points INTEGER DEFAULT 0;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Verificar estrutura após adicionar colunas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_goals'
AND table_schema = 'public'
ORDER BY ordinal_position;

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

-- 5. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'user_goals';

-- 6. Limpar cache do schema (forçar refresh)
NOTIFY pgrst, 'reload schema';