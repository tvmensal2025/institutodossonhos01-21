-- SOLUÇÃO FINAL PARA O PROBLEMA DAS SESSÕES NÃO APARECENDO PARA OS USUÁRIOS
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- 2. Criar profile para o usuário que aparece no console
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

-- 3. Atribuir todas as sessões ativas ao usuário
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

-- 4. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Verificar resultado
SELECT 
  'Profile criado:' as info,
  p.full_name,
  p.email
FROM profiles p
WHERE p.user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

SELECT 
  'Sessões atribuídas:' as info,
  COUNT(*) as total
FROM user_sessions 
WHERE user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085';

SELECT 
  'Detalhes das sessões:' as info,
  s.title,
  us.status,
  us.assigned_at
FROM user_sessions us
JOIN sessions s ON us.session_id = s.id
WHERE us.user_id = '109a2a65-9e2e-4723-8543-fbbf68bdc085'
ORDER BY us.assigned_at DESC; 