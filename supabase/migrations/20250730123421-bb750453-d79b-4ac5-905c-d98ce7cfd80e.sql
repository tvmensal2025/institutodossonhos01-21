-- RECUPERAR DADOS PERDIDOS DE MISSIONS E CHALLENGES

-- 10. RECUPERAR DADOS PERDIDOS DE MISSIONS
INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Hidratação Diária', 'Beba pelo menos 2 litros de água por dia', 'saude', 'facil', 10, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Hidratação Diária');

INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Exercício Matinal', 'Pratique 30 minutos de exercício pela manhã', 'exercicio', 'medio', 25, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Exercício Matinal');

INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Meditação', 'Medite por 10 minutos diariamente', 'bem-estar', 'facil', 15, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Meditação');

INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Alimentação Saudável', 'Consuma 5 porções de frutas e vegetais', 'alimentacao', 'medio', 20, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Alimentação Saudável');

INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Sono Reparador', 'Durma pelo menos 8 horas por noite', 'saude', 'medio', 20, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Sono Reparador');

INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Caminhada Diária', 'Caminhe pelo menos 10.000 passos', 'exercicio', 'facil', 15, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Caminhada Diária');

INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Leitura', 'Leia por 30 minutos diariamente', 'bem-estar', 'facil', 10, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Leitura');

-- 11. RECUPERAR DESAFIOS PERDIDOS
INSERT INTO challenges (title, description, category, challenge_type, created_by, target_value, is_active)
SELECT 
    '30 Dias de Hidratação', 
    'Beba 2L de água por 30 dias consecutivos', 
    'saude', 
    'daily_habit', 
    u.id, 
    30, 
    true
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = '30 Dias de Hidratação')
LIMIT 1;

INSERT INTO challenges (title, description, category, challenge_type, created_by, target_value, is_active)
SELECT 
    'Desafio Fitness', 
    'Complete 21 dias de exercício', 
    'exercicio', 
    'fitness', 
    u.id, 
    21, 
    true
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = 'Desafio Fitness')
LIMIT 1;

INSERT INTO challenges (title, description, category, challenge_type, created_by, target_value, is_active)
SELECT 
    'Alimentação Consciente', 
    'Registre suas refeições por 14 dias', 
    'alimentacao', 
    'nutrition', 
    u.id, 
    14, 
    true
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = 'Alimentação Consciente')
LIMIT 1;