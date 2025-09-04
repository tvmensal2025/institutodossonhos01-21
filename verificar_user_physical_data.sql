-- SQL para verificar a estrutura da tabela user_physical_data
-- Execute este comando no SQL Editor do Supabase

-- 1. VERIFICAR SE user_physical_data EXISTE
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_physical_data'
        ) 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as user_physical_data_status;

-- 2. VER A ESTRUTURA DA TABELA user_physical_data
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'user_physical_data'
ORDER BY ordinal_position;

-- 3. VER ALGUNS DADOS DE EXEMPLO (se existirem)
SELECT 
    id,
    user_id,
    altura_cm,
    idade,
    sexo,
    nivel_atividade,
    created_at,
    updated_at
FROM user_physical_data 
LIMIT 5;

-- 4. CONTAR QUANTOS REGISTROS EXISTEM
SELECT 
    COUNT(*) as total_registros
FROM user_physical_data;
