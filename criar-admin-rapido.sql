-- Script para tornar um usuário admin rapidamente
-- Execute este script no Supabase SQL Editor

-- Adiciona coluna is_admin se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Adiciona coluna role se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Torna o primeiro usuário admin (ajuste o email conforme necessário)
UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin'
WHERE email = 'rafael@exemplo.com'  -- MUDE PARA SEU EMAIL
   OR id IN (SELECT id FROM profiles LIMIT 1);  -- Ou pega o primeiro usuário

-- Verifica se funcionou
SELECT id, email, full_name, username, is_admin, role 
FROM profiles 
WHERE is_admin = true OR role = 'admin';