-- Script para recriar tabela user_goals do zero
-- Execute este script no SQL Editor do Supabase

-- 1. Remover tabela existente se houver (cuidado - isso apaga dados!)
DROP TABLE IF EXISTS public.user_goals CASCADE;

-- 2. Criar tabela user_goals com estrutura completa
CREATE TABLE public.user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    challenge_id UUID,
    target_value NUMERIC,
    unit TEXT,
    difficulty TEXT DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
    target_date DATE,
    is_group_goal BOOLEAN DEFAULT false,
    evidence_required BOOLEAN DEFAULT true,
    estimated_points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada', 'em_progresso', 'concluida', 'cancelada')),
    current_value NUMERIC DEFAULT 0,
    final_points INTEGER,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_user_goals_status ON public.user_goals(status);
CREATE INDEX idx_user_goals_category ON public.user_goals(category);
CREATE INDEX idx_user_goals_created_at ON public.user_goals(created_at);

-- 4. Habilitar RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS
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

-- Políticas para admins
CREATE POLICY "Admins can view all goals"
ON public.user_goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can update all goals"
ON public.user_goals
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_goals_updated_at 
    BEFORE UPDATE ON public.user_goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Comentário na tabela
COMMENT ON TABLE public.user_goals IS 'Tabela de metas dos usuários - recriada com estrutura completa';

-- 8. Verificar estrutura criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_goals'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Forçar refresh do schema cache
NOTIFY pgrst, 'reload schema';

-- 10. Testar inserção básica (opcional - descomente para testar)
-- INSERT INTO public.user_goals (
--     user_id, 
--     title, 
--     description, 
--     category,
--     difficulty,
--     status
-- ) VALUES (
--     auth.uid(),
--     'Meta de Teste',
--     'Teste da nova estrutura da tabela',
--     'saude',
--     'medio',
--     'pendente'
-- );