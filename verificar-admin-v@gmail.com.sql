-- Script para verificar e corrigir status de admin do usuário v@gmail.com
-- Execute este script no Supabase SQL Editor

-- 1. Verifica se o usuário existe
SELECT 
  id, 
  email, 
  full_name, 
  username,
  role,
  is_admin
FROM profiles 
WHERE email = 'v@gmail.com';

-- 2. Adiciona colunas se não existirem
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 3. Torna o usuário v@gmail.com admin
UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin'
WHERE email = 'v@gmail.com';

-- 4. Verifica se funcionou
SELECT 
  id, 
  email, 
  full_name, 
  username,
  role,
  is_admin
FROM profiles 
WHERE email = 'v@gmail.com';

-- 5. Lista todos os admins
SELECT 
  id, 
  email, 
  full_name, 
  role,
  is_admin
FROM profiles 
WHERE is_admin = true OR role = 'admin'; 