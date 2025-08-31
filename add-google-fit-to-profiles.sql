-- Script para adicionar colunas Google Fit na tabela profiles EXISTENTE
-- Execute este script para habilitar a integração com Google Fit

-- 1. Adicionar coluna google_fit_enabled se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS google_fit_enabled BOOLEAN DEFAULT false;

-- 2. Adicionar coluna provider se não existir (em inglês)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- 3. Verificar se as colunas foram criadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('google_fit_enabled', 'provider')
ORDER BY column_name;

-- 4. Adicionar comentários explicativos
COMMENT ON COLUMN profiles.google_fit_enabled IS 'Indica se o usuário habilitou a integração com Google Fit';
COMMENT ON COLUMN profiles.provider IS 'Provedor de autenticação (email, google, etc.)';

-- 5. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_google_fit_enabled ON profiles(google_fit_enabled);

-- 6. Verificar se a tabela tem RLS habilitado
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles'
    ) THEN '✅ RLS habilitado' ELSE '❌ RLS NÃO habilitado' END as rls_status;

-- 7. Resumo final
SELECT 
    '✅ Colunas Google Fit adicionadas com sucesso!' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'profiles';
