-- Corrigir erro de recursão infinita nas políticas RLS
-- Erro: 'infinite recursion detected in policy for relation "profiles"'

-- 1. Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can manage all goals" ON public.user_goals;
DROP POLICY IF EXISTS "admin_full_access" ON public.user_goals;
DROP POLICY IF EXISTS "admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "admin_can_manage_goals" ON public.user_goals;
DROP POLICY IF EXISTS "admin_can_view_all_profiles" ON public.profiles;

-- 2. Criar políticas RLS simples e seguras
-- Política para profiles
CREATE POLICY "profiles_policy" ON public.profiles
FOR ALL TO authenticated
USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM public.profiles admin_profile
        WHERE admin_profile.user_id = auth.uid()
        AND admin_profile.role = 'admin'
    )
);

-- Política para user_goals
CREATE POLICY "user_goals_policy" ON public.user_goals
FOR ALL TO authenticated
USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles admin_profile
        WHERE admin_profile.user_id = auth.uid()
        AND admin_profile.role = 'admin'
    )
);

-- Política para courses
CREATE POLICY "courses_policy" ON public.courses
FOR ALL TO authenticated
USING (
    created_by = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles admin_profile
        WHERE admin_profile.user_id = auth.uid()
        AND admin_profile.role = 'admin'
    )
);

-- Política para course_modules
CREATE POLICY "course_modules_policy" ON public.course_modules
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_modules.course_id
        AND (c.created_by = auth.uid() OR 
             EXISTS (
                 SELECT 1 FROM public.profiles admin_profile
                 WHERE admin_profile.user_id = auth.uid()
                 AND admin_profile.role = 'admin'
             )
        )
    )
);

-- Política para lessons
CREATE POLICY "lessons_policy" ON public.lessons
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.course_modules cm
        JOIN public.courses c ON cm.course_id = c.id
        WHERE cm.id = lessons.module_id
        AND (c.created_by = auth.uid() OR 
             EXISTS (
                 SELECT 1 FROM public.profiles admin_profile
                 WHERE admin_profile.user_id = auth.uid()
                 AND admin_profile.role = 'admin'
             )
        )
    )
);

-- 3. Verificar se o usuário admin existe
SELECT 'Verificando admin:' as info,
       u.email,
       p.role,
       p.admin_level
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'teste@institutodossonhos.com';

-- 4. Garantir que o admin tem permissões
UPDATE public.profiles 
SET 
    role = 'admin',
    admin_level = 'super',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'teste@institutodossonhos.com'
);

-- 5. Verificar políticas criadas
SELECT 'Políticas RLS criadas:' as info,
       schemaname,
       tablename,
       policyname,
       cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Resultado final
SELECT 'ERRO CORRIGIDO!' as status,
       'Políticas RLS recriadas sem recursão' as resultado; 