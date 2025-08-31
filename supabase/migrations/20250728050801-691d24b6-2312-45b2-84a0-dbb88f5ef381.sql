-- Corrigir políticas RLS para a tabela sessions
-- Primeiro remover todas as políticas existentes
DROP POLICY IF EXISTS "Admins can manage sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can view active sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can view sessions" ON public.sessions;

-- Recriar as políticas corretamente
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

-- Política para usuários visualizarem sessões ativas
CREATE POLICY "Users can view active sessions"
ON public.sessions
FOR SELECT
USING (is_active = true);