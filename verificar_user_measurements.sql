-- SQL SIMPLES para verificar se user_measurements existe
-- Execute este comando no SQL Editor do Supabase

-- 1. VERIFICAR SE A TABELA user_measurements EXISTE
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_measurements'
        ) 
        THEN '✅ EXISTE' 
        ELSE '❌ NÃO EXISTE' 
    END as status_user_measurements;

-- 2. LISTAR TODAS AS TABELAS COM "measurement" NO NOME
SELECT 
    table_name,
    'TABELA' as tipo
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name ILIKE '%measurement%'
ORDER BY table_name;

-- 3. LISTAR TODAS AS TABELAS COM "user" NO NOME
SELECT 
    table_name,
    'TABELA' as tipo
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name ILIKE '%user%'
ORDER BY table_name;

-- 4. VERIFICAR SE EXISTE ALGUMA TABELA SIMILAR
SELECT 
    table_name,
    'TABELA' as tipo
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (table_name ILIKE '%measurement%' 
         OR table_name ILIKE '%weight%'
         OR table_name ILIKE '%user%')
ORDER BY table_name;
