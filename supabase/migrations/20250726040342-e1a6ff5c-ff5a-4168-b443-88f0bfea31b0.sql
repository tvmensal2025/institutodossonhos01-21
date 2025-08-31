-- Adicionar coluna email na tabela user_profiles
ALTER TABLE user_profiles ADD COLUMN email TEXT;

-- Criar índice na coluna email para melhor performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Atualizar emails existentes baseados na tabela auth.users (opcional)
-- Isso preencherá os emails dos usuários já cadastrados
UPDATE user_profiles 
SET email = auth_users.email 
FROM auth.users AS auth_users 
WHERE user_profiles.user_id = auth_users.id 
AND user_profiles.email IS NULL;