-- CRIAR SISTEMA DE ROLES E ADMIN
-- Execute este script no SQL Editor do Supabase

-- 1. Criar enum para tipos de roles (se não existir)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Criar tabela user_roles (se não existir)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- 3. Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar função de segurança para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Criar função is_admin_user atualizada
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN public.has_role(auth.uid(), 'admin');
END;
$function$;

-- 6. Políticas para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Criar profile para o admin (se não existir)
INSERT INTO profiles (user_id, full_name, email, avatar_url, created_at, updated_at)
VALUES (
  '109a2a65-9e2e-4723-8543-fbbf68bdc085',
  'Administrador Principal',
  'teste@institutodossonhos.com',
  null,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = NOW();

-- 8. Criar role de admin para o usuário específico
INSERT INTO user_roles (user_id, role, assigned_at)
VALUES (
  '109a2a65-9e2e-4723-8543-fbbf68bdc085',
  'admin',
  NOW()
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 9. Atualizar políticas RLS para permitir acesso completo ao admin
-- Política para profiles - admin pode fazer tudo
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Política para user_sessions - admin pode fazer tudo
DROP POLICY IF EXISTS "Admins can manage all user sessions" ON user_sessions;
CREATE POLICY "Admins can manage all user sessions" ON user_sessions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 10. Atribuir sessões ao admin usando função segura
CREATE OR REPLACE FUNCTION assign_sessions_to_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atribuir todas as sessões ativas ao admin
  INSERT INTO user_sessions (user_id, session_id, status, progress, assigned_at)
  SELECT 
    '109a2a65-9e2e-4723-8543-fbbf68bdc085' as user_id,
    s.id as session_id,
    'pending' as status,
    0 as progress,
    NOW() as assigned_at
  FROM sessions s
  WHERE s.is_active = true
    AND NOT EXISTS (
      SELECT 1 
      FROM user_sessions us 
      WHERE us.user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085'
        AND us.session_id = s.id
    );
END;
$$;

-- 11. Executar a função para atribuir sessões
SELECT assign_sessions_to_admin();

-- 12. Verificar resultado
SELECT 
  'Sistema de roles criado:' as info,
  'user_roles table exists' as status;

SELECT 
  'Admin criado:' as info,
  p.full_name,
  p.email,
  ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

SELECT 
  'Sessões atribuídas ao admin:' as info,
  COUNT(*) as total
FROM user_sessions 
WHERE user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

SELECT 
  'Detalhes das sessões do admin:' as info,
  s.title,
  us.status,
  us.assigned_at
FROM user_sessions us
JOIN sessions s ON us.session_id = s.id
WHERE us.user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085'
ORDER BY us.assigned_at DESC; 