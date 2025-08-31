-- SCRIPT DE EMERGÊNCIA - Desabilitar RLS completamente
-- Execute este script no SQL Editor do Supabase
-- ATENÇÃO: Isso remove toda a segurança RLS temporariamente

-- 1. Verificar tabela user_goals
SELECT 'Tabela user_goals:' as info, schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'user_goals';

-- 2. Remover TODAS as políticas RLS
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_goals'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.user_goals';
    END LOOP;
END $$;

-- 3. Desabilitar RLS completamente
ALTER TABLE public.user_goals DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se RLS foi desabilitado
SELECT 'RLS Status:' as info, 
       relname as table_name,
       relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'user_goals';

-- 5. Verificar estrutura da tabela
SELECT 'Colunas:' as info, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_goals'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Testar inserção direta
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
    '7b6db6a7-1514-4593-98fb-f6f8f5c58f84', -- ID do usuário dos logs
    'Teste Emergência',
    'Teste com RLS desabilitado',
    'saude',
    'medio',
    'pendente',
    true,
    false,
    10,
    0
);

-- 7. Verificar se inserção funcionou
SELECT 'Teste inserção:' as status, id, title, user_id, created_at
FROM public.user_goals 
WHERE title = 'Teste Emergência';

-- 8. Forçar refresh do schema
NOTIFY pgrst, 'reload schema';

-- 9. Mostrar resultado final
SELECT 'RESULTADO:' as info, 
       'RLS DESABILITADO - Meta pode ser criada agora' as message;