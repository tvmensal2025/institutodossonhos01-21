-- 🔧 CORREÇÃO PARA ACESSO ADMIN DO RAFAEL
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o usuário rafael.ids@icloud.com existe
SELECT 
  'Verificando usuário Rafael:' as info,
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'rafael.ids@icloud.com';

-- 2. Garantir que o perfil do Rafael existe e é admin
INSERT INTO profiles (
  user_id,
  full_name,
  email,
  role,
  admin_level,
  is_admin,
  is_super_admin,
  created_at,
  updated_at
)
SELECT 
  id,
  'Rafael Ferreira Dias',
  email,
  'admin',
  'super',
  true,
  true,
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'rafael.ids@icloud.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  admin_level = 'super',
  is_admin = true,
  is_super_admin = true,
  full_name = 'Rafael Ferreira Dias',
  updated_at = NOW();

-- 3. Garantir que o Rafael tem role de admin na tabela user_roles
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT 
  id,
  'admin'::app_role,
  NOW()
FROM auth.users 
WHERE email = 'rafael.ids@icloud.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Corrigir política RLS para ai_configurations - permitir acesso ao Rafael
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

-- 5. Criar política similar para outras tabelas importantes
-- ai_usage_logs
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

-- 6. Verificar se as políticas foram criadas
SELECT 
    'Políticas criadas:' as info,
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('ai_configurations', 'ai_usage_logs')
ORDER BY tablename, policyname;

-- 7. Verificar se o Rafael tem acesso
SELECT 
  'Rafael configurado:' as info,
  p.full_name,
  p.email,
  p.role,
  p.admin_level,
  p.is_admin,
  p.is_super_admin,
  ur.role as user_role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.email = 'rafael.ids@icloud.com';

-- 8. Testar acesso (deve retornar true se funcionar)
SELECT 
  'Teste de acesso:' as info,
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'rafael.ids@icloud.com')
    AND role = 'admin'::app_role
  ) as has_admin_role,
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'rafael.ids@icloud.com'
  ) as user_exists,
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = 'rafael.ids@icloud.com' AND role = 'admin'
  ) as has_admin_profile;
