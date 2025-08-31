-- 🔧 RECONSTRUÇÃO COMPLETA - PARTE 2
-- Removendo todas as políticas conflitantes primeiro

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Remover todas as políticas da tabela profiles
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.profiles';
    END LOOP;
    
    -- Remover todas as políticas da tabela user_sessions
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_sessions' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.user_sessions';
    END LOOP;
    
    -- Remover todas as políticas da tabela sessions
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'sessions' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.sessions';
    END LOOP;
    
    -- Remover todas as políticas das tabelas de curso
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'courses' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.courses';
    END LOOP;
    
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'course_modules' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.course_modules';
    END LOOP;
    
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'lessons' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.lessons';
    END LOOP;
END $$;

-- 2. ADICIONAR COLUNA EMAIL SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- 3. RECRIAR PERFIS PARA USUÁRIOS AUTH SEM PERFIL
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

-- 4. ATRIBUIR SESSÕES ATIVAS PARA USUÁRIOS
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

SELECT 'DADOS RESTAURADOS - Próximo: Recriar políticas RLS' as status;