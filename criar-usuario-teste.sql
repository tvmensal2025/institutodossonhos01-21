-- ========================================
-- CRIAR USUÁRIO DE TESTE
-- ========================================

-- 1. INSERIR USUÁRIO NA TABELA AUTH.USERS
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'teste@institutodossonhos.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"role": "user", "full_name": "Usuário Teste"}',
  false,
  '',
  ''
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
  '00000000-0000-0000-0000-000000000000',
  'Usuário Teste',
  'teste@institutodossonhos.com',
  'user',
  0,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- 3. VERIFICAÇÃO
SELECT '✅ USUÁRIO DE TESTE CRIADO!' as status;
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_profiles FROM public.profiles; 