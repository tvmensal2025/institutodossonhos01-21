-- ========================================
-- CRIAR USUÁRIO MOCK PARA DESENVOLVIMENTO
-- ========================================

-- Inserir usuário mock no auth.users
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_sent_at, reauthentication_token, is_sso_user) VALUES ('109a2a65-9e2e-4723-8543-fbbf68bdc085', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teste@email.com', crypt('123456', gen_salt('bf')), NOW(), NULL, '', NULL, '', NULL, '', '', NULL, NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Usuário Teste", "role": "user"}', false, NOW(), NOW(), NULL, NULL, '', '', NULL, '', 0, NULL, NULL, '', false) ON CONFLICT (id) DO NOTHING;

-- Inserir perfil do usuário mock
INSERT INTO public.profiles (user_id, full_name, email, role, points, created_at, updated_at) VALUES ('109a2a65-9e2e-4723-8543-fbbf68bdc085', 'Usuário Teste', 'teste@email.com', 'user', 0, NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING;

-- Verificar se foi criado
SELECT 
  '✅ USUÁRIO MOCK CRIADO COM SUCESSO!' as status,
  COUNT(*) as total_users
FROM auth.users WHERE id = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

SELECT 
  COUNT(*) as total_profiles
FROM public.profiles WHERE user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085'; 