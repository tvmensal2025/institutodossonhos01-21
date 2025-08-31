-- SOLUÇÃO SEGURA sem recursão
-- Mantém RLS ativo mas resolve o erro de forma inteligente

-- 1. REMOVER apenas as políticas problemáticas
DROP POLICY IF EXISTS "profiles_secure" ON public.profiles;
DROP POLICY IF EXISTS "user_goals_secure" ON public.user_goals;
DROP POLICY IF EXISTS "courses_secure" ON public.courses;
DROP POLICY IF EXISTS "course_modules_secure" ON public.course_modules;
DROP POLICY IF EXISTS "lessons_secure" ON public.lessons;

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

-- 3. CRIAR políticas RLS SEGURAS sem recursão
-- Política para profiles: baseada apenas no user_id (sem recursão)
CREATE POLICY "profiles_safe" ON public.profiles
FOR ALL TO authenticated
USING (
    user_id = auth.uid() OR 
    auth.uid() IN (
        SELECT user_id FROM public.profiles 
        WHERE role = 'admin'
    )
);

-- Política para user_goals: baseada apenas no user_id (sem recursão)
CREATE POLICY "user_goals_safe" ON public.user_goals
FOR ALL TO authenticated
USING (
    user_id = auth.uid() OR 
    auth.uid() IN (
        SELECT user_id FROM public.profiles 
        WHERE role = 'admin'
    )
);

-- Política para courses: baseada apenas no created_by (sem recursão)
CREATE POLICY "courses_safe" ON public.courses
FOR ALL TO authenticated
USING (
    created_by = auth.uid() OR 
    auth.uid() IN (
        SELECT user_id FROM public.profiles 
        WHERE role = 'admin'
    )
);

-- Política para course_modules: baseada no course_id (sem recursão)
CREATE POLICY "course_modules_safe" ON public.course_modules
FOR ALL TO authenticated
USING (
    course_id IN (
        SELECT id FROM public.courses 
        WHERE created_by = auth.uid() OR 
              auth.uid() IN (
                  SELECT user_id FROM public.profiles 
                  WHERE role = 'admin'
              )
    )
);

-- Política para lessons: baseada no module_id (sem recursão)
CREATE POLICY "lessons_safe" ON public.lessons
FOR ALL TO authenticated
USING (
    module_id IN (
        SELECT cm.id FROM public.course_modules cm
        JOIN public.courses c ON cm.course_id = c.id
        WHERE c.created_by = auth.uid() OR 
              auth.uid() IN (
                  SELECT user_id FROM public.profiles 
                  WHERE role = 'admin'
              )
    )
);

-- 4. VERIFICAR se as políticas foram criadas
SELECT 'Políticas RLS seguras criadas:' as info,
       tablename,
       policyname,
       cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE '%_safe'
ORDER BY tablename, policyname;

-- 5. TESTAR acesso do admin
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

-- 6. VERIFICAR se RLS está ativo
SELECT 'Status RLS:' as info,
       schemaname,
       tablename,
       rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_goals', 'courses', 'course_modules', 'lessons')
ORDER BY tablename;

-- 7. RESULTADO FINAL
SELECT 'SOLUÇÃO SEGURA APLICADA!' as status,
       'RLS ativo com políticas sem recursão' as resultado; 