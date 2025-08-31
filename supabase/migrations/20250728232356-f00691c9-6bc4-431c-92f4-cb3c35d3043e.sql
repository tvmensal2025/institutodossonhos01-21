-- Inserir todas as aulas detalhadas do sistema

-- Aulas para Módulo 1 (Doces dos Sonhos)
INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Aula 1', 'Introdução aos doces dos sonhos', id, 1
FROM public.course_modules WHERE title = 'Módulo 1' AND course_id = (SELECT id FROM public.courses WHERE title = 'Doces dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Brigadeiro de Banana', 'Receita especial de brigadeiro com banana', id, 2
FROM public.course_modules WHERE title = 'Módulo 1' AND course_id = (SELECT id FROM public.courses WHERE title = 'Doces dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Cookies dos Sonhos', 'Cookies deliciosos e saudáveis', id, 3
FROM public.course_modules WHERE title = 'Módulo 1' AND course_id = (SELECT id FROM public.courses WHERE title = 'Doces dos Sonhos');

-- Aulas para Módulo 2 (Doces dos Sonhos)
INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Aula 1', 'Técnicas avançadas', id, 1
FROM public.course_modules WHERE title = 'Módulo 2' AND course_id = (SELECT id FROM public.courses WHERE title = 'Doces dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Bolo de Banana', 'Bolo úmido e saboroso', id, 2
FROM public.course_modules WHERE title = 'Módulo 2' AND course_id = (SELECT id FROM public.courses WHERE title = 'Doces dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Panqueca dos Sonhos', 'Panqueca nutritiva e gostosa', id, 3
FROM public.course_modules WHERE title = 'Módulo 2' AND course_id = (SELECT id FROM public.courses WHERE title = 'Doces dos Sonhos');

-- Aulas para Receitas para Diabéticos
INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Bolo de Baunilha', 'Bolo sem açúcar refinado', id, 1
FROM public.course_modules WHERE title = 'Receitas para Diabéticos' AND course_id = (SELECT id FROM public.courses WHERE title = 'Doces dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Queijadinha', 'Queijadinha diet deliciosa', id, 2
FROM public.course_modules WHERE title = 'Receitas para Diabéticos' AND course_id = (SELECT id FROM public.courses WHERE title = 'Doces dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Quindim', 'Quindim especial para diabéticos', id, 3
FROM public.course_modules WHERE title = 'Receitas para Diabéticos' AND course_id = (SELECT id FROM public.courses WHERE title = 'Doces dos Sonhos');

-- Aulas para Treino para Gestantes
INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Boas Vindas', 'Introdução ao treino para gestantes', id, 1
FROM public.course_modules WHERE title = 'Treino para Gestantes' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Aliviando a Tensão da Lombar', 'Exercícios para alívio das costas', id, 2
FROM public.course_modules WHERE title = 'Treino para Gestantes' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Agachamento', 'Técnica correta de agachamento', id, 3
FROM public.course_modules WHERE title = 'Treino para Gestantes' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Aliviando a Tensão da Lombar 2', 'Mais exercícios para lombar', id, 4
FROM public.course_modules WHERE title = 'Treino para Gestantes' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Membros Superiores 1', 'Fortalecimento dos braços', id, 5
FROM public.course_modules WHERE title = 'Treino para Gestantes' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Membros Superiores 2', 'Continuação do treino de braços', id, 6
FROM public.course_modules WHERE title = 'Treino para Gestantes' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Membros Inferiores', 'Treino das pernas', id, 7
FROM public.course_modules WHERE title = 'Treino para Gestantes' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Relaxamento da lombar', 'Técnicas de relaxamento', id, 8
FROM public.course_modules WHERE title = 'Treino para Gestantes' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

-- Aulas para Pernas Definidas (10 conteúdos)
INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Boas Vindas', 'Introdução ao treino de pernas', id, 1
FROM public.course_modules WHERE title = 'Pernas Definidas' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Quadricipes Cadeira', 'Exercício de quadríceps na cadeira', id, 2
FROM public.course_modules WHERE title = 'Pernas Definidas' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Quadriceps Leg-Press', 'Técnica do leg press', id, 3
FROM public.course_modules WHERE title = 'Pernas Definidas' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT '03 Quadricips maquina Rack', 'Quadríceps no rack', id, 4
FROM public.course_modules WHERE title = 'Pernas Definidas' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT '04Posterior de Coxa.mp4', 'Posterior da coxa', id, 5
FROM public.course_modules WHERE title = 'Pernas Definidas' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Passada', 'Exercício de passada', id, 6
FROM public.course_modules WHERE title = 'Pernas Definidas' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Posterior de coxa cadeira flexora', 'Flexora para posterior', id, 7
FROM public.course_modules WHERE title = 'Pernas Definidas' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'PANTURILHA EM PÉ', 'Exercício para panturrilha', id, 8
FROM public.course_modules WHERE title = 'Pernas Definidas' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'coxa interna máquina adução', 'Adução para coxa interna', id, 9
FROM public.course_modules WHERE title = 'Pernas Definidas' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'perna como um todo levantamento terra', 'Levantamento terra completo', id, 10
FROM public.course_modules WHERE title = 'Pernas Definidas' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');