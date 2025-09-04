-- SQL para verificar weight_measurements
-- Execute este comando no SQL Editor do Supabase

-- 1. VERIFICAR SE weight_measurements EXISTE
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'weight_measurements'
        ) 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as weight_measurements_status;

-- 2. LISTAR TABELAS COM "weight" NO NOME
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name ILIKE '%weight%'
ORDER BY table_name;

-- 3. LISTAR TABELAS COM "measurement" NO NOME
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name ILIKE '%measurement%'
ORDER BY table_name;

-- 4. VERIFICAR SE user_measurements EXISTE
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_measurements'
        ) 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as user_measurements_status;
