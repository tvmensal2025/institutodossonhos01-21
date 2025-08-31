-- Script simples para adicionar colunas faltantes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT 'Tabela user_goals existe' as status 
WHERE EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_goals' AND schemaname = 'public'
);

-- 2. Se não existir, criar tabela básica
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Adicionar colunas uma por uma (com verificação)
DO $$
BEGIN
    -- category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'category') THEN
        ALTER TABLE public.user_goals ADD COLUMN category TEXT;
    END IF;
    
    -- challenge_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'challenge_id') THEN
        ALTER TABLE public.user_goals ADD COLUMN challenge_id UUID;
    END IF;
    
    -- target_value
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'target_value') THEN
        ALTER TABLE public.user_goals ADD COLUMN target_value NUMERIC;
    END IF;
    
    -- unit
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'unit') THEN
        ALTER TABLE public.user_goals ADD COLUMN unit TEXT;
    END IF;
    
    -- difficulty
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'difficulty') THEN
        ALTER TABLE public.user_goals ADD COLUMN difficulty TEXT DEFAULT 'medio';
    END IF;
    
    -- target_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'target_date') THEN
        ALTER TABLE public.user_goals ADD COLUMN target_date DATE;
    END IF;
    
    -- is_group_goal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'is_group_goal') THEN
        ALTER TABLE public.user_goals ADD COLUMN is_group_goal BOOLEAN DEFAULT false;
    END IF;
    
    -- evidence_required
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'evidence_required') THEN
        ALTER TABLE public.user_goals ADD COLUMN evidence_required BOOLEAN DEFAULT true;
    END IF;
    
    -- estimated_points
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'estimated_points') THEN
        ALTER TABLE public.user_goals ADD COLUMN estimated_points INTEGER DEFAULT 0;
    END IF;
    
    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'status') THEN
        ALTER TABLE public.user_goals ADD COLUMN status TEXT DEFAULT 'pendente';
    END IF;
    
    -- current_value
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'current_value') THEN
        ALTER TABLE public.user_goals ADD COLUMN current_value NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 4. Habilitar RLS se não estiver habilitado
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas básicas (remove duplicatas)
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;

CREATE POLICY "Users can view their own goals"
ON public.user_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.user_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.user_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.user_goals FOR DELETE
USING (auth.uid() = user_id);

-- 6. Forçar refresh do schema
NOTIFY pgrst, 'reload schema';

-- 7. Mostrar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_goals'
AND table_schema = 'public'
ORDER BY ordinal_position;