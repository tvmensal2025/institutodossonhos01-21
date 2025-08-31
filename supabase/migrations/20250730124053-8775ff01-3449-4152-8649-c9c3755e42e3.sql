-- POPULAR DADOS DE EXEMPLO COMPLETOS PARA CURSOS, DESAFIOS E METAS

-- 1. CRIAR CURSOS COMPLETOS
INSERT INTO courses (title, description, category, difficulty_level, instructor_name, duration_minutes, is_premium, is_published, price, status, tags, learning_outcomes, total_lessons)
VALUES 
    ('Fundamentos da Nutrição Saudável', 'Aprenda os princípios básicos de uma alimentação equilibrada', 'Nutrição', 'Iniciante', 'Dr. Sofia Nutricionista', 240, false, true, 0, 'published', 
     ARRAY['nutrição', 'saúde', 'alimentação'], 
     ARRAY['Compreender macronutrientes', 'Planejar refeições balanceadas', 'Identificar alimentos nutritivos'], 
     8),
    ('Exercícios para Iniciantes', 'Programa completo de exercícios para quem está começando', 'Fitness', 'Iniciante', 'Prof. Carlos Fitness', 300, false, true, 0, 'published',
     ARRAY['exercício', 'fitness', 'iniciantes'],
     ARRAY['Desenvolver força básica', 'Melhorar flexibilidade', 'Criar rotina de exercícios'],
     10),
    ('Meditação e Mindfulness', 'Técnicas de meditação para reduzir stress e ansiedade', 'Bem-estar', 'Iniciante', 'Ana Zen', 180, false, true, 0, 'published',
     ARRAY['meditação', 'mindfulness', 'stress'],
     ARRAY['Praticar técnicas de respiração', 'Desenvolver consciência plena', 'Reduzir ansiedade'],
     6)
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Fundamentos da Nutrição Saudável');

-- 2. CRIAR MÓDULOS PARA OS CURSOS
INSERT INTO course_modules (course_id, title, description, order_index)
SELECT c.id, 'Introdução à Nutrição', 'Conceitos básicos de nutrição e alimentação saudável', 1
FROM courses c WHERE c.title = 'Fundamentos da Nutrição Saudável'
AND NOT EXISTS (SELECT 1 FROM course_modules WHERE title = 'Introdução à Nutrição');

INSERT INTO course_modules (course_id, title, description, order_index)
SELECT c.id, 'Macronutrientes', 'Proteínas, carboidratos e gorduras explicados', 2
FROM courses c WHERE c.title = 'Fundamentos da Nutrição Saudável'
AND NOT EXISTS (SELECT 1 FROM course_modules WHERE title = 'Macronutrientes');

INSERT INTO course_modules (course_id, title, description, order_index)
SELECT c.id, 'Exercícios Básicos', 'Movimentos fundamentais para iniciantes', 1
FROM courses c WHERE c.title = 'Exercícios para Iniciantes'
AND NOT EXISTS (SELECT 1 FROM course_modules WHERE title = 'Exercícios Básicos');

-- 3. CRIAR AULAS PARA OS MÓDULOS
INSERT INTO course_lessons (course_id, module_id, title, content, order_index, duration_minutes, is_free, lesson_type)
SELECT 
    c.id, 
    m.id,
    'O que é nutrição?',
    'Nesta aula você aprenderá os conceitos fundamentais da nutrição e como ela impacta sua saúde.',
    1, 
    30, 
    true,
    'video'
FROM courses c 
JOIN course_modules m ON c.id = m.course_id
WHERE c.title = 'Fundamentos da Nutrição Saudável' AND m.title = 'Introdução à Nutrição'
AND NOT EXISTS (SELECT 1 FROM course_lessons WHERE title = 'O que é nutrição?');

INSERT INTO course_lessons (course_id, module_id, title, content, order_index, duration_minutes, is_free, lesson_type)
SELECT 
    c.id, 
    m.id,
    'Tipos de proteínas',
    'Descubra os diferentes tipos de proteínas e suas funções no organismo.',
    1, 
    25, 
    false,
    'video'
FROM courses c 
JOIN course_modules m ON c.id = m.course_id
WHERE c.title = 'Fundamentos da Nutrição Saudável' AND m.title = 'Macronutrientes'
AND NOT EXISTS (SELECT 1 FROM course_lessons WHERE title = 'Tipos de proteínas');