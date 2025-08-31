-- TESTE DE TRIGGERS DE PROFILES
-- Execute este script para verificar se os triggers estão funcionando

-- 1. Verificar triggers ativos
SELECT '🔍 VERIFICANDO TRIGGERS:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%auth%' OR trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- 2. Verificar função handle_new_user
SELECT '🔍 VERIFICANDO FUNÇÃO:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 3. Verificar estrutura da tabela profiles
SELECT '🔍 ESTRUTURA DA TABELA PROFILES:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Verificar usuários sem profile
SELECT '🔍 USUÁRIOS SEM PROFILE:' as info;
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data ->> 'full_name' as full_name,
    p.id as profile_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 5. Verificar total de usuários vs profiles
SELECT '🔍 COMPARAÇÃO USUÁRIOS VS PROFILES:' as info;
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM public.profiles) as diferenca;

-- 6. Verificar políticas RLS
SELECT '🔍 POLÍTICAS RLS:' as info;
SELECT 
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. Teste manual de inserção (opcional)
-- Descomente as linhas abaixo para testar manualmente
/*
-- Criar usuário de teste
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'teste@trigger.com',
    crypt('password', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Usuário Teste"}'
);

-- Verificar se profile foi criado automaticamente
SELECT '🔍 TESTE DE TRIGGER:' as info;
SELECT 
    au.id,
    au.email,
    p.full_name,
    p.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE au.email = 'teste@trigger.com';
*/

-- 8. Verificar logs de erro (se houver)
SELECT '🔍 VERIFICANDO LOGS:' as info;
-- Esta query pode não funcionar dependendo das permissões
-- SELECT * FROM pg_stat_activity WHERE state = 'active';

-- 9. Mensagem final
SELECT '✅ TESTE CONCLUÍDO! Verifique os resultados acima.' as resultado; 