-- Seed completo de cursos e aulas para exibição imediata na plataforma Netflix-like
-- Seguro para rodar múltiplas vezes (usa WHERE NOT EXISTS)

-- 1) CURSOS PRINCIPAIS -------------------------------------------------------

-- Plataforma dos Sonhos (Desenvolvimento Pessoal)
INSERT INTO public.courses (id, title, description, category, difficulty_level, duration_minutes, price, is_premium, is_published, instructor_name, thumbnail_url)
SELECT gen_random_uuid(), 'Plataforma dos Sonhos', 'Desenvolvimento pessoal e bem-estar', 'desenvolvimento-pessoal', 'beginner', 0, 0, false, true, 'Instituto dos Sonhos', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = 'Plataforma dos Sonhos');

-- Exercícios dos Sonhos (Fitness)
INSERT INTO public.courses (id, title, description, category, difficulty_level, duration_minutes, price, is_premium, is_published, instructor_name, thumbnail_url)
SELECT gen_random_uuid(), 'Exercícios dos Sonhos', 'Programa de exercícios para casa', 'fitness', 'beginner', 0, 0, false, true, 'Instituto dos Sonhos', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = 'Exercícios dos Sonhos');

-- Doces dos Sonhos (Culinária)
INSERT INTO public.courses (id, title, description, category, difficulty_level, duration_minutes, price, is_premium, is_published, instructor_name, thumbnail_url)
SELECT gen_random_uuid(), 'Doces dos Sonhos', 'Receitas doces práticas e saudáveis', 'culinaria', 'beginner', 0, 0, false, true, 'Instituto dos Sonhos', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = 'Doces dos Sonhos');

-- Salgado dos Sonhos (Culinária)
INSERT INTO public.courses (id, title, description, category, difficulty_level, duration_minutes, price, is_premium, is_published, instructor_name, thumbnail_url)
SELECT gen_random_uuid(), 'Salgado dos Sonhos', 'Receitas salgadas práticas e saudáveis', 'culinaria', 'beginner', 0, 0, false, true, 'Instituto dos Sonhos', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = 'Salgado dos Sonhos');

-- Jornada 15 Dias
INSERT INTO public.courses (id, title, description, category, difficulty_level, duration_minutes, price, is_premium, is_published, instructor_name, thumbnail_url)
SELECT gen_random_uuid(), 'Jornada 15 Dias', 'Série de 15 dias com fundamentos para iniciar', 'desenvolvimento-pessoal', 'beginner', 0, 0, false, true, 'Instituto dos Sonhos', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = 'Jornada 15 Dias');

-- Jornada 7 Dias
INSERT INTO public.courses (id, title, description, category, difficulty_level, duration_minutes, price, is_premium, is_published, instructor_name, thumbnail_url)
SELECT gen_random_uuid(), 'Jornada 7 Dias', 'Série de 7 dias com fundamentos práticos', 'desenvolvimento-pessoal', 'beginner', 0, 0, false, true, 'Instituto dos Sonhos', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = 'Jornada 7 Dias');

-- Complementares (para vitrines específicas)
INSERT INTO public.courses (id, title, description, category, difficulty_level, duration_minutes, price, is_premium, is_published, instructor_name, thumbnail_url)
SELECT gen_random_uuid(), 'Doces Kids', 'Opções doces para crianças', 'culinaria', 'beginner', 0, 0, false, true, 'Instituto dos Sonhos', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = 'Doces Kids');

INSERT INTO public.courses (id, title, description, category, difficulty_level, duration_minutes, price, is_premium, is_published, instructor_name, thumbnail_url)
SELECT gen_random_uuid(), 'Zero Lactose', 'Receitas sem lactose', 'culinaria', 'beginner', 0, 0, false, true, 'Instituto dos Sonhos', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = 'Zero Lactose');

INSERT INTO public.courses (id, title, description, category, difficulty_level, duration_minutes, price, is_premium, is_published, instructor_name, thumbnail_url)
SELECT gen_random_uuid(), 'Diabéticos', 'Receitas adequadas para diabéticos', 'culinaria', 'beginner', 0, 0, false, true, 'Instituto dos Sonhos', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = 'Diabéticos');


-- 2) MÓDULOS ---------------------------------------------------------------

