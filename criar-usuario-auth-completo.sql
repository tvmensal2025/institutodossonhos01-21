-- ========================================
-- CRIAR USUÁRIO COMPLETO NO AUTH
-- ========================================

-- 1. LIMPAR USUÁRIO EXISTENTE
DELETE FROM auth.users WHERE email = 'teste@institutodossonhos.com';
DELETE FROM public.profiles WHERE email = 'teste@institutodossonhos.com';

-- 2. CRIAR USUÁRIO NA TABELA AUTH.USERS
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
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'teste@institutodossonhos.com',
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
  '{"full_name": "Usuário Teste", "role": "user"}',
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
);

-- 3. CRIAR PERFIL
INSERT INTO public.profiles (
  user_id,
  full_name,
  email,
  role,
  points,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Usuário Teste',
  'teste@institutodossonhos.com',
  'user',
  0,
  NOW(),
  NOW()
);

-- 4. VERIFICAÇÃO FINAL
SELECT '✅ USUÁRIO CRIADO COM SUCESSO!' as status;
SELECT COUNT(*) as total_users FROM auth.users WHERE email = 'teste@institutodossonhos.com';
SELECT COUNT(*) as total_profiles FROM public.profiles WHERE email = 'teste@institutodossonhos.com';
SELECT id as user_id FROM auth.users WHERE email = 'teste@institutodossonhos.com'; 