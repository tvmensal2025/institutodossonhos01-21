-- Verificar e corrigir a política existente
-- Remover a política atual e recriar com a condição correta
DROP POLICY "Admins can manage sessions" ON public.sessions;

-- Recriar a política com verificação mais robusta
CREATE POLICY "Admins can manage sessions"
ON public.sessions
FOR ALL
USING (
  COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  )
)
WITH CHECK (
  COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  )
);

-- Verificar se há uma política para visualização de sessões pelos usuários
CREATE POLICY IF NOT EXISTS "Users can view active sessions"
ON public.sessions
FOR SELECT
USING (is_active = true);