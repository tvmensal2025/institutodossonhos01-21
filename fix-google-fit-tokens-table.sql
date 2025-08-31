-- Script para verificar e corrigir a tabela google_fit_tokens
-- Execute este script para completar a estrutura da tabela

-- 1. Verificar estrutura atual
SELECT 
    'ESTRUTURA ATUAL:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'google_fit_tokens' 
ORDER BY ordinal_position;

-- 2. Adicionar colunas faltantes
ALTER TABLE google_fit_tokens 
ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'Bearer';

ALTER TABLE google_fit_tokens 
ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.location.read https://www.googleapis.com/auth/fitness.nutrition.read https://www.googleapis.com/auth/fitness.oxygen_saturation.read https://www.googleapis.com/auth/fitness.sleep.read';

ALTER TABLE google_fit_tokens 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE google_fit_tokens 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Verificar se as colunas foram criadas
SELECT 
    'COLUNAS APÓS CORREÇÃO:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'google_fit_tokens' 
ORDER BY ordinal_position;

-- 4. Adicionar comentários explicativos
COMMENT ON COLUMN google_fit_tokens.token_type IS 'Tipo do token (Bearer, etc.)';
COMMENT ON COLUMN google_fit_tokens.scope IS 'Escopos de permissão do Google Fit';
COMMENT ON COLUMN google_fit_tokens.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN google_fit_tokens.updated_at IS 'Data da última atualização';

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_google_fit_tokens_user_id ON google_fit_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_tokens_created_at ON google_fit_tokens(created_at);

-- 6. Resumo final
SELECT 
    '✅ Tabela google_fit_tokens corrigida com sucesso!' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'google_fit_tokens';
