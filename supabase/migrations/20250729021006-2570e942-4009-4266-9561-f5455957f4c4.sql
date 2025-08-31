-- Criar usuário de teste diretamente no banco para debugging
-- IMPORTANT: Este é apenas para testes - normalmente usuários são criados via signup

-- Primeiro vamos verificar se já existe um usuário teste
DO $$
BEGIN
  -- Inserir usuário de teste se não existir
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
    crypt('123456', gen_salt('bf')), -- senha: 123456
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Usuário Teste"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING;
  
  -- Inserir perfil para o usuário de teste
  INSERT INTO public.profiles (
    id,
    user_id, 
    full_name,
    phone,
    city,
    created_at,
    updated_at
  )
  SELECT 
    u.id,
    u.id,
    'Usuário Teste',
    '(11) 99999-9999',
    'São Paulo',
    NOW(),
    NOW()
  FROM auth.users u 
  WHERE u.email = 'teste@institutodossonhos.com'
  ON CONFLICT (user_id) DO NOTHING;

END $$;