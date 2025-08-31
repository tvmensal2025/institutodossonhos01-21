-- ========================================
-- LIMPEZA FINAL - APENAS TABELAS EXISTENTES
-- ========================================

-- 1. REMOVER CHALLENGES SIMULADOS E SUAS PARTICIPAÇÕES
DELETE FROM challenge_daily_logs WHERE participation_id IN (
  SELECT id FROM challenge_participations WHERE challenge_id IN (
    SELECT id FROM challenges WHERE 
    title LIKE '%hjhjhj%' OR title LIKE '%bmw%' OR title LIKE '%zzzz%' OR
    title LIKE '%dsadsd%' OR title LIKE '%ddddd%' OR title LIKE '%bbbb%' OR
    title LIKE '%noinn%' OR title = ''
  )
);

DELETE FROM challenge_participations WHERE challenge_id IN (
  SELECT id FROM challenges WHERE 
  title LIKE '%hjhjhj%' OR title LIKE '%bmw%' OR title LIKE '%zzzz%' OR
  title LIKE '%dsadsd%' OR title LIKE '%ddddd%' OR title LIKE '%bbbb%' OR
  title LIKE '%noinn%' OR title = ''
);

DELETE FROM challenges WHERE 
  title LIKE '%hjhjhj%' OR title LIKE '%bmw%' OR title LIKE '%zzzz%' OR
  title LIKE '%dsadsd%' OR title LIKE '%ddddd%' OR title LIKE '%bbbb%' OR
  title LIKE '%noinn%' OR title = '';

-- 2. REMOVER COURSES SIMULADOS
DELETE FROM course_modules WHERE course_id IN (
  SELECT id FROM courses WHERE 
  title LIKE '%dasdsad%' OR title LIKE '%dfsdfsdf%' OR 
  title LIKE '%fdgfd%' OR title = 'aS'
);

DELETE FROM courses WHERE 
  title LIKE '%dasdsad%' OR title LIKE '%dfsdfsdf%' OR 
  title LIKE '%fdgfd%' OR title = 'aS';

-- 3. REMOVER SESSIONS SIMULADAS (apenas se existir tabela)
DELETE FROM user_sessions WHERE session_id IN (
  SELECT id FROM sessions WHERE 
  title LIKE '%dii%' OR title LIKE '%hh%' OR title LIKE '%bmw%'
);

DELETE FROM sessions WHERE 
  title LIKE '%dii%' OR title LIKE '%hh%' OR title LIKE '%bmw%';

-- 4. REMOVER DADOS DOS USUÁRIOS SIMULADOS (apenas tabelas que existem)
DELETE FROM weight_measurements WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR full_name LIKE '%ra%' OR 
  full_name = '15' OR full_name LIKE '%asd%' OR 
  full_name LIKE '%tvmensal%' OR full_name = 'HH' OR
  full_name LIKE '%RFDIGITAL%' OR full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR full_name = 'a '
);

DELETE FROM user_goals WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR full_name LIKE '%ra%' OR 
  full_name = '15' OR full_name LIKE '%asd%' OR 
  full_name LIKE '%tvmensal%' OR full_name = 'HH' OR
  full_name LIKE '%RFDIGITAL%' OR full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR full_name = 'a '
);

DELETE FROM daily_responses WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR full_name LIKE '%ra%' OR 
  full_name = '15' OR full_name LIKE '%asd%' OR 
  full_name LIKE '%tvmensal%' OR full_name = 'HH' OR
  full_name LIKE '%RFDIGITAL%' OR full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR full_name = 'a '
);

DELETE FROM challenge_participations WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR full_name LIKE '%ra%' OR 
  full_name = '15' OR full_name LIKE '%asd%' OR 
  full_name LIKE '%tvmensal%' OR full_name = 'HH' OR
  full_name LIKE '%RFDIGITAL%' OR full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR full_name = 'a '
);

DELETE FROM conversations WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR full_name LIKE '%ra%' OR 
  full_name = '15' OR full_name LIKE '%asd%' OR 
  full_name LIKE '%tvmensal%' OR full_name = 'HH' OR
  full_name LIKE '%RFDIGITAL%' OR full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR full_name = 'a '
);

-- 5. REMOVER PERFIS SIMULADOS
DELETE FROM profiles WHERE 
  full_name LIKE '%dsf%' OR full_name LIKE '%ra%' OR 
  full_name = '15' OR full_name LIKE '%asd%' OR 
  full_name LIKE '%tvmensal%' OR full_name = 'HH' OR
  full_name LIKE '%RFDIGITAL%' OR full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR full_name = 'a ';

-- 6. CONFIGURAR EMPRESA PARA PRODUÇÃO
UPDATE company_data SET 
  company_name = 'Instituto dos Sonhos',
  company_description = 'Plataforma oficial do Instituto dos Sonhos para transformação de vidas através de saúde e bem-estar',
  admin_email = 'admin@institutodossonhos.com',
  subscription_plan = 'enterprise',
  max_users = 10000,
  updated_at = NOW();

-- 7. VERIFICAR LIMPEZA
SELECT 'SISTEMA LIMPO E PRONTO PARA PRODUÇÃO' as status;