-- Corrigir política RLS para smart_notifications permitir inserção por triggers
-- que são executados no contexto de admin

-- Remover política existente que pode estar bloqueando
DROP POLICY IF EXISTS "Users can insert own notifications" ON smart_notifications;

-- Criar nova política que permite inserção quando executado por funções de sistema
CREATE POLICY "Users can insert own notifications" ON smart_notifications 
FOR INSERT 
WITH CHECK (
  -- Permite se o user_id corresponde ao usuário logado
  auth.uid() = user_id 
  OR 
  -- Ou se está sendo executado por uma função de trigger (admin context)
  current_setting('role', true) = 'service_role'
  OR
  -- Ou se o usuário é admin
  is_admin_user()
);

-- Remover políticas duplicadas do user_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;

-- Recriar política unificada para admins
DROP POLICY IF EXISTS "Admins can manage all user sessions" ON user_sessions;

CREATE POLICY "Admins can manage all user sessions" ON user_sessions 
FOR ALL 
USING (is_admin_user());

-- Política separada para usuários normais
CREATE POLICY "Users can view and update their own sessions" ON user_sessions 
FOR ALL 
USING (auth.uid() = user_id);