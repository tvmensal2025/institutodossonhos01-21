-- ========================================
-- LIMPEZA COMPLETA DE DADOS SIMULADOS - SIMPLIFICADA
-- Remove TODOS os dados fictícios existentes
-- ========================================

-- 1. REMOVER CHALLENGES SIMULADOS E PARTICIPAÇÕES
DELETE FROM challenge_daily_logs WHERE participation_id IN (
  SELECT id FROM challenge_participations WHERE challenge_id IN (
    SELECT id FROM challenges WHERE 
    title LIKE '%hjhjhj%' OR title LIKE '%bmw%' OR title LIKE '%zzzz%' OR
    title LIKE '%dsadsd%' OR title LIKE '%ddddd%' OR title LIKE '%bbbb%'
  )
);

DELETE FROM challenge_participations WHERE challenge_id IN (
  SELECT id FROM challenges WHERE 
  title LIKE '%hjhjhj%' OR title LIKE '%bmw%' OR title LIKE '%zzzz%' OR
  title LIKE '%dsadsd%' OR title LIKE '%ddddd%' OR title LIKE '%bbbb%'
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

-- 3. REMOVER SESSIONS SIMULADAS
DELETE FROM user_sessions WHERE session_id IN (
  SELECT id FROM sessions WHERE 
  title LIKE '%dii%' OR title LIKE '%hh%' OR title LIKE '%bmw%'
);

DELETE FROM sessions WHERE 
  title LIKE '%dii%' OR title LIKE '%hh%' OR title LIKE '%bmw%';

-- 4. REMOVER USUÁRIOS COM NOMES SIMULADOS
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

DELETE FROM health_data WHERE user_id IN (
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

DELETE FROM profiles WHERE 
  full_name LIKE '%dsf%' OR full_name LIKE '%ra%' OR 
  full_name = '15' OR full_name LIKE '%asd%' OR 
  full_name LIKE '%tvmensal%' OR full_name = 'HH' OR
  full_name LIKE '%RFDIGITAL%' OR full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR full_name = 'a ';

-- 5. CONFIGURAR EMPRESA PARA PRODUÇÃO
UPDATE company_data SET 
  company_name = 'Instituto dos Sonhos',
  company_description = 'Plataforma oficial do Instituto dos Sonhos para transformação de vidas através de saúde e bem-estar',
  admin_email = 'admin@institutodossonhos.com',
  subscription_plan = 'enterprise',
  max_users = 10000,
  updated_at = NOW();