-- Script para corrigir o problema das sessões não aparecendo para os usuários
-- Este script resolve os problemas de RLS e atribuição de sessões

-- 1. Desabilitar RLS temporariamente para inserir dados
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- 2. Verificar usuários existentes
SELECT 
  'Usuários na tabela auth.users:' as info,
  COUNT(*) as total
FROM auth.users;

-- 3. Verificar se há profiles
SELECT 
  'Profiles existentes:' as info,
  COUNT(*) as total
FROM profiles;

-- 4. Criar profile para o usuário que aparece no console
INSERT INTO profiles (user_id, full_name, email, avatar_url, created_at, updated_at)
VALUES (
  '109a2a65-9e2e-4723-8543-fbbf68bdc085',
  'Administrador Principal',
  'teste@institutodossonhos.com',
  null,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- 5. Verificar sessões ativas
SELECT 
  'Sessões ativas:' as info,
  COUNT(*) as total
FROM sessions 
WHERE is_active = true;

-- 6. Atribuir todas as sessões ativas ao usuário
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

-- 7. Verificar atribuições criadas
SELECT 
  'Atribuições criadas:' as info,
  COUNT(*) as total
FROM user_sessions 
WHERE user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

-- 8. Mostrar detalhes das atribuições
SELECT 
  s.title,
  us.status,
  us.assigned_at
FROM user_sessions us
JOIN sessions s ON us.session_id = s.id
WHERE us.user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085'
ORDER BY us.assigned_at DESC;

-- 9. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 10. Verificar se as políticas RLS estão corretas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_sessions')
ORDER BY tablename, policyname; 