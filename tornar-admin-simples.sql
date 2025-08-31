-- Comando SIMPLES para tornar usuário em super admin
-- Email: teste@institutodossonhos.com

-- 1. Tornar o usuário em super admin
UPDATE public.profiles 
SET 
    role = 'admin',
    admin_level = 'super',
    full_name = 'Administrador Principal',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'teste@institutodossonhos.com'
);

-- 2. Se o perfil não existir, criar um
INSERT INTO public.profiles (
    user_id,
    full_name,
    email,
    role,
    admin_level,
    created_at,
    updated_at
)
SELECT 
    id,
    'Administrador Principal',
    email,
    'admin',
    'super',
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'teste@institutodossonhos.com'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.users.id
);

-- 3. Verificar se funcionou
SELECT 'RESULTADO:' as info,
       u.email,
       p.role,
       p.admin_level
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'teste@institutodossonhos.com'; 