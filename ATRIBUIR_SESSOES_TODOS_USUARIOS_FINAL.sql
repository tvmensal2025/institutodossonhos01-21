-- ATRIBUIR SESSÕES PARA TODOS OS USUÁRIOS EXISTENTES
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar usuários existentes
SELECT 
  'Usuários na auth.users:' as info,
  COUNT(*) as total
FROM auth.users;

-- 2. Verificar profiles existentes
SELECT 
  'Profiles existentes:' as info,
  COUNT(*) as total
FROM profiles;

-- 3. Verificar sessões ativas
SELECT 
  'Sessões ativas:' as info,
  COUNT(*) as total
FROM sessions 
WHERE is_active = true;

-- 4. Verificar atribuições existentes
SELECT 
  'Atribuições existentes:' as info,
  COUNT(*) as total
FROM user_sessions;

-- 5. Criar profiles para usuários que não têm (se necessário)
INSERT INTO profiles (user_id, full_name, email, avatar_url, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)) as full_name,
  au.email,
  au.raw_user_meta_data->>'avatar_url' as avatar_url,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- 6. Atribuir TODAS as sessões ativas a TODOS os usuários
INSERT INTO user_sessions (user_id, session_id, status, progress, assigned_at)
SELECT 
  p.user_id,
  s.id as session_id,
  'pending' as status,
  0 as progress,
  NOW() as assigned_at
FROM profiles p
CROSS JOIN sessions s
WHERE s.is_active = true
  AND NOT EXISTS (
    SELECT 1 
    FROM user_sessions us 
    WHERE us.user_id = p.user_id 
      AND us.session_id = s.id
  );

-- 7. Verificar resultado final
SELECT 
  'Atribuições criadas:' as info,
  COUNT(*) as total
FROM user_sessions;

-- 8. Mostrar detalhes das atribuições por usuário
SELECT 
  'Atribuições por usuário:' as info,
  p.full_name,
  p.email,
  COUNT(us.id) as total_sessoes
FROM profiles p
LEFT JOIN user_sessions us ON p.user_id = us.user_id
GROUP BY p.user_id, p.full_name, p.email
ORDER BY p.full_name;

-- 9. Mostrar algumas atribuições de exemplo
SELECT 
  'Exemplos de atribuições:' as info,
  p.full_name,
  s.title,
  us.status,
  us.assigned_at
FROM user_sessions us
JOIN profiles p ON us.user_id = p.user_id
JOIN sessions s ON us.session_id = s.id
ORDER BY us.assigned_at DESC
LIMIT 10;

-- 10. Verificar se há usuários sem sessões
SELECT 
  'Usuários sem sessões:' as info,
  p.full_name,
  p.email
FROM profiles p
LEFT JOIN user_sessions us ON p.user_id = us.user_id
WHERE us.id IS NULL
ORDER BY p.full_name; 