-- Plataforma dos Sonhos: 7 Chaves, 12 Chás, Pílulas do Bem, Jejum Intermitente, Dia a Dia
WITH plataforma AS (SELECT id FROM public.courses WHERE title = 'Plataforma dos Sonhos')
INSERT INTO public.course_modules (id, title, description, course_id, order_index)
SELECT gen_random_uuid(), m.title, m.description, (SELECT id FROM plataforma), m.idx
FROM (VALUES
  ('7 Chaves', 'Os 7 fundamentos para transformação', 1),
  ('12 Chás', 'Guia dos 12 chás', 2),
  ('Pílulas do Bem', 'Conteúdos temáticos curtos', 3),
  ('Jejum Intermitente', 'Princípios e prática segura', 4),
  ('Dia a Dia', 'Aplicação prática no cotidiano', 5)
) AS m(title, description, idx)
WHERE (SELECT COUNT(*) FROM public.course_modules cm WHERE cm.course_id = (SELECT id FROM plataforma) AND cm.title = m.title) = 0;

-- Exercícios dos Sonhos: módulos
WITH ex AS (SELECT id FROM public.courses WHERE title = 'Exercícios dos Sonhos')
INSERT INTO public.course_modules (id, title, description, course_id, order_index)
SELECT gen_random_uuid(), m.title, m.description, (SELECT id FROM ex), m.idx
FROM (VALUES
  ('Membros Superiores', 'Treinos para parte superior', 1),
  ('Treino para Gestantes', 'Protocolos seguros para gestantes', 2),
  ('Pernas Definidas', 'Sequências para pernas', 3),
  ('Treino de Mobilidade', 'Mobilidade e alongamentos', 4),
  ('Bum Bum na Nuca', 'Foco em glúteos', 5)
) AS m(title, description, idx)
WHERE (SELECT COUNT(*) FROM public.course_modules cm WHERE cm.course_id = (SELECT id FROM ex) AND cm.title = m.title) = 0;

-- Doces dos Sonhos: módulos
WITH doces AS (SELECT id FROM public.courses WHERE title = 'Doces dos Sonhos')
INSERT INTO public.course_modules (id, title, description, course_id, order_index)
SELECT gen_random_uuid(), m.title, m.description, (SELECT id FROM doces), m.idx
FROM (VALUES
  ('Módulo 1', 'Receitas base', 1),
  ('Módulo 2', 'Receitas complementares', 2),
  ('Receita para Diabéticos', 'Versões com controle de açúcar', 3)
) AS m(title, description, idx)
WHERE (SELECT COUNT(*) FROM public.course_modules cm WHERE cm.course_id = (SELECT id FROM doces) AND cm.title = m.title) = 0;

-- Salgado dos Sonhos: módulos
WITH salgado AS (SELECT id FROM public.courses WHERE title = 'Salgado dos Sonhos')
INSERT INTO public.course_modules (id, title, description, course_id, order_index)
SELECT gen_random_uuid(), m.title, m.description, (SELECT id FROM salgado), m.idx
FROM (VALUES
  ('Low Carb', 'Receitas com baixo carboidrato', 1),
  ('Zero Glúten', 'Receitas sem glúten', 2)
) AS m(title, description, idx)
WHERE (SELECT COUNT(*) FROM public.course_modules cm WHERE cm.course_id = (SELECT id FROM salgado) AND cm.title = m.title) = 0;

-- Jornadas: módulo único
WITH j15 AS (SELECT id FROM public.courses WHERE title = 'Jornada 15 Dias')
INSERT INTO public.course_modules (id, title, description, course_id, order_index)
SELECT gen_random_uuid(), 'Jornada 15 Dias', 'Série de 7 conteúdos introdutórios', (SELECT id FROM j15), 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.course_modules WHERE course_id = (SELECT id FROM j15) AND title = 'Jornada 15 Dias'
);

WITH j7 AS (SELECT id FROM public.courses WHERE title = 'Jornada 7 Dias')
INSERT INTO public.course_modules (id, title, description, course_id, order_index)
SELECT gen_random_uuid(), 'Jornada 7 Dias', 'Série de 7 conteúdos práticos', (SELECT id FROM j7), 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.course_modules WHERE course_id = (SELECT id FROM j7) AND title = 'Jornada 7 Dias'
);


