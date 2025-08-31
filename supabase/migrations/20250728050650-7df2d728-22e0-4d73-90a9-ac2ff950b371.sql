-- Corrigir políticas RLS para a tabela sessions
-- Primeiro, remover políticas existentes se houverem
DROP POLICY IF EXISTS "Admin can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admin can manage sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can view sessions" ON public.sessions;

-- Criar políticas corretas para a tabela sessions
CREATE POLICY "Admins can manage sessions"
ON public.sessions
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Users can view active sessions"
ON public.sessions
FOR SELECT
USING (is_active = true);

-- Verificar se a função is_admin_user existe e está funcionando
-- Se não existir, criar uma versão simples
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se o usuário tem role admin no metadata
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  );
END;
$$;