-- 🔧 MIGRAÇÃO: Corrigir acesso admin do Rafael
-- Data: 2025-01-01
-- Descrição: Garantir que rafael.ids@icloud.com tenha acesso total à plataforma

-- 1. Garantir que o Rafael é admin no perfil
UPDATE profiles 
SET 
  role = 'admin',
  admin_level = 'super',
  is_admin = true,
  is_super_admin = true,
  updated_at = NOW()
WHERE email = 'rafael.ids@icloud.com';

-- 2. Garantir que o Rafael tem role de admin na tabela user_roles
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT 
  id,
  'admin'::app_role,
  NOW()
FROM auth.users 
WHERE email = 'rafael.ids@icloud.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Corrigir política RLS para ai_configurations - permitir acesso ao Rafael
DROP POLICY IF EXISTS "Only admins can manage AI configurations" ON public.ai_configurations;

CREATE POLICY "Rafael and admins can manage AI configurations" ON public.ai_configurations
    FOR ALL USING (
        -- Verificar se é admin na tabela user_roles
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
        OR
        -- Verificar se é o Rafael especificamente
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND email = 'rafael.ids@icloud.com'
        )
        OR
        -- Verificar se tem role admin no perfil
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Corrigir política RLS para ai_usage_logs
DROP POLICY IF EXISTS "Only admins can manage AI usage logs" ON public.ai_usage_logs;

CREATE POLICY "Rafael and admins can manage AI usage logs" ON public.ai_usage_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
        OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND email = 'rafael.ids@icloud.com'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
        OR
        auth.uid() = user_id  -- Usuários podem ver seus próprios logs
    );

-- 5. Criar função para verificar se é Rafael ou admin
CREATE OR REPLACE FUNCTION public.is_rafael_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
  OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'rafael.ids@icloud.com'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. Aplicar política para outras tabelas sensíveis que o Rafael precisa acessar
-- company_data
DROP POLICY IF EXISTS "Only admins can manage company data" ON public.company_data;
CREATE POLICY "Rafael and admins can manage company data" ON public.company_data
    FOR ALL USING (public.is_rafael_or_admin());

-- sessions
DROP POLICY IF EXISTS "Only admins can manage sessions" ON public.sessions;
CREATE POLICY "Rafael and admins can manage sessions" ON public.sessions
    FOR ALL USING (public.is_rafael_or_admin());

-- user_sessions
DROP POLICY IF EXISTS "Only admins can manage user sessions" ON public.user_sessions;
CREATE POLICY "Rafael and admins can manage user sessions" ON public.user_sessions
    FOR ALL USING (public.is_rafael_or_admin());

-- 7. Verificar se tudo foi aplicado corretamente
DO $$
BEGIN
  RAISE NOTICE '✅ Migração aplicada: Rafael agora tem acesso total à plataforma';
  RAISE NOTICE '📧 Email do admin: rafael.ids@icloud.com';
  RAISE NOTICE '🔑 Role: admin (super)';
  RAISE NOTICE '🛡️ Políticas RLS atualizadas para permitir acesso';
END $$;
