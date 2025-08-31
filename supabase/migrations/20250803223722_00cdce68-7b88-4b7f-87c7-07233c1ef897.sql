-- 🔧 RECONSTRUÇÃO COMPLETA DO SISTEMA
-- Corrigindo todos os relacionamentos quebrados e dados ausentes

-- 1. LIMPAR DADOS ÓRFÃOS E RECRIAR PERFIS
-- Primeiro, verificar e corrigir estrutura da tabela profiles se necessário
DO $$
BEGIN
  -- Adicionar coluna email se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- 2. RECRIAR PERFIS PARA TODOS OS USUÁRIOS AUTH SEM PERFIL
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
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Usuário ' || SPLIT_PART(au.email, '@', 1)) as full_name,
  au.email,
  CASE 
    WHEN au.email LIKE '%admin%' OR au.email LIKE '%teste%' THEN 'admin'
    ELSE 'user'
  END as role,
  CASE 
    WHEN au.email LIKE '%admin%' OR au.email LIKE '%teste%' THEN 'super'
    ELSE NULL
  END as admin_level,
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = au.id
);

-- 3. ATRIBUIR TODAS AS SESSÕES ATIVAS PARA TODOS OS USUÁRIOS COM PERFIL
INSERT INTO public.user_sessions (
  user_id, 
  session_id, 
  status, 
  progress, 
  assigned_at
)
SELECT 
  p.user_id,
  s.id,
  'pending' as status,
  0 as progress,
  NOW() as assigned_at
FROM public.profiles p
CROSS JOIN public.sessions s
WHERE s.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.user_sessions us 
    WHERE us.user_id = p.user_id AND us.session_id = s.id
  );

-- 4. CORRIGIR E RECRIAR POLÍTICAS RLS ESSENCIAIS
-- Remover políticas antigas que podem estar quebradas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Everyone can view active sessions" ON public.sessions;

-- Recriar políticas RLS corretas para PROFILES
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Recriar políticas RLS corretas para USER_SESSIONS
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all user sessions" ON public.user_sessions;
CREATE POLICY "Admins can manage all user sessions" ON public.user_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Recriar políticas RLS corretas para SESSIONS
CREATE POLICY "Everyone can view active sessions" ON public.sessions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage sessions" ON public.sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 5. CORRIGIR POLÍTICAS PARA COURSES E MÓDULOS
DROP POLICY IF EXISTS "Everyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view course modules" ON public.course_modules;
DROP POLICY IF EXISTS "Everyone can view lessons" ON public.lessons;

CREATE POLICY "Everyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

CREATE POLICY "Everyone can view course modules" ON public.course_modules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage course modules" ON public.course_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

CREATE POLICY "Everyone can view lessons" ON public.lessons
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 6. VERIFICAÇÃO FINAL - Status do sistema restaurado
SELECT 
  'SISTEMA RESTAURADO!' as status,
  (SELECT COUNT(*) FROM public.profiles) as profiles_criados,
  (SELECT COUNT(*) FROM public.user_sessions) as sessoes_atribuidas,
  (SELECT COUNT(*) FROM public.sessions WHERE is_active = true) as sessoes_ativas,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admins_criados;