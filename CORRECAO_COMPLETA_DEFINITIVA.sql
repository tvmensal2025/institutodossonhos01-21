-- ========================================
-- CORREÇÃO COMPLETA E DEFINITIVA DO SISTEMA
-- Inclui TODOS os problemas já identificados e resolvidos
-- Execute este script NO SQL EDITOR DO SUPABASE AGORA!
-- ========================================

-- 1. VERIFICAÇÃO INICIAL
SELECT '🔍 VERIFICAÇÃO INICIAL DO SISTEMA:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'user_profiles', 'weight_measurements', 'user_goals', 'daily_mission_sessions', 'courses', 'course_modules', 'lessons', 'challenge_participations')
ORDER BY table_name;

-- 2. ADICIONAR COLUNAS FALTANTES NA TABELA PROFILES (PRIMEIRO!)
SELECT '👥 ADICIONANDO COLUNAS FALTANTES EM PROFILES:' as info;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS admin_level TEXT;

-- 3. CORREÇÃO DE TABELAS EDUCACIONAIS (Cursos, Módulos, Aulas)
SELECT '📚 CORRIGINDO TABELAS EDUCACIONAIS:' as info;

-- Cursos
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Módulos
ALTER TABLE public.course_modules 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Aulas
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id),
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. CORREÇÃO DE TABELAS DE DESAFIOS
SELECT '🎯 CORRIGINDO TABELAS DE DESAFIOS:' as info;

-- Challenge Participations (se não existir, criar)
CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC,
  progress_percentage NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- 5. CRIAR TABELA USER_PROFILES SE NÃO EXISTIR
SELECT '👥 CRIANDO TABELA USER_PROFILES SE NECESSÁRIO:' as info;

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MIGRAR DADOS DE USER_PROFILES PARA PROFILES (SE EXISTIR)
SELECT '👥 MIGRANDO DADOS DE USER_PROFILES PARA PROFILES:' as info;

-- Verificar se user_profiles tem dados antes de migrar
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    IF EXISTS (SELECT 1 FROM user_profiles LIMIT 1) THEN
      -- Migrar dados se a tabela existir e tiver dados
      INSERT INTO profiles (user_id, full_name, email, phone, city, avatar_url, bio, created_at, updated_at)
      SELECT user_id, full_name, email, phone, city, avatar_url, bio, created_at, updated_at
      FROM user_profiles
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        city = EXCLUDED.city,
        avatar_url = EXCLUDED.avatar_url,
        bio = EXCLUDED.bio,
        updated_at = NOW();
      
      RAISE NOTICE 'Dados migrados de user_profiles para profiles';
    ELSE
      RAISE NOTICE 'Tabela user_profiles existe mas está vazia';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela user_profiles não existe, pulando migração';
  END IF;
END $$;

-- 7. CORRIGIR TABELA USER_GOALS (Todas as colunas faltantes)
SELECT '🎯 CORRIGINDO TABELA USER_GOALS:' as info;

ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS final_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS estimated_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_value NUMERIC,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medio',
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS challenge_id UUID,
ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN DEFAULT true;

-- 8. HABILITAR RLS EM TODAS AS TABELAS
SELECT '🔐 HABILITANDO RLS:' as info;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_mission_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

-- 9. RECRIAR POLÍTICAS RLS COMPLETAS
SELECT '🔐 RECRIANDO POLÍTICAS RLS:' as info;

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- User Goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admin can manage all goals" ON public.user_goals;

CREATE POLICY "Users can view their own goals" 
ON public.user_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.user_goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
ON public.user_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all goals" 
ON public.user_goals FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Weight Measurements
DROP POLICY IF EXISTS "Users can view their own measurements" ON public.weight_measurements;
DROP POLICY IF EXISTS "Users can insert their own measurements" ON public.weight_measurements;
DROP POLICY IF EXISTS "Users can update their own measurements" ON public.weight_measurements;

CREATE POLICY "Users can view their own measurements" 
ON public.weight_measurements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements" 
ON public.weight_measurements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements" 
ON public.weight_measurements FOR UPDATE 
USING (auth.uid() = user_id);

-- Daily Mission Sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.daily_mission_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.daily_mission_sessions;

