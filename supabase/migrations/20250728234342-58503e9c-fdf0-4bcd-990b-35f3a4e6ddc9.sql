-- Inserir aulas restantes para completar toda a estrutura

-- Aulas para Treino de Mobilidade (5 conteúdos)
INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Alongamento Posterior de Coxa', 'Alongamento específico para posterior da coxa', id, 1
FROM public.course_modules WHERE title = 'Treino de Mobilidade' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Alongamento Interno de Coxa', 'Alongamento para região interna da coxa', id, 2
FROM public.course_modules WHERE title = 'Treino de Mobilidade' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Alongamento Glúteo e Quadril', 'Alongamento para glúteos e quadril', id, 3
FROM public.course_modules WHERE title = 'Treino de Mobilidade' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Alongamento de Quadril', 'Alongamento específico do quadril', id, 4
FROM public.course_modules WHERE title = 'Treino de Mobilidade' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'Alongamento Lateral de Quadril', 'Alongamento lateral do quadril', id, 5
FROM public.course_modules WHERE title = 'Treino de Mobilidade' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

-- Aulas para Bum Bum na Nuca (12 conteúdos)
INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'BOAS VINDAS', 'Boas-vindas ao treino de glúteos', id, 1
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'AQUECIMENTO', 'Aquecimento para treino de glúteos', id, 2
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'ELEVAÇÃO PELVICA COM BARRA', 'Exercício de elevação pélvica com barra', id, 3
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'EXERCÍCIO PONTE', 'Exercício ponte para glúteos', id, 4
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'EXTENSÃO DE QUADRIL', 'Extensão de quadril para glúteos', id, 5
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'AGACHAMENTO NA BARRA GUIADA', 'Agachamento na barra guiada', id, 6
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'AFUNDO NA BARRA GUIADA', 'Afundo na barra guiada', id, 7
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'ABDUÇÃO NO CROSS', 'Abdução no cross', id, 8
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'ABDUÇÃO NO CROSS 02', 'Variação da abdução no cross', id, 9
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'ABDUÇÃO', 'Exercício de abdução', id, 10
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'ABDUÇÃO NA BANDA', 'Abdução com banda elástica', id, 11
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'ABDUÇÃO EM 45°', 'Abdução em ângulo de 45 graus', id, 12
FROM public.course_modules WHERE title = 'Bum Bum na Nuca' AND course_id = (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos');

-- Aulas para 12 Chás (9 conteúdos)
INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'CHÁ DE ALECRIM', 'Benefícios e preparo do chá de alecrim', id, 1
FROM public.course_modules WHERE title = '12 Chás' AND course_id = (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'CHÁ DE CANELA', 'Benefícios e preparo do chá de canela', id, 2
FROM public.course_modules WHERE title = '12 Chás' AND course_id = (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'CHÁ DE GENGIBRE', 'Benefícios e preparo do chá de gengibre', id, 3
FROM public.course_modules WHERE title = '12 Chás' AND course_id = (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'CHÁ DE HIBISCO', 'Benefícios e preparo do chá de hibisco', id, 4
FROM public.course_modules WHERE title = '12 Chás' AND course_id = (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'CHÁ PRETO', 'Benefícios e preparo do chá preto', id, 5
FROM public.course_modules WHERE title = '12 Chás' AND course_id = (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'CHÁ VERDE', 'Benefícios e preparo do chá verde', id, 6
FROM public.course_modules WHERE title = '12 Chás' AND course_id = (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'CHÁ VERMELHO', 'Benefícios e preparo do chá vermelho', id, 7
FROM public.course_modules WHERE title = '12 Chás' AND course_id = (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'CHÁ DE ESPINHEIRA SANTA', 'Benefícios e preparo do chá de espinheira santa', id, 8
FROM public.course_modules WHERE title = '12 Chás' AND course_id = (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos');

INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'CHÁ DE ORA-PRO-NÓBIS', 'Benefícios e preparo do chá de ora-pro-nóbis', id, 9
FROM public.course_modules WHERE title = '12 Chás' AND course_id = (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos');

-- Aula para Jejum Intermitente (1 conteúdo)
INSERT INTO public.course_lessons (title, description, module_id, order_index)
SELECT 'JEJUM INTERMITENTE', 'Guia completo sobre jejum intermitente', id, 1
FROM public.course_modules WHERE title = 'Jejum Intermitente' AND course_id = (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos');