-- ========================================
-- LIMPEZA COMPLETA DE DADOS SIMULADOS - CORRIGIDA
-- Remove TODOS os dados fictícios do sistema
-- ========================================

-- 1. REMOVER CHALLENGES SIMULADOS
DELETE FROM challenge_participations WHERE challenge_id IN (
  SELECT id FROM challenges WHERE 
  title LIKE '%Teste%' OR 
  title LIKE '%Demo%' OR 
  title LIKE '%Exemplo%' OR
  title LIKE '%hjhjhj%' OR
  title LIKE '%bbbb%' OR
  title LIKE '%bmw%' OR
  title LIKE '%zzzz%' OR
  title LIKE '%noinn%' OR
  title LIKE '%dsadsd%' OR
  title LIKE '%ddddd%' OR
  title = 'Exercício Diário' OR
  title = 'Hidratação Perfeita' OR
  title = 'Caminhada Matinal Coletiva' OR
  title = 'Desafio 10.000 Passos' OR
  title = 'JEJUM INTERMITENTE ***' OR
  title = 'Guerreiros do Treino' OR
  title = 'Hidratação em Grupo' OR
  title = 'Comida Colorida Challenge' OR
  title = 'Meditação Coletiva' OR
  title = 'Sono Reparador 8h' OR
  title = 'Mega Desafio da Saúde Total' OR
  title = 'Transformação 30 Dias' OR
  title = 'Apoio Mútuo - Comentários Positivos'
);

DELETE FROM challenge_daily_logs WHERE participation_id IN (
  SELECT cp.id FROM challenge_participations cp
  JOIN challenges c ON c.id = cp.challenge_id
  WHERE c.title LIKE '%Teste%' OR c.title LIKE '%Demo%' OR c.title LIKE '%hjhjhj%'
);

DELETE FROM challenges WHERE 
  title LIKE '%Teste%' OR 
  title LIKE '%Demo%' OR 
  title LIKE '%Exemplo%' OR
  title LIKE '%hjhjhj%' OR
  title LIKE '%bbbb%' OR
  title LIKE '%bmw%' OR
  title LIKE '%zzzz%' OR
  title LIKE '%noinn%' OR
  title LIKE '%dsadsd%' OR
  title LIKE '%ddddd%' OR
  title = 'Exercício Diário' OR
  title = 'Hidratação Perfeita' OR
  title = 'Caminhada Matinal Coletiva' OR
  title = 'Desafio 10.000 Passos' OR
  title = 'JEJUM INTERMITENTE ***' OR
  title = 'Guerreiros do Treino' OR
  title = 'Hidratação em Grupo' OR
  title = 'Comida Colorida Challenge' OR
  title = 'Meditação Coletiva' OR
  title = 'Sono Reparador 8h' OR
  title = 'Mega Desafio da Saúde Total' OR
  title = 'Transformação 30 Dias' OR
  title = 'Apoio Mútuo - Comentários Positivos';

-- 2. REMOVER COURSES SIMULADOS
DELETE FROM course_modules WHERE course_id IN (
  SELECT id FROM courses WHERE 
  title LIKE '%Teste%' OR
  title LIKE '%Demo%' OR
  title LIKE '%Fundamentos%' OR
  title LIKE '%Exercícios para Iniciantes%' OR
  title LIKE '%Mindfulness%' OR
  title LIKE '%Receitas Fit%' OR
  title LIKE '%dasdsad%' OR
  title LIKE '%dfsdfsdf%' OR
  title LIKE '%fdgfd%' OR
  title LIKE '%aS%' OR
  title LIKE '%Plataforma dos Sonhos%' OR
  title LIKE '%Exercícios dos Sonhos%' OR
  title LIKE '%Doces dos Sonhos%' OR
  title LIKE '%Salgado dos Sonhos%' OR
  title LIKE '%Jornada%' OR
  title LIKE '%Doces Kids%' OR
  title LIKE '%Zero Lactose%' OR
  title LIKE '%Diabéticos%'
);

