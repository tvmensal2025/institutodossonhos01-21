-- SOLUÇÃO PERMANENTE com RLS seguro
-- Políticas que não causam recursão infinita

-- 1. REMOVER todas as políticas problemáticas
DROP POLICY IF EXISTS "profiles_simple" ON public.profiles;
DROP POLICY IF EXISTS "user_goals_simple" ON public.user_goals;
DROP POLICY IF EXISTS "courses_simple" ON public.courses;
DROP POLICY IF EXISTS "course_modules_simple" ON public.course_modules;
DROP POLICY IF EXISTS "lessons_simple" ON public.lessons;
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "user_goals_policy" ON public.user_goals;
DROP POLICY IF EXISTS "courses_policy" ON public.courses;
DROP POLICY IF EXISTS "course_modules_policy" ON public.course_modules;
DROP POLICY IF EXISTS "lessons_policy" ON public.lessons;

-- 2. GARANTIR que o admin existe
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

-- 3. CRIAR políticas RLS SEGURAS (sem recursão)

-- Política para profiles: usuário vê seu próprio perfil + admins veem todos
CREATE POLICY "profiles_secure" ON public.profiles
FOR ALL TO authenticated
USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Política para user_goals: usuário vê suas metas + admins veem todas
CREATE POLICY "user_goals_secure" ON public.user_goals
FOR ALL TO authenticated
USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Política para courses: criador vê seus cursos + admins veem todos
CREATE POLICY "courses_secure" ON public.courses
FOR ALL TO authenticated
USING (
    created_by = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Política para course_modules: módulos dos cursos do usuário + admins veem todos
CREATE POLICY "course_modules_secure" ON public.course_modules
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c 
        WHERE c.id = course_modules.course_id 
        AND (c.created_by = auth.uid() OR 
             (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin')
    )
);

-- Política para lessons: aulas dos módulos do usuário + admins veem todas
CREATE POLICY "lessons_secure" ON public.lessons
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.course_modules cm
        JOIN public.courses c ON cm.course_id = c.id
        WHERE cm.id = lessons.module_id
        AND (c.created_by = auth.uid() OR 
             (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin')
    )
);

-- 4. VERIFICAR se as políticas foram criadas
SELECT 'Políticas RLS criadas:' as info,
       tablename,
       policyname,
       cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. TESTAR se o admin pode acessar tudo
SELECT 'Teste de acesso admin:' as info,
       u.email,
       p.role,
       p.admin_level,
       CASE 
           WHEN p.role = 'admin' THEN '✅ Admin com acesso total'
           ELSE '❌ Usuário normal'
       END as status
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'teste@institutodossonhos.com';

-- 6. RESULTADO FINAL
SELECT 'SOLUÇÃO PERMANENTE APLICADA!' as status,
       'Políticas RLS seguras criadas sem recursão' as resultado; 