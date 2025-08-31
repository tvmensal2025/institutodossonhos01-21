-- Script para tornar usuário existente em super admin
-- Email: teste@institutodossonhos.com

-- 1. Verificar se o usuário existe
SELECT 'Verificando usuário existente:' as info,
       id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'teste@institutodossonhos.com';

-- 2. Tornar o usuário existente em super admin
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

-- 3. Se o perfil não existir, criar um novo
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

-- 4. Verificar resultado
SELECT 'Usuário admin atualizado:' as info,
       u.id,
       u.email,
       p.full_name,
       p.role,
       p.admin_level,
       p.updated_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'teste@institutodossonhos.com';

-- 5. Resultado final
SELECT 'RESULTADO FINAL:' as status,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM auth.users u
               JOIN public.profiles p ON u.id = p.user_id
               WHERE u.email = 'teste@institutodossonhos.com'
               AND p.role = 'admin'
           ) THEN 'USUÁRIO TORNADO ADMIN COM SUCESSO! ✅'
           ELSE 'ERRO: Usuário não foi tornado admin ❌'
       END as resultado;

-- 6. Informações de login
SELECT 'INFORMAÇÕES DE LOGIN:' as info,
       'Email: teste@institutodossonhos.com' as email,
       'Senha: (mantenha a senha atual)' as senha,
       'Role: admin' as role,
       'Admin Level: super' as admin_level; 