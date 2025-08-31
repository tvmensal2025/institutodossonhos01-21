-- Script para tornar lucas11@gmail.com admin
-- Execute este SQL no Supabase SQL Editor

-- Primeiro, verificar se o usuário existe
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'lucas11@gmail.com';

-- Atualizar perfil existente para admin
UPDATE public.profiles 
SET 
  role = 'admin', 
  admin_level = 'super',
  updated_at = NOW()
WHERE email = 'lucas11@gmail.com';

-- Se não existe perfil, criar um novo (usando o user_id do auth.users)
INSERT INTO public.profiles (user_id, email, full_name, role, admin_level, created_at, updated_at)
SELECT 
  au.id,
  'lucas11@gmail.com',
  COALESCE(au.raw_user_meta_data->>'full_name', 'Lucas Admin'),
  'admin',
  'super',
  NOW(),
  NOW()
FROM auth.users au 
WHERE au.email = 'lucas11@gmail.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'lucas11@gmail.com');

-- Verificar resultado
SELECT * FROM public.profiles WHERE email = 'lucas11@gmail.com';