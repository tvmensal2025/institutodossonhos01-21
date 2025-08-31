-- Criar super admin oficial para produção (corrigido)
-- Email: suporte@institutodossonhos.com.br
-- Senha: 123456

-- 1. Primeiro verificar se já existe
DO $$
DECLARE
    admin_user_id uuid;
    user_exists boolean := false;
BEGIN
    -- Verificar se usuário já existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'suporte@institutodossonhos.com.br') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Inserir usuário admin na tabela auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'suporte@institutodossonhos.com.br',
            crypt('123456', gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "admin", "admin_level": "super"}',
            NOW(),
            NOW()
        );
    END IF;
    
    -- Buscar o ID do usuário admin
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'suporte@institutodossonhos.com.br';
    
    -- Criar ou atualizar perfil
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

-- 2. Zerar todos os dados fake do Google Fit
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

-- 3. Limpar participações automáticas em desafios
DELETE FROM challenge_participations 
WHERE progress = 0 AND started_at < NOW() - INTERVAL '1 hour';

-- 4. Adicionar campos para mudança de senha no perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS require_password_change BOOLEAN DEFAULT false;

-- 5. Criar função para admins editarem usuários
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
  
  result := JSON_BUILD_OBJECT(
    'success', true,
    'message', 'Perfil atualizado com sucesso',
    'user_id', target_user_id
  );
  
  RETURN result;
END;
$$;

-- 6. Criar função para trocar senha
CREATE OR REPLACE FUNCTION public.change_user_password()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
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

-- 7. Verificar resultado
SELECT 'RESULTADO:' as status,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM auth.users u
               JOIN public.profiles p ON u.id = p.user_id
               WHERE u.email = 'suporte@institutodossonhos.com.br'
               AND p.role = 'admin'
               AND p.is_super_admin = true
           ) THEN 'SUPER ADMIN CRIADO COM SUCESSO! ✅'
           ELSE 'ERRO: Super admin não foi criado ❌'
       END as resultado;