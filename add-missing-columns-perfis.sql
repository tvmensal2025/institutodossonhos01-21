-- Script para adicionar colunas faltantes na tabela perfis
-- Adicionar coluna google_fit_enabled se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS google_fit_enabled BOOLEAN DEFAULT false;

-- Adicionar coluna provedor se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS provedor TEXT DEFAULT 'email';

-- Adicionar coluna birth_date se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Adicionar coluna height se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2);

-- Adicionar coluna gender se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));

-- Adicionar coluna avatar_url se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Adicionar coluna full_name se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Adicionar coluna created_at se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Adicionar coluna updated_at se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Comentários explicativos
COMMENT ON COLUMN perfis.google_fit_enabled IS 'Indica se o usuário habilitou a integração com Google Fit';
COMMENT ON COLUMN perfis.provedor IS 'Provedor de autenticação (email, google, etc.)';

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_perfis_google_fit_enabled ON perfis(google_fit_enabled);
CREATE INDEX IF NOT EXISTS idx_perfis_provedor ON perfis(provedor);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS update_perfis_updated_at ON perfis;
CREATE TRIGGER update_perfis_updated_at 
    BEFORE UPDATE ON perfis 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
