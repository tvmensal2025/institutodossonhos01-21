-- Script para verificar a estrutura atual da tabela perfis
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'perfis' 
ORDER BY ordinal_position;

-- Verificar se a tabela tem as colunas necessárias
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'google_fit_enabled'
    ) THEN '✅ google_fit_enabled existe' ELSE '❌ google_fit_enabled NÃO existe' END as google_fit_status;

SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'provedor'
    ) THEN '✅ provedor existe' ELSE '❌ provedor NÃO existe' END as provider_status;
