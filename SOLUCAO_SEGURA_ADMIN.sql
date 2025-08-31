-- SOLUÇÃO SEGURA PARA ADMIN - SEM DESABILITAR RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o usuário existe na auth.users
SELECT 
  'Verificando usuário:' as info,
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'teste@institutodossonhos.com';

-- 2. Criar role de admin para o usuário específico
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT 
  '109a2a65-9e2e-4723-8543-fbbf68bdc085',
  'admin',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085' 
    AND role = 'admin'
);

-- 3. Criar profile para o admin (se não existir)
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

-- 4. Atualizar políticas RLS para permitir acesso completo ao admin
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

-- 5. Atribuir sessões ao admin usando função segura
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

-- 6. Executar a função para atribuir sessões
SELECT assign_sessions_to_admin();

-- 7. Verificar resultado
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

-- 8. Verificar políticas RLS criadas
SELECT 
  'Políticas RLS para admin:' as info,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_sessions')
  AND policyname LIKE '%admin%'
ORDER BY tablename, policyname; 