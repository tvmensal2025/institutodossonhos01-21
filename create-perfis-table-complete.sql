-- Script COMPLETO para criar a tabela perfis do zero
-- Execute este script no Supabase Dashboard SQL Editor

-- 1. Criar a tabela perfis
CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    birth_date DATE,
    height DECIMAL(5,2),
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    google_fit_enabled BOOLEAN DEFAULT false,
    provedor TEXT DEFAULT 'email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Comentários explicativos
COMMENT ON TABLE perfis IS 'Perfis dos usuários com informações pessoais e configurações';
COMMENT ON COLUMN perfis.google_fit_enabled IS 'Indica se o usuário habilitou a integração com Google Fit';
COMMENT ON COLUMN perfis.provedor IS 'Provedor de autenticação (email, google, etc.)';

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_perfis_user_id ON perfis(user_id);
CREATE INDEX IF NOT EXISTS idx_perfis_email ON perfis(email);
CREATE INDEX IF NOT EXISTS idx_perfis_google_fit_enabled ON perfis(google_fit_enabled);
CREATE INDEX IF NOT EXISTS idx_perfis_provedor ON perfis(provedor);

-- 4. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para atualizar updated_at
CREATE TRIGGER update_perfis_updated_at
    BEFORE UPDATE ON perfis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de segurança
CREATE POLICY "Users can view own profile" ON perfis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON perfis
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON perfis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Verificar se a tabela foi criada
SELECT 
    '✅ Tabela perfis criada com sucesso!' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'perfis';
