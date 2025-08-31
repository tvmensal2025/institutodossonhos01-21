-- Script para criar usuário admin principal
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar se o usuário já existe
SELECT 'Verificando usuário existente:' as info,
       id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'teste@institutodossonhos.com';

-- 2. Inserir usuário admin na tabela auth.users
-- IMPORTANTE: Execute este bloco apenas se o usuário não existir
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
    'teste@institutodossonhos.com',
    crypt('123456', gen_salt('bf')), -- Senha criptografada
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
    '{"role": "admin", "admin_level": "super"}', -- Metadados do admin
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
) ON CONFLICT (email) DO NOTHING;

-- 3. Obter o ID do usuário criado
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'teste@institutodossonhos.com';
    
    -- Se encontrou o usuário, criar o perfil
    IF user_uuid IS NOT NULL THEN
        -- Inserir perfil na tabela public.profiles
        INSERT INTO public.profiles (
            user_id,
            full_name,
            email,
            role,
            admin_level,
            created_at,
            updated_at
        ) VALUES (
            user_uuid,
            'Administrador Principal',
            'teste@institutodossonhos.com',
            'admin',
            'super',
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
            role = 'admin',
            admin_level = 'super',
            full_name = 'Administrador Principal',
            updated_at = NOW();
            
        RAISE NOTICE 'Usuário admin criado com sucesso! ID: %', user_uuid;
    ELSE
        RAISE NOTICE 'Erro: Usuário não foi criado';
    END IF;
END $$;

-- 4. Verificar se o usuário foi criado corretamente
SELECT 'Usuário criado:' as info,
       u.id,
       u.email,
       u.email_confirmed_at,
       u.raw_user_meta_data,
       p.full_name,
       p.role,
       p.admin_level
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'teste@institutodossonhos.com';

-- 5. Verificar políticas RLS para admin
SELECT 'Políticas RLS para admin:' as info,
       tablename,
       policyname,
       cmd,
       roles
FROM pg_policies 
WHERE qual LIKE '%admin%' OR qual LIKE '%role%'
ORDER BY tablename, policyname;

-- 6. Criar política RLS específica para admin se não existir
DO $$
BEGIN
    -- Política para user_goals
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_goals' 
        AND policyname = 'admin_full_access'
    ) THEN
        EXECUTE 'CREATE POLICY admin_full_access ON public.user_goals FOR ALL TO authenticated USING (
            (auth.jwt() ->> ''role'') = ''admin'' OR 
            (auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'' OR
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = ''admin''
            )
        )';
        RAISE NOTICE 'Política admin criada para user_goals';
    END IF;
    
    -- Política para profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'admin_full_access'
    ) THEN
        EXECUTE 'CREATE POLICY admin_full_access ON public.profiles FOR ALL TO authenticated USING (
            (auth.jwt() ->> ''role'') = ''admin'' OR 
            (auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'' OR
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = ''admin''
            )
        )';
        RAISE NOTICE 'Política admin criada para profiles';
    END IF;
END $$;

-- 7. Resultado final
SELECT 'RESULTADO FINAL:' as status,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM auth.users u
               JOIN public.profiles p ON u.id = p.user_id
               WHERE u.email = 'teste@institutodossonhos.com'
               AND p.role = 'admin'
           ) THEN 'USUÁRIO ADMIN CRIADO COM SUCESSO! ✅'
           ELSE 'ERRO: Usuário admin não foi criado ❌'
       END as resultado;