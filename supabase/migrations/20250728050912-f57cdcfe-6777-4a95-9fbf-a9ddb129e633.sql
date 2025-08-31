-- Atualizar apenas as políticas da tabela sessions usando o sistema seguro
DROP POLICY IF EXISTS "Admins can manage sessions" ON public.sessions;

-- Recriar política usando a função is_admin_user segura
CREATE POLICY "Admins can manage sessions"
ON public.sessions
FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Adicionar role admin para o usuário atual se ele não tiver
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@institutodossonhos.com'
ON CONFLICT (user_id, role) DO NOTHING;