DELETE FROM courses WHERE 
  title LIKE '%Teste%' OR
  title LIKE '%Demo%' OR
  title LIKE '%Fundamentos%' OR
  title LIKE '%Exercícios para Iniciantes%' OR
  title LIKE '%Mindfulness%' OR
  title LIKE '%Receitas Fit%' OR
  title LIKE '%dasdsad%' OR
  title LIKE '%dfsdfsdf%' OR
  title LIKE '%fdgfd%' OR
  title LIKE '%aS%' OR
  title LIKE '%Plataforma dos Sonhos%' OR
  title LIKE '%Exercícios dos Sonhos%' OR
  title LIKE '%Doces dos Sonhos%' OR
  title LIKE '%Salgado dos Sonhos%' OR
  title LIKE '%Jornada%' OR
  title LIKE '%Doces Kids%' OR
  title LIKE '%Zero Lactose%' OR
  title LIKE '%Diabéticos%';

-- 3. REMOVER SESSIONS SIMULADAS
DELETE FROM user_sessions WHERE session_id IN (
  SELECT id FROM sessions WHERE 
  title LIKE '%Teste%' OR
  title LIKE '%Demo%' OR
  title LIKE '%dii%' OR
  title LIKE '%hh%' OR
  title LIKE '%bmw%' OR
  title = 'Sessão de Teste' OR
  title LIKE '%Teste Sistema Completo%' OR
  title = '🎯 Roda das Competências - Avaliação Profissional' OR
  title = 'Mapeamento de Sintomas (147 Perguntas)' OR
  title = 'Roda das 8 Competências' OR
  title = '8 Pilares Financeiros' OR
  title = 'Avaliação das 12 Áreas da Vida'
);

DELETE FROM session_responses WHERE session_id IN (
  SELECT id FROM sessions WHERE 
  title LIKE '%Teste%' OR
  title LIKE '%Demo%' OR
  title LIKE '%dii%' OR
  title LIKE '%hh%' OR
  title LIKE '%bmw%' OR
  title = 'Sessão de Teste' OR
  title LIKE '%Teste Sistema Completo%' OR
  title = '🎯 Roda das Competências - Avaliação Profissional' OR
  title = 'Mapeamento de Sintomas (147 Perguntas)' OR
  title = 'Roda das 8 Competências' OR
  title = '8 Pilares Financeiros' OR
  title = 'Avaliação das 12 Áreas da Vida'
);

DELETE FROM sessions WHERE 
  title LIKE '%Teste%' OR
  title LIKE '%Demo%' OR
  title LIKE '%dii%' OR
  title LIKE '%hh%' OR
  title LIKE '%bmw%' OR
  title = 'Sessão de Teste' OR
  title LIKE '%Teste Sistema Completo%' OR
  title = '🎯 Roda das Competências - Avaliação Profissional' OR
  title = 'Mapeamento de Sintomas (147 Perguntas)' OR
  title = 'Roda das 8 Competências' OR
  title = '8 Pilares Financeiros' OR
  title = 'Avaliação das 12 Áreas da Vida';

-- 4. REMOVER USUÁRIOS SIMULADOS (manter apenas dados reais)
DELETE FROM weight_measurements WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR
  full_name LIKE '%dsfqw%' OR
  full_name LIKE '%dsfdfg%' OR
  full_name LIKE '%ra%' OR
  full_name LIKE '%15%' OR
  full_name LIKE '%asd%' OR
  full_name LIKE '%tvmensal%' OR
  full_name LIKE '%HH%' OR
  full_name LIKE '%RFDIGITAL%' OR
  full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR
  full_name = 'Maria Pereira Dos Santos' OR
  email LIKE '%@test.com%' OR
  email LIKE '%@example.com%'
);

DELETE FROM user_goals WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR
  full_name LIKE '%dsfqw%' OR
  full_name LIKE '%dsfdfg%' OR
  full_name LIKE '%ra%' OR
  full_name LIKE '%15%' OR
  full_name LIKE '%asd%' OR
  full_name LIKE '%tvmensal%' OR
  full_name LIKE '%HH%' OR
  full_name LIKE '%RFDIGITAL%' OR
  full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR
  full_name = 'Maria Pereira Dos Santos' OR
  email LIKE '%@test.com%' OR
  email LIKE '%@example.com%'
);