-- 3) AULAS -----------------------------------------------------------------

-- Ajuda: função curta para criar aulas
-- Assegura ordem e evita duplicatas por título e módulo
-- OBS: usamos tabela canonical 'lessons'

-- Plataforma: 7 Chaves
WITH cm AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Plataforma dos Sonhos' AND cm.title = '7 Chaves'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM cm), l.title, l.descr, l.idx, true
FROM (VALUES
  ('CHAVE 01 (PACIÊNCIA)', 'A importância da paciência', 1),
  ('CHAVE 02 (IMAGINAÇÃO)', 'O poder da imaginação', 2),
  ('CHAVE 03 (ADAPTAÇÃO)', 'Como se adaptar às mudanças', 3),
  ('CHAVE 04 (HÁBITO)', 'Construindo hábitos positivos', 4),
  ('CHAVE 05 (I.E)', 'Inteligência Emocional', 5),
  ('CHAVE 06 (VITIMISMO)', 'Superando o vitimismo', 6),
  ('CHAVE 07 (LIBERDADE)', 'Liberdade interior', 7)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM cm) AND x.title = l.title) = 0;

-- Plataforma: 12 Chás (alguns exemplos)
WITH cm AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Plataforma dos Sonhos' AND cm.title = '12 Chás'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM cm), l.title, l.descr, l.idx, true
FROM (VALUES
  ('CHÁ DE ALECRIM', 'Benefícios e preparo', 1),
  ('CHÁ DE CANELA', 'Propriedades e uso', 2),
  ('CHÁ DE GENGIBRE', 'Vitalidade e digestão', 3),
  ('CHÁ DE HIBISCO', 'Controle e antioxidantes', 4),
  ('CHÁ PRETO', 'Clássico estimulante', 5),
  ('CHÁ VERDE', 'Termogênico natural', 6),
  ('CHÁ VERMELHO', 'Apoio metabólico', 7),
  ('CHÁ DE ESPINHEIRA SANTA', 'Saúde gástrica', 8),
  ('CHÁ DE ORA-PRO-NÓBIS', 'Rico em proteína', 9)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM cm) AND x.title = l.title) = 0;

-- Plataforma: Pílulas do Bem (exemplos)
WITH cm AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Plataforma dos Sonhos' AND cm.title = 'Pílulas do Bem'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM cm), l.title, l.descr, l.idx, true
FROM (VALUES
  ('PÍLULA 01 - FOCUS', 'Melhorando foco e concentração', 1)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM cm) AND x.title = l.title) = 0;

-- Plataforma: Jejum Intermitente
WITH cm AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Plataforma dos Sonhos' AND cm.title = 'Jejum Intermitente'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM cm), l.title, l.descr, l.idx, true
FROM (VALUES
  ('INTRODUÇÃO AO JEJUM', 'Conceitos básicos', 1)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM cm) AND x.title = l.title) = 0;

-- Plataforma: Dia a Dia (placeholder)
WITH cm AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Plataforma dos Sonhos' AND cm.title = 'Dia a Dia'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM cm), 'AQUECIMENTO', 'Primeiro passo', 1, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.lessons x WHERE x.module_id = (SELECT id FROM cm) AND x.title = 'AQUECIMENTO'
);

-- Exercícios: Módulos com exemplos de aulas (mínimo para aparecer)
-- Membros Superiores
WITH cm AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Exercícios dos Sonhos' AND cm.title = 'Membros Superiores'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM cm), l.title, l.descr, l.idx, true
FROM (VALUES
  ('Boas Vindas', 'Apresentação do módulo', 1),
  ('Membros Superiores 1', 'Treino base', 2)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM cm) AND x.title = l.title) = 0;

-- Treino para Gestantes
WITH cm AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Exercícios dos Sonhos' AND cm.title = 'Treino para Gestantes'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM cm), l.title, l.descr, l.idx, true
FROM (VALUES
  ('Boas Vindas', 'Introdução segura', 1),
  ('Aliviando a Tensão da Lombar', 'Rotina de alívio', 2)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM cm) AND x.title = l.title) = 0;

-- Pernas Definidas (um conjunto de exemplos)
WITH cm AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Exercícios dos Sonhos' AND cm.title = 'Pernas Definidas'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM cm), l.title, l.descr, l.idx, true
FROM (VALUES
  ('Boas Vindas', 'Introdução ao módulo', 1),
  ('Agachamento', 'Execução segura', 2)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM cm) AND x.title = l.title) = 0;

