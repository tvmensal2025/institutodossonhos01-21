-- Script SIMPLES para criar usuário admin
-- Execute este script no SQL Editor do Supabase

-- MÉTODO 1: Inserção direta (mais simples)
-- Substitua 'SEU_USER_ID_AQUI' pelo ID de um usuário existente que você quer tornar admin

-- 1. Verificar usuários existentes
SELECT 'Usuários existentes:' as info,
       id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Criar perfil admin para usuário existente (substitua o ID)
-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário
/*
INSERT INTO public.profiles (
    user_id,
    full_name,
    email,
    role,
    admin_level,
    created_at,
    updated_at
) VALUES (
    'SEU_USER_ID_AQUI', -- Substitua pelo ID real
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
*/

-- 3. OU tornar o primeiro usuário existente em admin
UPDATE public.profiles 
SET 
    role = 'admin',
    admin_level = 'super',
    full_name = 'Administrador Principal',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- 4. Verificar resultado
SELECT 'Perfil admin criado:' as info,
       u.id,
       u.email,
       p.full_name,
       p.role,
       p.admin_level
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE p.role = 'admin';