-- Script SIMPLES para adicionar colunas essenciais na tabela perfis
-- Execute este script primeiro no Supabase Dashboard

-- 1. Adicionar coluna google_fit_enabled
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS google_fit_enabled BOOLEAN DEFAULT false;

-- 2. Adicionar coluna provedor
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS provedor TEXT DEFAULT 'email';

-- 3. Verificar se as colunas foram criadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'perfis' 
AND column_name IN ('google_fit_enabled', 'provedor')
ORDER BY column_name;
