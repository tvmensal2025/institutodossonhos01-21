-- Corrigir função para resolver ambiguidade de user_id
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
  user_id_var UUID;
  assignments_created INTEGER := 0;
  total_users INTEGER;
  result JSON;
BEGIN
  -- Verificar se o usuário é admin
  IF admin_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = admin_user_id 
      AND (p.role = 'admin' OR p.admin_level = 'admin')
    ) THEN
      RETURN JSON_BUILD_OBJECT(
        'success', false,
        'error', 'Acesso negado. Apenas administradores podem atribuir sessões.'
      );
    END IF;
  END IF;

  -- Verificar se a sessão existe
  IF NOT EXISTS (SELECT 1 FROM sessions s WHERE s.id = session_id_param) THEN
    RETURN JSON_BUILD_OBJECT(
      'success', false,
      'error', 'Sessão não encontrada.'
    );
  END IF;

  -- Contar total de usuários
  total_users := array_length(user_ids_param, 1);

  -- Iterar sobre cada usuário
  FOREACH user_id_var IN ARRAY user_ids_param
  LOOP
    -- Verificar se o usuário existe
    IF EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = user_id_var) THEN
      -- Tentar inserir nova atribuição
      INSERT INTO user_sessions (user_id, session_id, status, progress, assigned_at)
      VALUES (user_id_var, session_id_param, 'pending', 0, NOW())
      ON CONFLICT (user_id, session_id) 
      DO UPDATE SET
        status = 'pending',
        assigned_at = NOW(),
        progress = 0;
      
      assignments_created := assignments_created + 1;
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