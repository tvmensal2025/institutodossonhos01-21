-- Inserir usuário de teste diretamente na tabela auth.users (para desenvolvimento/testes)
-- Isso criará um usuário de teste com email e senha conhecidos

-- Primeiro, vamos garantir que existe um perfil para o usuário de teste
-- caso já exista um usuário com esse email

-- Função auxiliar para criar hash de senha (simplificada para teste)
-- NOTA: Em produção, use sempre senhas seguras!

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'teste@institutodossonhos.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "teste@institutodossonhos.com", "full_name": "Usuário de Teste", "city": "São Paulo", "phone": "11999999999", "gender": "other"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Criar perfil para o usuário de teste se não existir
INSERT INTO public.profiles (
  id,
  user_id, 
  full_name,
  email,
  city,
  phone,
  gender,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.id,
  'Usuário de Teste',
  'teste@institutodossonhos.com',
  'São Paulo',
  '11999999999',
  'other',
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email = 'teste@institutodossonhos.com'
ON CONFLICT (user_id) DO NOTHING;