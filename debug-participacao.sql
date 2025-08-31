-- ========================================
-- DEBUG PARTICIPAÇÃO EM DESAFIOS
-- Verificar estrutura e dados
-- ========================================

-- 1. VERIFICAR ESTRUTURA DA TABELA
SELECT '🔍 VERIFICANDO ESTRUTURA:' as info;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'challenge_participations'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS EXISTENTES
SELECT '📊 VERIFICANDO DADOS:' as info;

SELECT 
  cp.id,
  cp.challenge_id,
  cp.user_id,
  cp.progress,
  cp.is_completed,
  cp.started_at,
  c.title as challenge_title,
  p.full_name as user_name
FROM public.challenge_participations cp
LEFT JOIN public.challenges c ON cp.challenge_id = c.id
LEFT JOIN public.profiles p ON cp.user_id = p.user_id
ORDER BY cp.created_at DESC
LIMIT 10;

-- 3. VERIFICAR DESAFIOS DISPONÍVEIS
SELECT '🎯 DESAFIOS DISPONÍVEIS:' as info;

SELECT 
  id,
  title,
  is_active,
  is_group_challenge,
  daily_log_target,
  daily_log_unit,
  created_at
FROM public.challenges
WHERE is_active = true
ORDER BY created_at DESC;

-- 4. VERIFICAR USUÁRIOS
SELECT '👥 USUÁRIOS:' as info;

SELECT 
  user_id,
  full_name,
  email,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- 5. TESTE DE INSERÇÃO (SIMULADO)
SELECT '🧪 TESTE DE INSERÇÃO:' as info;

-- Simular inserção sem executar
SELECT 
  'Teste de inserção' as acao,
  'challenge_participations' as tabela,
  'user_id, challenge_id, progress, started_at' as colunas,
  'Dados de exemplo' as valores;

-- 6. VERIFICAR POLÍTICAS RLS
SELECT '🔒 POLÍTICAS RLS:' as info;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'challenge_participations'
AND schemaname = 'public';

-- 7. RESULTADO FINAL
SELECT '✅ DEBUG COMPLETO!' as status,
       'Estrutura verificada' as estrutura_status,
       'Dados verificados' as dados_status,
       'Políticas verificadas' as politicas_status; 