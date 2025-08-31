-- ========================================
-- MIGRAÇÃO DE LIMPEZA E REORGANIZAÇÃO
-- ========================================

-- 1. REMOVER TRIGGERS DUPLICADOS
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP TRIGGER IF EXISTS update_user_name_assessments ON assessments;
DROP TRIGGER IF EXISTS update_user_name_health_diary ON health_diary;
DROP TRIGGER IF EXISTS trigger_update_streak ON daily_mission_sessions;

-- 2. ADICIONAR CONSTRAINTS QUE FALHARAM ANTERIORMENTE
DO $$
BEGIN
  -- Tentar adicionar constraint de pontos positivos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_positive_points' 
    AND table_name = 'daily_mission_sessions'
  ) THEN
    ALTER TABLE daily_mission_sessions 
    ADD CONSTRAINT check_positive_points CHECK (total_points >= 0);
  END IF;

  -- Tentar adicionar constraint de streak positivo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_positive_streak' 
    AND table_name = 'daily_mission_sessions'
  ) THEN
    ALTER TABLE daily_mission_sessions 
    ADD CONSTRAINT check_positive_streak CHECK (streak_days >= 0);
  END IF;
END $$;

-- 3. VERIFICAR SE TODAS AS TABELAS CRÍTICAS TÊM RLS HABILITADO
-- Verificar profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
    AND c.relname = 'profiles' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Verificar user_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
    AND c.relname = 'user_roles' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 4. CRIAR POLÍTICAS FALTANTES PARA user_roles SE NECESSÁRIO
DO $$
BEGIN
  -- Política para usuários verem seus próprios roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles" 
    ON user_roles FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;

  -- Política para admins gerenciarem roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Admins can manage all roles'
  ) THEN
    CREATE POLICY "Admins can manage all roles" 
    ON user_roles FOR ALL 
    USING (is_admin_user());
  END IF;
END $$;

-- 5. CRIAR POLÍTICAS PARA profiles SE NECESSÁRIO
DO $$
BEGIN
  -- Política para usuários verem seus próprios profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;

  -- Política para usuários atualizarem seus próprios profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;

  -- Política para criar profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can create their own profile'
  ) THEN
    CREATE POLICY "Users can create their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. CRIAR FUNÇÃO HELPER PARA DEBUG
CREATE OR REPLACE FUNCTION public.debug_user_setup(input_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  has_profile BOOLEAN,
  has_role BOOLEAN,
  role_name TEXT,
  profile_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    (p.id IS NOT NULL) as has_profile,
    (ur.user_id IS NOT NULL) as has_role,
    ur.role::TEXT,
    p.full_name
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.user_id
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  WHERE (input_user_id IS NULL OR au.id = input_user_id)
  ORDER BY au.created_at DESC;
END;
$$;

-- 7. CRIAR FUNÇÃO PARA TESTAR CRIAÇÃO DE MISSÕES
CREATE OR REPLACE FUNCTION public.test_daily_mission_system(test_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  mission_date DATE,
  session_exists BOOLEAN,
  is_completed BOOLEAN,
  total_points INTEGER,
  streak_days INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Se não especificado, usar o usuário atual
  target_user_id := COALESCE(test_user_id, auth.uid());
  
  -- Criar uma sessão de teste se não existir
  INSERT INTO daily_mission_sessions (user_id, date, is_completed, total_points, streak_days)
  VALUES (target_user_id, CURRENT_DATE, false, 0, 0)
  ON CONFLICT (user_id, date) DO NOTHING;
  
  -- Retornar dados da sessão
  RETURN QUERY
  SELECT 
    dms.user_id,
    dms.date,
    true as session_exists,
    dms.is_completed,
    dms.total_points,
    dms.streak_days
  FROM daily_mission_sessions dms
  WHERE dms.user_id = target_user_id
    AND dms.date = CURRENT_DATE;
END;
$$;

-- 8. CRIAR ÍNDICES ADICIONAIS PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_roles_role 
ON user_roles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_daily_responses_question_date 
ON daily_responses(question_id, date);

-- 9. FUNÇÃO PARA VALIDAR SISTEMA COMPLETO
CREATE OR REPLACE FUNCTION public.validate_system_health()
RETURNS TABLE (
  component TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  role_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Contar usuários
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO role_count FROM user_roles;
  
  -- Contar triggers críticos
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger pt
  JOIN pg_class pc ON pt.tgrelid = pc.oid
  JOIN pg_namespace pn ON pc.relnamespace = pn.oid
  WHERE pn.nspname = 'auth' 
    AND pc.relname = 'users'
    AND pt.tgname IN ('on_auth_user_created', 'on_auth_user_role_created');

  -- Retornar status
  RETURN QUERY VALUES 
    ('Users', 'OK', user_count::TEXT || ' users found'),
    ('Profiles', CASE WHEN profile_count = user_count THEN 'OK' ELSE 'ERROR' END, 
     profile_count::TEXT || '/' || user_count::TEXT || ' profiles'),
    ('Roles', CASE WHEN role_count = user_count THEN 'OK' ELSE 'ERROR' END,
     role_count::TEXT || '/' || user_count::TEXT || ' roles'),
    ('Triggers', CASE WHEN trigger_count >= 2 THEN 'OK' ELSE 'ERROR' END,
     trigger_count::TEXT || ' auth triggers active');
END;
$$;