-- Script para verificar a estrutura da tabela profiles EXISTENTE
-- Execute este script para entender o que já existe

-- 1. Verificar estrutura completa da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Verificar se tem as colunas necessárias para Google Fit
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'google_fit_enabled'
    ) THEN '✅ google_fit_enabled existe' ELSE '❌ google_fit_enabled NÃO existe' END as google_fit_status;

SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'provider'
    ) THEN '✅ provider existe' ELSE '❌ provider NÃO existe' END as provider_status;

-- 3. Verificar se tem coluna user_id ou id
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN '✅ user_id existe' ELSE '❌ user_id NÃO existe' END as user_id_status;

SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'id'
    ) THEN '✅ id existe' ELSE '❌ id NÃO existe' END as id_status;

-- 4. Contar total de colunas
SELECT 
    COUNT(*) as total_columns,
    'profiles' as table_name
FROM information_schema.columns 
WHERE table_name = 'profiles';
