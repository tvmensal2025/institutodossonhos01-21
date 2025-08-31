-- ========================================
-- VERIFICAÇÃO FINAL DO SISTEMA
-- Execute este script após a correção completa
-- ========================================

-- 1. VERIFICAR TABELAS ESSENCIAIS
SELECT '🔍 VERIFICAÇÃO DAS TABELAS:' as info;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('profiles', 'weight_measurements', 'user_goals', 'daily_mission_sessions') 
        THEN '✅ ESSENCIAL'
        ELSE '📋 AUXILIAR'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'user_profiles', 'weight_measurements', 'user_goals', 'daily_mission_sessions', 'daily_responses', 'user_achievements', 'weekly_insights')
ORDER BY table_name;

-- 2. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT '🔍 ESTRUTURA DA TABELA PROFILES:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUTURA DA TABELA USER_GOALS
SELECT '🔍 ESTRUTURA DA TABELA USER_GOALS:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR DADOS NAS TABELAS
SELECT '📊 DADOS NAS TABELAS:' as info;
SELECT 
    'auth.users' as tabela,
    (SELECT COUNT(*) FROM auth.users) as total
UNION ALL
SELECT 
    'profiles' as tabela,
    (SELECT COUNT(*) FROM profiles) as total
UNION ALL
SELECT 
    'user_goals' as tabela,
    (SELECT COUNT(*) FROM user_goals) as total
UNION ALL
SELECT 
    'weight_measurements' as tabela,
    (SELECT COUNT(*) FROM weight_measurements) as total
UNION ALL
SELECT 
    'daily_mission_sessions' as tabela,
    (SELECT COUNT(*) FROM daily_mission_sessions) as total;

-- 5. VERIFICAR TRIGGERS
SELECT '🔧 VERIFICAÇÃO DOS TRIGGERS:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%auth%' OR trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- 6. VERIFICAR POLÍTICAS RLS
SELECT '🔐 VERIFICAÇÃO DAS POLÍTICAS RLS:' as info;
SELECT 
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_goals', 'weight_measurements', 'daily_mission_sessions')
ORDER BY tablename, policyname;

-- 7. VERIFICAR FUNÇÕES
SELECT '⚙️ VERIFICAÇÃO DAS FUNÇÕES:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'update_updated_at_column', 'calculate_weekly_health_score')
ORDER BY routine_name;

-- 8. VERIFICAR USUÁRIOS SEM PROFILE
SELECT '👥 USUÁRIOS SEM PROFILE:' as info;
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data ->> 'full_name' as full_name,
    p.id as profile_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 9. VERIFICAR CONFLITOS DE TABELAS
SELECT '⚠️ VERIFICAÇÃO DE CONFLITOS:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
        THEN '❌ CONFLITO: user_profiles ainda existe'
        ELSE '✅ OK: Apenas profiles existe'
    END as status_tabelas;

-- 10. VERIFICAR COLUNAS FALTANTES
SELECT '🔍 VERIFICAÇÃO DE COLUNAS:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'final_points')
        THEN '✅ final_points existe'
        ELSE '❌ final_points não existe'
    END as final_points_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'approved_by')
        THEN '✅ approved_by existe'
        ELSE '❌ approved_by não existe'
    END as approved_by_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'rejection_reason')
        THEN '✅ rejection_reason existe'
        ELSE '❌ rejection_reason não existe'
    END as rejection_reason_status;

-- 11. VERIFICAÇÃO DE PERFORMANCE
SELECT '⚡ VERIFICAÇÃO DE PERFORMANCE:' as info;
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples
FROM pg_stat_user_tables 
WHERE tablename IN ('profiles', 'user_goals', 'weight_measurements', 'daily_mission_sessions')
ORDER BY tablename;

-- 12. RESUMO FINAL
SELECT '🎯 RESUMO FINAL:' as info;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles)
        THEN '✅ TODOS os usuários têm profiles'
        ELSE '❌ Alguns usuários não têm profiles'
    END as profiles_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
        THEN '❌ CONFLITO: user_profiles ainda existe'
        ELSE '✅ OK: Apenas profiles existe'
    END as tabelas_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created')
        THEN '✅ Trigger de criação de profiles ativo'
        ELSE '❌ Trigger de criação de profiles não existe'
    END as trigger_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') >= 3
        THEN '✅ Políticas RLS configuradas'
        ELSE '❌ Políticas RLS incompletas'
    END as rls_status;

-- 13. MENSAGEM DE SUCESSO
SELECT '🎉 VERIFICAÇÃO CONCLUÍDA!' as resultado;
SELECT 
    'Se todos os itens acima estão ✅, o sistema está 100% funcional!' as mensagem; 