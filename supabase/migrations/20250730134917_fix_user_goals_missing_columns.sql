-- Migração para corrigir colunas faltantes na tabela user_goals
-- Criada em: 2025-01-30 13:49:17

-- 1. Verificar se a tabela user_goals existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_goals' AND schemaname = 'public') THEN
    RAISE EXCEPTION 'Tabela user_goals não encontrada';
  END IF;
END $$;

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

-- 3. Adicionar colunas de timestamp se não existirem
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Garantir que a coluna user_id existe e é do tipo correto
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Garantir que a coluna id existe e é chave primária
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON public.user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_created_at ON public.user_goals(created_at);

-- 7. Habilitar RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- 8. Recriar políticas RLS para user_goals
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

-- 9. Comentário final
COMMENT ON TABLE public.user_goals IS 'Tabela de metas dos usuários - estrutura corrigida';
