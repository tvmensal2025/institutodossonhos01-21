-- Script para atribuir sessões aos usuários existentes
-- Este script resolve o problema das sessões não aparecendo para os usuários

-- 1. Verificar usuários existentes
SELECT 
  'Usuários na tabela auth.users:' as info,
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
-- Primeiro, vamos ver quais usuários auth não têm profiles
SELECT 
  au.id as user_id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- 6. Inserir profiles para usuários que não têm
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

-- 7. Atribuir todas as sessões ativas a todos os usuários
INSERT INTO user_sessions (user_id, session_id, status, progress, assigned_at)
SELECT 
  p.user_id,
  s.id,
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

-- 8. Verificar resultado final
SELECT 
  'Atribuições criadas:' as info,
  COUNT(*) as total
FROM user_sessions;

-- 9. Mostrar algumas atribuições de exemplo
SELECT 
  p.full_name,
  s.title,
  us.status,
  us.assigned_at
FROM user_sessions us
JOIN profiles p ON us.user_id = p.user_id
JOIN sessions s ON us.session_id = s.id
LIMIT 10;

-- 10. Verificar se as políticas RLS estão funcionando
-- (Este comando deve ser executado como usuário autenticado)
-- SELECT COUNT(*) FROM user_sessions WHERE user_id = auth.uid(); 