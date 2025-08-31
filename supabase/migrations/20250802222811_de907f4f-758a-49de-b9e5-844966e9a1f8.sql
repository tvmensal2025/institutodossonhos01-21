-- CORREÇÃO DAS POLÍTICAS RLS DA TABELA USER_SESSIONS
-- Remove todas as políticas existentes e cria novas políticas mais simples e eficazes

-- 1. Dropar todas as políticas existentes
DROP POLICY IF EXISTS "Users can create own participations" ON user_sessions;
DROP POLICY IF EXISTS "Users can create their own participations" ON user_sessions;
DROP POLICY IF EXISTS "Users can update own participations" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own participations" ON user_sessions;
DROP POLICY IF EXISTS "Users can view own participations" ON user_sessions;
DROP POLICY IF EXISTS "Users can view their own participations" ON user_sessions;
DROP POLICY IF EXISTS "Allow all operations on challenge_participations" ON user_sessions;

-- 2. Criar políticas novas e simplificadas para user_sessions
CREATE POLICY "Users can view their own sessions"
  ON user_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON user_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON user_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 3. Política para admins gerenciarem todas as sessões
DROP POLICY IF EXISTS "Admins can manage all user sessions" ON user_sessions;
CREATE POLICY "Admins can manage all user sessions"
  ON user_sessions 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.admin_level = 'admin')
    )
  );

-- 4. Verificar se RLS está habilitado
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;