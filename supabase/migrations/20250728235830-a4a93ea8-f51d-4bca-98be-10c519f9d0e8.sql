-- Inserir módulos para os cursos existentes
INSERT INTO course_modules (course_id, title, description, order_index) VALUES
-- Módulos para "Fundamentos da Nutrição Saudável"
((SELECT id FROM courses WHERE title = 'Fundamentos da Nutrição Saudável'), 'Introdução à Nutrição', 'Conceitos básicos sobre alimentação saudável', 1),
((SELECT id FROM courses WHERE title = 'Fundamentos da Nutrição Saudável'), 'Macronutrientes', 'Entendendo carboidratos, proteínas e gorduras', 2),
((SELECT id FROM courses WHERE title = 'Fundamentos da Nutrição Saudável'), 'Planejamento de Refeições', 'Como organizar suas refeições diárias', 3),

-- Módulos para "Exercícios para Iniciantes"
((SELECT id FROM courses WHERE title = 'Exercícios para Iniciantes'), 'Preparação Física', 'Aquecimento e alongamento básico', 1),
((SELECT id FROM courses WHERE title = 'Exercícios para Iniciantes'), 'Exercícios Cardiovasculares', 'Atividades para melhorar o condicionamento', 2),
((SELECT id FROM courses WHERE title = 'Exercícios para Iniciantes'), 'Fortalecimento Muscular', 'Exercícios com peso corporal', 3),

-- Módulos para "Mindfulness e Emagrecimento"
((SELECT id FROM courses WHERE title = 'Mindfulness e Emagrecimento'), 'Introdução ao Mindfulness', 'O que é atenção plena na alimentação', 1),
((SELECT id FROM courses WHERE title = 'Mindfulness e Emagrecimento'), 'Técnicas de Meditação', 'Práticas para controle da ansiedade', 2),
((SELECT id FROM courses WHERE title = 'Mindfulness e Emagrecimento'), 'Alimentação Consciente', 'Como aplicar mindfulness nas refeições', 3),

-- Módulos para "Receitas Fit Deliciosas"
((SELECT id FROM courses WHERE title = 'Receitas Fit Deliciosas'), 'Café da Manhã Saudável', 'Receitas nutritivas para começar o dia', 1),
((SELECT id FROM courses WHERE title = 'Receitas Fit Deliciosas'), 'Almoços Balanceados', 'Refeições completas e saborosas', 2),
((SELECT id FROM courses WHERE title = 'Receitas Fit Deliciosas'), 'Lanches e Sobremesas Fit', 'Opções saudáveis para beliscar', 3);