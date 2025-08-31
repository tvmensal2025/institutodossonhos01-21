-- Script para adicionar apenas a coluna provider faltante
-- Execute este script para completar a tabela profiles

-- 1. Adicionar coluna provider
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN profiles.provider IS 'Provedor de autenticação (email, google, etc.)';

-- 3. Verificar se foi criada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'provider';

-- 4. Resumo final
SELECT 
    '✅ Coluna provider adicionada com sucesso!' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'profiles';
