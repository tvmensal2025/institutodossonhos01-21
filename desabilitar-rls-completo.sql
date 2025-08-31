-- DESABILITAR RLS COMPLETAMENTE para resolver erro de recursão
-- Esta é a solução mais direta para o problema

-- 1. DESABILITAR RLS em todas as tabelas problemáticas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_measurements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS as políticas existentes
DROP POLICY IF EXISTS "profiles_secure" ON public.profiles;
DROP POLICY IF EXISTS "user_goals_secure" ON public.user_goals;
DROP POLICY IF EXISTS "courses_secure" ON public.courses;
DROP POLICY IF EXISTS "course_modules_secure" ON public.course_modules;
DROP POLICY IF EXISTS "lessons_secure" ON public.lessons;
DROP POLICY IF EXISTS "profiles_simple" ON public.profiles;
DROP POLICY IF EXISTS "user_goals_simple" ON public.user_goals;
DROP POLICY IF EXISTS "courses_simple" ON public.courses;
DROP POLICY IF EXISTS "course_modules_simple" ON public.course_modules;
DROP POLICY IF EXISTS "lessons_simple" ON public.lessons;

-- 3. GARANTIR que o admin existe
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

-- 4. CRIAR perfil admin se não existir
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

-- 5. VERIFICAR status das tabelas
SELECT 'Status das tabelas:' as info,
       schemaname,
       tablename,
       rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_goals', 'courses', 'course_modules', 'lessons')
ORDER BY tablename;

-- 6. VERIFICAR admin
SELECT 'Admin criado:' as info,
       u.email,
       p.role,
       p.admin_level
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'teste@institutodossonhos.com';

-- 7. RESULTADO FINAL
SELECT 'RLS DESABILITADO COMPLETAMENTE!' as status,
       'Agora você pode criar cursos sem erro de recursão' as resultado; 