-- Treino de Mobilidade
WITH cm AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Exercícios dos Sonhos' AND cm.title = 'Treino de Mobilidade'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM cm), l.title, l.descr, l.idx, true
FROM (VALUES
  ('Alongamento Posterior', 'Posterior de coxa', 1)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM cm) AND x.title = l.title) = 0;

-- Bum Bum na Nuca
WITH cm AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Exercícios dos Sonhos' AND cm.title = 'Bum Bum na Nuca'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM cm), 'Série Inicial', 'Introdução ao módulo', 1, true
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM cm)) = 0;

-- Doces dos Sonhos: aulas
WITH cm AS (
  SELECT cm.id, cm.title FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Doces dos Sonhos'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(),
       (SELECT id FROM cm WHERE title = 'Módulo 1'),
       l.title, l.descr, l.idx, true
FROM (VALUES
  ('BRIGADEIRO DE BANANA', 'Versão saudável', 1),
  ('COOKIES DOS SONHOS', 'Crocrância perfeita', 2)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x JOIN cm ON cm.id = x.module_id WHERE cm.title = 'Módulo 1' AND x.title = l.title) = 0;

WITH cm AS (
  SELECT cm.id, cm.title FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Doces dos Sonhos'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(),
       (SELECT id FROM cm WHERE title = 'Módulo 2'),
       l.title, l.descr, l.idx, true
FROM (VALUES
  ('BOLO DE BANANA', 'Fofinho e rápido', 1),
  ('PANQUECA DOS SONHOS', 'Simples e deliciosa', 2)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x JOIN cm ON cm.id = x.module_id WHERE cm.title = 'Módulo 2' AND x.title = l.title) = 0;

WITH cm AS (
  SELECT cm.id, cm.title FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Doces dos Sonhos'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(),
       (SELECT id FROM cm WHERE title = 'Receita para Diabéticos'),
       l.title, l.descr, l.idx, true
FROM (VALUES
  ('Bolo de Baunilha', 'Sem açúcar refinado', 1),
  ('Queijadinha', 'Versão controlada', 2),
  ('Quindim', 'Textura perfeita', 3)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x JOIN cm ON cm.id = x.module_id WHERE cm.title = 'Receita para Diabéticos' AND x.title = l.title) = 0;

-- Jornadas (15 dias e 7 dias)
WITH j15 AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Jornada 15 Dias' AND cm.title = 'Jornada 15 Dias'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM j15), l.title, l.descr, l.idx, true
FROM (VALUES
  ('Boas Vindas', 'Apresentação', 1),
  ('Quem Sou Eu', 'Autoconhecimento', 2),
  ('Mapa', 'Direcionamento', 3),
  ('Definindo Objetivo', 'Clareza de metas', 4),
  ('Afirmação Positiva', 'Prática guiada', 5),
  ('Celebrar', 'Reforço positivo', 6),
  ('Desinflame', 'Hábitos anti-inflamatórios', 7)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM j15) AND x.title = l.title) = 0;

WITH j7 AS (
  SELECT cm.id FROM public.course_modules cm
  JOIN public.courses c ON c.id = cm.course_id
  WHERE c.title = 'Jornada 7 Dias' AND cm.title = 'Jornada 7 Dias'
)
INSERT INTO public.lessons (id, module_id, title, description, order_index, is_free)
SELECT gen_random_uuid(), (SELECT id FROM j7), l.title, l.descr, l.idx, true
FROM (VALUES
  ('Sejam Bem Vindos', 'Apresentação', 1),
  ('Qual seu Motivo?', 'Propósito', 2),
  ('Dicas do Dia a Dia', 'Aplicação prática', 3),
  ('Princípios básicos', 'Fundamentos', 4),
  ('Consumo de água.', 'Hidratação', 5),
  ('Atividade Física', 'Movimente-se', 6),
  ('Temperos dos Sonhos', 'Sabor e saúde', 7)
) AS l(title, descr, idx)
WHERE (SELECT COUNT(*) FROM public.lessons x WHERE x.module_id = (SELECT id FROM j7) AND x.title = l.title) = 0;


