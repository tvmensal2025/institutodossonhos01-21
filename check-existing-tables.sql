-- Script para verificar tabelas existentes relacionadas a perfis
-- Execute este script primeiro para entender a estrutura atual

-- 1. Verificar todas as tabelas que podem conter perfis
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
    table_name LIKE '%perfil%' OR 
    table_name LIKE '%profile%' OR 
    table_name LIKE '%user%' OR
    table_name LIKE '%auth%'
)
ORDER BY table_name;

-- 2. Verificar se existe tabela auth.users
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN '✅ Tabela auth.users existe' ELSE '❌ Tabela auth.users NÃO existe' END as auth_users_status;

-- 3. Verificar estrutura da tabela auth.users (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Verificar se existe alguma tabela de perfis com nome diferente
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as total_columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name NOT LIKE 'pg_%'
AND table_name NOT LIKE 'sql_%'
ORDER BY table_name;
