-- ========================================
-- CRIAR USUÁRIO LUU@GMAIL.COM
-- ========================================

-- 1. INSERIR USUÁRIO NA TABELA AUTH.USERS
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_sent_at,
  reauthentication_token,
  is_sso_user
) VALUES (
  '3e01afcf-03c4-43ce-bd4e-b9748ed0caf5',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'luu@gmail.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Luu", "role": "user"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  NULL,
  '',
  false
) ON CONFLICT (id) DO NOTHING;

-- 2. INSERIR PERFIL DO USUÁRIO
INSERT INTO public.profiles (
  user_id,
  full_name,
  email,
  role,
  points,
  created_at,
  updated_at
) VALUES (
  '3e01afcf-03c4-43ce-bd4e-b9748ed0caf5',
  'Luu',
  'luu@gmail.com',
  'user',
  0,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- 3. VERIFICAÇÃO FINAL
SELECT '✅ USUÁRIO LUU CRIADO COM SUCESSO!' as status;
SELECT COUNT(*) as total_users FROM auth.users WHERE email = 'luu@gmail.com';
SELECT COUNT(*) as total_profiles FROM public.profiles WHERE email = 'luu@gmail.com';
SELECT id as user_id FROM auth.users WHERE email = 'luu@gmail.com'; 