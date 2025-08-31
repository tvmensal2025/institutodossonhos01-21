-- Remover todos os dados fictícios/simulados do banco de dados

-- 1. Limpar tabelas de dados de usuários ficticios
DELETE FROM challenge_participations WHERE user_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.com' 
  OR email LIKE '%@example.com' 
  OR email LIKE '%teste%'
  OR full_name LIKE '%Test%'
  OR full_name LIKE '%Teste%'
  OR full_name LIKE '%Example%'
);

DELETE FROM daily_responses WHERE user_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.com' 
  OR email LIKE '%@example.com' 
  OR email LIKE '%teste%'
  OR full_name LIKE '%Test%'
  OR full_name LIKE '%Teste%'
  OR full_name LIKE '%Example%'
);

DELETE FROM weight_measurements WHERE user_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.com' 
  OR email LIKE '%@example.com' 
  OR email LIKE '%teste%'
  OR full_name LIKE '%Test%'
  OR full_name LIKE '%Teste%'
  OR full_name LIKE '%Example%'
);

DELETE FROM user_goals WHERE user_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.com' 
  OR email LIKE '%@example.com' 
  OR email LIKE '%teste%'
  OR full_name LIKE '%Test%'
  OR full_name LIKE '%Teste%'
  OR full_name LIKE '%Example%'
);

DELETE FROM daily_advanced_tracking WHERE user_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.com' 
  OR email LIKE '%@example.com' 
  OR email LIKE '%teste%'
  OR full_name LIKE '%Test%'
  OR full_name LIKE '%Teste%'
  OR full_name LIKE '%Example%'
);

DELETE FROM conversations WHERE user_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.com' 
  OR email LIKE '%@example.com' 
  OR email LIKE '%teste%'
  OR full_name LIKE '%Test%'
  OR full_name LIKE '%Teste%'
  OR full_name LIKE '%Example%'
);

DELETE FROM google_fit_data WHERE user_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.com' 
  OR email LIKE '%@example.com' 
  OR email LIKE '%teste%'
  OR full_name LIKE '%Test%'
  OR full_name LIKE '%Teste%'
  OR full_name LIKE '%Example%'
);

-- 2. Remover perfis de teste por último (devido às foreign keys)
DELETE FROM profiles WHERE email LIKE '%@test.com' 
  OR email LIKE '%@example.com' 
  OR email LIKE '%teste%'
  OR full_name LIKE '%Test%'
  OR full_name LIKE '%Teste%'
  OR full_name LIKE '%Example%';

-- 3. Limpar dados simulados/demo específicos
DELETE FROM challenges WHERE title LIKE '%Demo%' 
  OR title LIKE '%Teste%'
  OR title LIKE '%Example%'
  OR description LIKE '%fictício%'
  OR description LIKE '%simulado%';

-- 4. Remover cursos de demonstração
DELETE FROM lessons WHERE title LIKE '%Demo%' 
  OR title LIKE '%Teste%'
  OR title LIKE '%Example%'
  OR description LIKE '%fictício%'
  OR description LIKE '%simulado%';

DELETE FROM course_modules WHERE title LIKE '%Demo%' 
  OR title LIKE '%Teste%'
  OR title LIKE '%Example%'
  OR description LIKE '%fictício%'
  OR description LIKE '%simulado%';

DELETE FROM courses WHERE title LIKE '%Demo%' 
  OR title LIKE '%Teste%'
  OR title LIKE '%Example%'
  OR description LIKE '%fictício%'
  OR description LIKE '%simulado%';

-- 5. Atualizar dados da empresa para produção
UPDATE company_data SET 
  company_name = 'Instituto dos Sonhos',
  company_description = 'Plataforma oficial de saúde e bem-estar do Instituto dos Sonhos',
  admin_email = 'admin@institutodossonhos.com',
  subscription_plan = 'enterprise',
  max_users = 10000
WHERE id IS NOT NULL;

-- 6. Verificar se restaram dados de teste
SELECT 'Profiles restantes' as tabela, COUNT(*) as total FROM profiles;
SELECT 'Challenges restantes' as tabela, COUNT(*) as total FROM challenges;
SELECT 'Courses restantes' as tabela, COUNT(*) as total FROM courses;
SELECT 'Company data' as tabela, company_name, admin_email FROM company_data;