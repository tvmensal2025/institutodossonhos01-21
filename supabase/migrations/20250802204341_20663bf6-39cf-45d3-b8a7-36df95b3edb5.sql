-- Criar função para atribuir sessões a usuários (para admins)
CREATE OR REPLACE FUNCTION public.assign_session_to_users(
  session_id_param UUID,
  user_ids_param UUID[],
  admin_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id UUID;
  assignments_created INTEGER := 0;
  assignments_updated INTEGER := 0;
  total_users INTEGER;
  result JSON;
BEGIN
  -- Verificar se o usuário é admin
  IF admin_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = admin_user_id 
      AND (role = 'admin' OR admin_level = 'admin')
    ) THEN
      RETURN JSON_BUILD_OBJECT(
        'success', false,
        'error', 'Acesso negado. Apenas administradores podem atribuir sessões.'
      );
    END IF;
  END IF;

  -- Verificar se a sessão existe
  IF NOT EXISTS (SELECT 1 FROM sessions WHERE id = session_id_param) THEN
    RETURN JSON_BUILD_OBJECT(
      'success', false,
      'error', 'Sessão não encontrada.'
    );
  END IF;

  -- Contar total de usuários
  total_users := array_length(user_ids_param, 1);

  -- Iterar sobre cada usuário
  FOREACH user_id IN ARRAY user_ids_param
  LOOP
    -- Verificar se o usuário existe
    IF EXISTS (SELECT 1 FROM profiles WHERE user_id = user_id) THEN
      -- Tentar inserir nova atribuição
      INSERT INTO user_sessions (user_id, session_id, status, progress, assigned_at)
      VALUES (user_id, session_id_param, 'pending', 0, NOW())
      ON CONFLICT (user_id, session_id) 
      DO UPDATE SET
        status = 'pending',
        assigned_at = NOW(),
        progress = 0;
      
      -- Verificar se foi inserção ou atualização
      GET DIAGNOSTICS assignments_created = ROW_COUNT;
      IF assignments_created > 0 THEN
        assignments_created := assignments_created + 1;
      END IF;
    END IF;
  END LOOP;

  -- Retornar resultado
  result := JSON_BUILD_OBJECT(
    'success', true,
    'message', 'Sessões atribuídas com sucesso!',
    'session_id', session_id_param,
    'total_users', total_users,
    'assignments_created', assignments_created
  );

  RETURN result;
END;
$$;

-- Criar função para atribuir sessão a todos os usuários
CREATE OR REPLACE FUNCTION public.assign_session_to_all_users(
  session_id_param UUID,
  admin_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  assignments_created INTEGER := 0;
  total_users INTEGER;
  result JSON;
BEGIN
  -- Verificar se o usuário é admin
  IF admin_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = admin_user_id 
      AND (role = 'admin' OR admin_level = 'admin')
    ) THEN
      RETURN JSON_BUILD_OBJECT(
        'success', false,
        'error', 'Acesso negado. Apenas administradores podem atribuir sessões.'
      );
    END IF;
  END IF;

  -- Verificar se a sessão existe
  IF NOT EXISTS (SELECT 1 FROM sessions WHERE id = session_id_param) THEN
    RETURN JSON_BUILD_OBJECT(
      'success', false,
      'error', 'Sessão não encontrada.'
    );
  END IF;

  -- Contar total de usuários
  SELECT COUNT(*) INTO total_users FROM profiles;

  -- Atribuir sessão a todos os usuários
  INSERT INTO user_sessions (user_id, session_id, status, progress, assigned_at)
  SELECT 
    p.user_id,
    session_id_param,
    'pending',
    0,
    NOW()
  FROM profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM user_sessions us 
    WHERE us.user_id = p.user_id 
    AND us.session_id = session_id_param
  );

  GET DIAGNOSTICS assignments_created = ROW_COUNT;

  -- Retornar resultado
  result := JSON_BUILD_OBJECT(
    'success', true,
    'message', 'Sessão atribuída a todos os usuários!',
    'session_id', session_id_param,
    'total_users', total_users,
    'assignments_created', assignments_created
  );

  RETURN result;
END;
$$;

-- Permitir que admins façam operações em user_sessions
CREATE POLICY "Admins can manage all user sessions" 
ON user_sessions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR admin_level = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR admin_level = 'admin')
  )
);