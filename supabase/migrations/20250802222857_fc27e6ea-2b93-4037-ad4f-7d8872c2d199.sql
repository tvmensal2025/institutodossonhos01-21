-- CORREÇÃO COMPLETA DAS POLÍTICAS RLS DA TABELA USER_SESSIONS
-- Lista e remove TODAS as políticas existentes primeiro

-- 1. Dropar TODAS as políticas existentes da tabela user_sessions
DO $$
DECLARE
    pol_name text;
BEGIN
    FOR pol_name IN SELECT policyname FROM pg_policies WHERE tablename = 'user_sessions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_sessions', pol_name);
    END LOOP;
END $$;

-- 2. Criar novas políticas limpas e funcionais
CREATE POLICY "user_sessions_select_own"
  ON user_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_update_own"
  ON user_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_insert_own"
  ON user_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 3. Política para admins com verificação segura
CREATE POLICY "user_sessions_admin_full_access"
  ON user_sessions 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.admin_level = 'admin')
    )
  );

-- 4. Garantir que RLS está habilitado
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;