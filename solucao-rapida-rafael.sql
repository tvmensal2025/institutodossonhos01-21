-- 🚀 SOLUÇÃO RÁPIDA PARA RAFAEL - ACESSO TOTAL
-- Execute este script no SQL Editor do Supabase

-- 1. Política RLS PERMISSIVA para ai_configurations (temporária)
DROP POLICY IF EXISTS "Only admins can manage AI configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Rafael and admins can manage AI configurations" ON public.ai_configurations;

-- Permitir acesso para usuários autenticados (incluindo Rafael)
CREATE POLICY "Authenticated users can manage AI configurations" ON public.ai_configurations
    FOR ALL USING (auth.role() = 'authenticated');

-- 2. Política RLS PERMISSIVA para ai_usage_logs
DROP POLICY IF EXISTS "Only admins can manage AI usage logs" ON public.ai_usage_logs;
DROP POLICY IF EXISTS "Rafael and admins can manage AI usage logs" ON public.ai_usage_logs;

CREATE POLICY "Authenticated users can manage AI usage logs" ON public.ai_usage_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- 3. Garantir que o Rafael é admin no perfil
UPDATE profiles 
SET 
  role = 'admin',
  admin_level = 'super',
  is_admin = true,
  is_super_admin = true,
  updated_at = NOW()
WHERE email = 'rafael.ids@icloud.com';

-- 4. Garantir que o Rafael tem role de admin
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT 
  id,
  'admin'::app_role,
  NOW()
FROM auth.users 
WHERE email = 'rafael.ids@icloud.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Verificar se funcionou
SELECT 
  '✅ Rafael configurado como admin:' as info,
  p.full_name,
  p.email,
  p.role,
  p.admin_level,
  ur.role as user_role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.email = 'rafael.ids@icloud.com';

-- 6. Verificar políticas criadas
SELECT 
  '✅ Políticas criadas:' as info,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('ai_configurations', 'ai_usage_logs')
ORDER BY tablename, policyname;
