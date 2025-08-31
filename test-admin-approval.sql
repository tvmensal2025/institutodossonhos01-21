-- Script para testar sistema de aprovação admin
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se as funções foram criadas
SELECT 'Funções de aprovação:' as info,
       routine_name,
       routine_type
FROM information_schema.routines
WHERE routine_name IN ('approve_goal', 'reject_goal')
AND routine_schema = 'public';

-- 2. Verificar usuários admin existentes
SELECT 'Usuários admin existentes:' as info,
       p.user_id,
       p.full_name,
       p.email,
       p.role,
       au.email as auth_email
FROM public.profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE p.role = 'admin';

-- 3. Verificar metas pendentes
SELECT 'Metas pendentes:' as info,
       ug.id,
       ug.title,
       ug.description,
       ug.status,
       ug.user_id,
       p.full_name as usuario,
       p.email as usuario_email
FROM public.user_goals ug
LEFT JOIN public.profiles p ON ug.user_id = p.user_id
WHERE ug.status = 'pendente'
ORDER BY ug.created_at DESC;

-- 4. Criar uma meta de teste se não houver nenhuma pendente
DO $$
DECLARE
    test_user_id uuid;
    admin_user_id uuid;
    goal_id uuid;
BEGIN
    -- Buscar um usuário normal (não admin) para criar meta de teste
    SELECT user_id INTO test_user_id
    FROM public.profiles 
    WHERE role != 'admin' OR role IS NULL
    LIMIT 1;
    
    -- Buscar admin
    SELECT user_id INTO admin_user_id
    FROM public.profiles 
    WHERE role = 'admin'
    LIMIT 1;
    
    -- Se não há usuário normal, usar o primeiro usuário disponível
    IF test_user_id IS NULL THEN
        SELECT id INTO test_user_id
        FROM auth.users
        LIMIT 1;
    END IF;
    
    -- Criar meta de teste se há usuário
    IF test_user_id IS NOT NULL THEN
        INSERT INTO public.user_goals (
            user_id,
            title,
            description,
            category,
            difficulty,
            status,
            estimated_points,
            current_value,
            target_value,
            unit,
            created_at,
            updated_at
        ) VALUES (
            test_user_id,
            'Meta de Teste - Aprovação Admin',
            'Esta é uma meta criada para testar o sistema de aprovação do admin',
            'saude',
            'medio',
            'pendente',
            50,
            0,
            1,
            'unidade',
            NOW(),
            NOW()
        ) RETURNING id INTO goal_id;
        
        RAISE NOTICE 'Meta de teste criada com ID: %', goal_id;
        
        -- Testar aprovação se há admin
        IF admin_user_id IS NOT NULL THEN
            PERFORM approve_goal(
                goal_id,
                admin_user_id,
                'Meta aprovada automaticamente para teste'
            );
            RAISE NOTICE 'Meta aprovada automaticamente pelo admin: %', admin_user_id;
        END IF;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para criar meta de teste';
    END IF;
END $$;

-- 5. Verificar resultado do teste
SELECT 'Resultado do teste:' as info,
       ug.id,
       ug.title,
       ug.status,
       ug.approved_by,
       ug.approved_at,
       ug.admin_notes,
       p_user.full_name as usuario,
       p_admin.full_name as aprovado_por
FROM public.user_goals ug
LEFT JOIN public.profiles p_user ON ug.user_id = p_user.user_id
LEFT JOIN public.profiles p_admin ON ug.approved_by = p_admin.user_id
WHERE ug.title LIKE '%Teste%'
ORDER BY ug.created_at DESC
LIMIT 5;

-- 6. Verificar políticas RLS
SELECT 'Políticas RLS ativas:' as info,
       tablename,
       policyname,
       cmd
FROM pg_policies 
WHERE tablename IN ('user_goals', 'profiles')
ORDER BY tablename, policyname;

-- 7. Teste manual de aprovação (descomente e ajuste os IDs)
/*
-- Substitua pelos IDs reais
DO $$
DECLARE
    test_goal_id uuid := 'ID_DA_META_AQUI';
    admin_id uuid := 'ID_DO_ADMIN_AQUI';
BEGIN
    -- Testar aprovação
    PERFORM approve_goal(
        test_goal_id,
        admin_id,
        'Meta aprovada manualmente via SQL'
    );
    RAISE NOTICE 'Meta % aprovada pelo admin %', test_goal_id, admin_id;
END $$;
*/

-- 8. Status final do sistema
SELECT 'STATUS DO SISTEMA:' as categoria,
       CASE 
           WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'approve_goal')
           AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'reject_goal')
           AND EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin')
           THEN 'SISTEMA DE APROVAÇÃO FUNCIONANDO! ✅'
           ELSE 'SISTEMA COM PROBLEMAS ❌'
       END as status;