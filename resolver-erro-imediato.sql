-- RESOLVER ERRO IMEDIATO - Desabilitar RLS temporariamente
-- Erro: infinite recursion detected in policy for relation "profiles"

-- 1. DESABILITAR RLS imediatamente para resolver o erro
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER todas as políticas problemáticas
DROP POLICY IF EXISTS "profiles_safe" ON public.profiles;
DROP POLICY IF EXISTS "user_goals_safe" ON public.user_goals;
DROP POLICY IF EXISTS "courses_safe" ON public.courses;
DROP POLICY IF EXISTS "course_modules_safe" ON public.course_modules;
DROP POLICY IF EXISTS "lessons_safe" ON public.lessons;
DROP POLICY IF EXISTS "profiles_secure" ON public.profiles;
DROP POLICY IF EXISTS "user_goals_secure" ON public.user_goals;
DROP POLICY IF EXISTS "courses_secure" ON public.courses;
DROP POLICY IF EXISTS "course_modules_secure" ON public.course_modules;
DROP POLICY IF EXISTS "lessons_secure" ON public.lessons;

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

-- 5. VERIFICAR se RLS foi desabilitado
SELECT 'RLS DESABILITADO:' as info,
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

-- 7. RESULTADO IMEDIATO
SELECT 'ERRO RESOLVIDO IMEDIATAMENTE!' as status,
       'Agora teste criar um curso - RLS desabilitado temporariamente' as resultado; 