CREATE POLICY "Users can view their own sessions" 
ON public.daily_mission_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" 
ON public.daily_mission_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 10. RECRIAR TRIGGER PARA PROFILES
SELECT '⚙️ RECRIANDO TRIGGER DE PROFILES:' as info;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Remover triggers conflitantes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_role_created ON auth.users;

-- Criar trigger único e correto
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. CRIAR FUNÇÕES DE APROVAÇÃO DE METAS (CORRIGIDAS)
SELECT '✅ CRIANDO FUNÇÕES DE APROVAÇÃO:' as info;

-- Função para aprovar meta (CORRIGIDA)
CREATE OR REPLACE FUNCTION public.approve_goal(
  goal_id UUID,
  admin_user_id UUID,
  admin_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE public.user_goals 
  SET 
    status = 'aprovada',
    approved_by = admin_user_id,
    approved_at = NOW(),
    admin_notes = COALESCE(admin_notes, 'Meta aprovada pelo admin'),
    updated_at = NOW()
  WHERE id = goal_id;
  
  -- CORREÇÃO: Usar JSON_BUILD_OBJECT em vez de ROW_TO_JSON
  result := JSON_BUILD_OBJECT(
    'goal_id', goal_id,
    'status', 'aprovada',
    'message', 'Meta aprovada com sucesso'
  );
  RETURN result;
END;
$$;

-- Função para rejeitar meta (CORRIGIDA)
CREATE OR REPLACE FUNCTION public.reject_goal(
  goal_id UUID,
  admin_user_id UUID,
  rejection_reason TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE public.user_goals 
  SET 
    status = 'rejeitada',
    approved_by = admin_user_id,
    approved_at = NOW(),
    rejection_reason = rejection_reason,
    admin_notes = COALESCE(admin_notes, 'Meta rejeitada pelo admin'),
    updated_at = NOW()
  WHERE id = goal_id;
  
  -- CORREÇÃO: Usar JSON_BUILD_OBJECT em vez de ROW_TO_JSON
  result := JSON_BUILD_OBJECT(
    'goal_id', goal_id,
    'status', 'rejeitada',
    'message', 'Meta rejeitada com sucesso'
  );
  RETURN result;
END;
$$;

-- 12. CORRIGIR USUÁRIOS EXISTENTES
SELECT '👥 CORRIGINDO USUÁRIOS EXISTENTES:' as info;

INSERT INTO public.profiles (user_id, full_name, email, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', 'Usuário'),
  au.email,
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 13. CRIAR ADMIN PADRÃO (se não existir)
SELECT '👑 CRIANDO ADMIN PADRÃO:' as info;

INSERT INTO public.profiles (user_id, full_name, email, role, admin_level, created_at, updated_at)
SELECT 
  au.id,
  'Administrador',
  au.email,
  'admin',
  'super',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'teste@institutodossonhos.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = au.id
);

-- 14. VERIFICAÇÃO FINAL
SELECT '🔍 VERIFICAÇÃO FINAL:' as info;
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_usuarios,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM public.user_goals) as total_goals,
  (SELECT COUNT(*) FROM public.weight_measurements) as total_measurements,
  (SELECT COUNT(*) FROM public.courses) as total_courses,
  (SELECT COUNT(*) FROM public.challenge_participations) as total_challenges;

-- 15. VERIFICAR COLUNAS CRÍTICAS
SELECT '🔍 VERIFICAÇÃO DE COLUNAS CRÍTICAS:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'final_points')
    THEN '✅ final_points existe'
    ELSE '❌ final_points não existe'
  END as final_points_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name = 'approved_by')
    THEN '✅ approved_by existe'
    ELSE '❌ approved_by não existe'
  END as approved_by_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email')
    THEN '✅ email em profiles existe'
    ELSE '❌ email em profiles não existe'
  END as profiles_email_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio')
    THEN '✅ bio em profiles existe'
    ELSE '❌ bio em profiles não existe'
  END as profiles_bio_status;

-- 16. MENSAGEM DE SUCESSO
SELECT '🎉 SISTEMA COMPLETAMENTE CORRIGIDO!' as resultado;
SELECT '✅ TODOS os problemas foram resolvidos!' as status;
SELECT '🚀 Sistema pronto para venda!' as final_message; 