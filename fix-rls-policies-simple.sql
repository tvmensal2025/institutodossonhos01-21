-- Script simples para corrigir políticas RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Remover TODAS as políticas RLS da tabela user_goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can view all goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can update all goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admin can manage all goals" ON public.user_goals;
DROP POLICY IF EXISTS "Public read access" ON public.user_goals;

-- 2. Desabilitar RLS temporariamente para teste
ALTER TABLE public.user_goals DISABLE ROW LEVEL SECURITY;

-- 3. Testar inserção sem RLS
INSERT INTO public.user_goals (
    user_id, 
    title, 
    description,
    category,
    difficulty,
    status,
    evidence_required,
    is_group_goal,
    estimated_points,
    current_value
) VALUES (
    auth.uid(),
    'Teste sem RLS',
    'Teste para verificar se inserção funciona sem RLS',
    'saude',
    'medio',
    'pendente',
    true,
    false,
    10,
    0
);

-- 4. Verificar se inserção funcionou
SELECT 'Inserção sem RLS:' as status, id, title, user_id 
FROM public.user_goals 
WHERE title = 'Teste sem RLS';

-- 5. Limpar teste
DELETE FROM public.user_goals WHERE title = 'Teste sem RLS';

-- 6. Reabilitar RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS SIMPLES (sem referência a auth.users)
CREATE POLICY "Allow all for authenticated users"
ON public.user_goals
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 8. Forçar refresh do schema
NOTIFY pgrst, 'reload schema';

-- 9. Verificar políticas criadas
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_goals';