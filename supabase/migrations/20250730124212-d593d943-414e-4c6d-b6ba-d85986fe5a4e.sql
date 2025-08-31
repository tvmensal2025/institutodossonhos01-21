-- POPULAR DADOS DE EXEMPLO COMPLETOS PARA CURSOS, DESAFIOS E METAS - CORRIGIDO

-- 1. CRIAR CURSOS COMPLETOS
INSERT INTO courses (title, description, category, difficulty_level, instructor_name, duration_minutes, is_premium, is_published, price, status, tags, learning_outcomes, total_lessons)
SELECT 
    'Fundamentos da Nutrição Saudável', 
    'Aprenda os princípios básicos de uma alimentação equilibrada', 
    'Nutrição', 
    'Iniciante', 
    'Dr. Sofia Nutricionista', 
    240, 
    false, 
    true, 
    0, 
    'published', 
    ARRAY['nutrição', 'saúde', 'alimentação'], 
    ARRAY['Compreender macronutrientes', 'Planejar refeições balanceadas', 'Identificar alimentos nutritivos'], 
    8
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Fundamentos da Nutrição Saudável');

INSERT INTO courses (title, description, category, difficulty_level, instructor_name, duration_minutes, is_premium, is_published, price, status, tags, learning_outcomes, total_lessons)
SELECT 
    'Exercícios para Iniciantes', 
    'Programa completo de exercícios para quem está começando', 
    'Fitness', 
    'Iniciante', 
    'Prof. Carlos Fitness', 
    300, 
    false, 
    true, 
    0, 
    'published',
    ARRAY['exercício', 'fitness', 'iniciantes'],
    ARRAY['Desenvolver força básica', 'Melhorar flexibilidade', 'Criar rotina de exercícios'],
    10
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Exercícios para Iniciantes');

-- 2. CRIAR DESAFIOS COMPLETOS
INSERT INTO challenges (title, description, category, challenge_type, created_by, target_value, duration_days, points_reward, badge_icon, badge_name, instructions, is_active, start_date, end_date)
SELECT 
    '30 Dias de Hidratação',
    'Beba pelo menos 2 litros de água todos os dias por 30 dias consecutivos',
    'Saúde',
    'daily_habit',
    u.id,
    30,
    30,
    300,
    '💧',
    'Mestre da Hidratação',
    'Registre diariamente quanto de água você bebeu. Meta: 2L por dia.',
    true,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = '30 Dias de Hidratação')
LIMIT 1;

INSERT INTO challenges (title, description, category, challenge_type, created_by, target_value, duration_days, points_reward, badge_icon, badge_name, instructions, is_active, start_date, end_date)
SELECT 
    'Desafio 21 Dias Fitness',
    'Complete exercícios físicos por 21 dias consecutivos para criar o hábito',
    'Fitness',
    'fitness',
    u.id,
    21,
    21,
    420,
    '💪',
    'Guerreiro Fitness',
    'Pratique pelo menos 30 minutos de exercício por dia.',
    true,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '21 days'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = 'Desafio 21 Dias Fitness')
LIMIT 1;

INSERT INTO challenges (title, description, category, challenge_type, created_by, target_value, duration_days, points_reward, badge_icon, badge_name, instructions, is_active, start_date, end_date)
SELECT 
    'Meditação Diária',
    'Medite por pelo menos 10 minutos todos os dias por 2 semanas',
    'Bem-estar',
    'mindfulness',
    u.id,
    14,
    14,
    210,
    '🧘',
    'Mente Zen',
    'Pratique meditação ou mindfulness por 10 minutos diariamente.',
    true,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '14 days'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = 'Meditação Diária')
LIMIT 1;