-- Adicionar coluna google_fit_enabled na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS google_fit_enabled BOOLEAN DEFAULT false;

-- Adicionar coluna provider na tabela profiles se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- Comentário explicativo
COMMENT ON COLUMN profiles.google_fit_enabled IS 'Indica se o usuário habilitou a integração com Google Fit';
COMMENT ON COLUMN profiles.provider IS 'Provedor de autenticação (email, google, etc.)';
