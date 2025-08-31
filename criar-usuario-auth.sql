-- ========================================
-- CRIAR USUÁRIO DIRETAMENTE NO AUTH
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
  gen_random_uuid(),
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
) ON CONFLICT (email) DO NOTHING;

-- 2. OBTER O ID DO USUÁRIO CRIADO
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'teste@institutodossonhos.com';
  
  -- 3. INSERIR PERFIL
  INSERT INTO public.profiles (
    user_id,
    full_name,
    email,
    role,
    points
  ) VALUES (
    user_id,
    'Usuário Teste',
    'teste@institutodossonhos.com',
    'user',
    0
  ) ON CONFLICT (user_id) DO NOTHING;
  
  RAISE NOTICE '✅ Usuário criado com ID: %', user_id;
END $$;

-- 4. VERIFICAÇÃO FINAL
SELECT '✅ USUÁRIO CRIADO COM SUCESSO!' as status;
SELECT COUNT(*) as total_users FROM auth.users WHERE email = 'teste@institutodossonhos.com';
SELECT COUNT(*) as total_profiles FROM public.profiles WHERE email = 'teste@institutodossonhos.com'; 