DELETE FROM daily_responses WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR
  full_name LIKE '%dsfqw%' OR
  full_name LIKE '%dsfdfg%' OR
  full_name LIKE '%ra%' OR
  full_name LIKE '%15%' OR
  full_name LIKE '%asd%' OR
  full_name LIKE '%tvmensal%' OR
  full_name LIKE '%HH%' OR
  full_name LIKE '%RFDIGITAL%' OR
  full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR
  full_name = 'Maria Pereira Dos Santos' OR
  email LIKE '%@test.com%' OR
  email LIKE '%@example.com%'
);

DELETE FROM nutrition_logs WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR
  full_name LIKE '%dsfqw%' OR
  full_name LIKE '%dsfdfg%' OR
  full_name LIKE '%ra%' OR
  full_name LIKE '%15%' OR
  full_name LIKE '%asd%' OR
  full_name LIKE '%tvmensal%' OR
  full_name LIKE '%HH%' OR
  full_name LIKE '%RFDIGITAL%' OR
  full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR
  full_name = 'Maria Pereira Dos Santos' OR
  email LIKE '%@test.com%' OR
  email LIKE '%@example.com%'
);

DELETE FROM challenge_participations WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR
  full_name LIKE '%dsfqw%' OR
  full_name LIKE '%dsfdfg%' OR
  full_name LIKE '%ra%' OR
  full_name LIKE '%15%' OR
  full_name LIKE '%asd%' OR
  full_name LIKE '%tvmensal%' OR
  full_name LIKE '%HH%' OR
  full_name LIKE '%RFDIGITAL%' OR
  full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR
  full_name = 'Maria Pereira Dos Santos' OR
  email LIKE '%@test.com%' OR
  email LIKE '%@example.com%'
);

DELETE FROM health_data WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR
  full_name LIKE '%dsfqw%' OR
  full_name LIKE '%dsfdfg%' OR
  full_name LIKE '%ra%' OR
  full_name LIKE '%15%' OR
  full_name LIKE '%asd%' OR
  full_name LIKE '%tvmensal%' OR
  full_name LIKE '%HH%' OR
  full_name LIKE '%RFDIGITAL%' OR
  full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR
  full_name = 'Maria Pereira Dos Santos' OR
  email LIKE '%@test.com%' OR
  email LIKE '%@example.com%'
);

DELETE FROM conversations WHERE user_id IN (
  SELECT user_id FROM profiles WHERE 
  full_name LIKE '%dsf%' OR
  full_name LIKE '%dsfqw%' OR
  full_name LIKE '%dsfdfg%' OR
  full_name LIKE '%ra%' OR
  full_name LIKE '%15%' OR
  full_name LIKE '%asd%' OR
  full_name LIKE '%tvmensal%' OR
  full_name LIKE '%HH%' OR
  full_name LIKE '%RFDIGITAL%' OR
  full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR
  full_name = 'Maria Pereira Dos Santos' OR
  email LIKE '%@test.com%' OR
  email LIKE '%@example.com%'
);

DELETE FROM profiles WHERE 
  full_name LIKE '%dsf%' OR
  full_name LIKE '%dsfqw%' OR
  full_name LIKE '%dsfdfg%' OR
  full_name LIKE '%ra%' OR
  full_name LIKE '%15%' OR
  full_name LIKE '%asd%' OR
  full_name LIKE '%tvmensal%' OR
  full_name LIKE '%HH%' OR
  full_name LIKE '%RFDIGITAL%' OR
  full_name LIKE '%dasdas%' OR
  full_name LIKE '%ccc%' OR
  full_name = 'Maria Pereira Dos Santos' OR
  email LIKE '%@test.com%' OR
  email LIKE '%@example.com%';

-- 5. CONFIGURAR EMPRESA PARA PRODUÇÃO
UPDATE company_data SET 
  company_name = 'Instituto dos Sonhos',
  company_description = 'Plataforma oficial do Instituto dos Sonhos para transformação de vidas através de saúde e bem-estar',
  admin_email = 'admin@institutodossonhos.com',
  subscription_plan = 'enterprise',
  max_users = 10000,
  updated_at = NOW();

-- 6. VERIFICAR RESULTADO FINAL
SELECT 'LIMPEZA CONCLUÍDA' as status;