-- Criar super admin oficial para produção
-- Email: suporte@institutodossonhos.com.br
-- Senha: 123456

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'suporte@institutodossonhos.com.br') THEN
    INSERT INTO auth.users (
    instance_id,
    id,
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
    reauthentication_token,
    reauthentication_sent_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'suporte@institutodossonhos.com.br',
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
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "admin_level": "super"}',
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
    '',
    NULL
    );
  END IF;
END $$;

-- 2. Criar perfil para o super admin
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Buscar o ID do usuário admin
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'suporte@institutodossonhos.com.br';
    
    -- Se encontrou o usuário, criar o perfil
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (
            user_id,
            full_name,
            email,
            role,
            admin_level,
            is_super_admin,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'Super Administrador',
            'suporte@institutodossonhos.com.br',
            'admin',
            'super',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
            role = 'admin',
            admin_level = 'super',
            is_super_admin = true,
            full_name = 'Super Administrador',
            updated_at = NOW();
    END IF;
END $$;

-- 3. Zerar todos os dados fake do Google Fit
UPDATE google_fit_data SET
    steps_count = 0,
    calories_burned = 0,
    distance_meters = 0,
    heart_rate_avg = 0,
    heart_rate_max = NULL,
    heart_rate_resting = NULL,
    active_minutes = 0,
    sleep_duration_hours = 0,
    weight_kg = NULL,
    height_cm = NULL,
    raw_data = NULL,
    sync_timestamp = NOW()
WHERE raw_data IS NULL OR raw_data = '{}';

-- 4. Limpar participações automáticas em desafios
-- Manter apenas estrutura, remover participações automáticas
DELETE FROM challenge_participations 
WHERE progress = 0 AND started_at < NOW() - INTERVAL '1 hour';

-- 5. Adicionar campo para mudança de senha no perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS require_password_change BOOLEAN DEFAULT false;

-- 6. Criar função para admins editarem usuários
CREATE OR REPLACE FUNCTION public.update_user_profile_admin(
  target_user_id UUID,
  new_full_name TEXT DEFAULT NULL,
  new_email TEXT DEFAULT NULL,
  new_role TEXT DEFAULT NULL,
  new_admin_level TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_profile RECORD;
  result JSON;
BEGIN
  -- Verificar se o usuário atual é admin
  SELECT * INTO current_user_profile 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF NOT FOUND OR (current_user_profile.role != 'admin' AND NOT current_user_profile.is_super_admin) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem editar usuários';
  END IF;
  
  -- Atualizar perfil do usuário alvo
  UPDATE public.profiles 
  SET 
    full_name = COALESCE(new_full_name, full_name),
    email = COALESCE(new_email, email),
    role = COALESCE(new_role, role),
    admin_level = CASE 
      WHEN new_role = 'admin' THEN COALESCE(new_admin_level, 'standard')
      ELSE NULL 
    END,
    updated_at = NOW()
  WHERE user_id = target_user_id;
  
  -- Retornar resultado
  result := JSON_BUILD_OBJECT(
    'success', true,
    'message', 'Perfil atualizado com sucesso',
    'user_id', target_user_id
  );
  
  RETURN result;
END;
$$;

-- 7. Criar função para trocar senha
CREATE OR REPLACE FUNCTION public.change_user_password()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Atualizar flag de mudança de senha
  UPDATE public.profiles 
  SET 
    password_changed_at = NOW(),
    require_password_change = false,
    updated_at = NOW()
  WHERE user_id = auth.uid();
  
  result := JSON_BUILD_OBJECT(
    'success', true,
    'message', 'Senha alterada com sucesso'
  );
  
  RETURN result;
END;
$$;

-- 8. Políticas RLS para admins gerenciarem usuários
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() 
      AND (p.role = 'admin' OR p.is_super_admin = true)
    ) OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() 
      AND (p.role = 'admin' OR p.is_super_admin = true)
    ) OR user_id = auth.uid()
  );

-- Verificar resultado
SELECT 'Super admin criado:' as info,
       u.email,
       p.full_name,
       p.role,
       p.admin_level,
       p.is_super_admin
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'suporte@institutodossonhos.com.br';