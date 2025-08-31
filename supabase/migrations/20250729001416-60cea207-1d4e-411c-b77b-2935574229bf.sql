-- Inserir cursos principais
INSERT INTO courses (id, title, description, category, thumbnail_url, instructor_name, difficulty_level, is_published, is_premium) VALUES
-- DOCES DOS SONHOS
(gen_random_uuid(), 'Doces dos Sonhos', 'Aprenda a fazer deliciosos doces saudáveis e nutritivos', 'culinaria', 'https://institutodossonhos.com.br/wp-content/uploads/2025/07/imgi_26_img_0_CAPA-DOCE-KIDS_4fcc75f451c1428e9ca361e3cad0799a.jpg', 'Instituto dos Sonhos', 'beginner', true, false),

-- EXERCÍCIOS DOS SONHOS
(gen_random_uuid(), 'Exercícios dos Sonhos', 'Programa completo de exercícios para uma vida mais saudável', 'fitness', 'https://institutodossonhos.com.br/wp-content/uploads/2025/07/imgi_22_img_0_Capa-Treino-superior_05064ba91b1b41508b972fddf5fcbc20.png', 'Instituto dos Sonhos', 'intermediate', true, false),

-- PLATAFORMA DOS SONHOS
(gen_random_uuid(), 'Plataforma dos Sonhos', 'Desenvolvimento pessoal e bem-estar através de práticas transformadoras', 'desenvolvimento-pessoal', 'https://institutodossonhos.com.br/wp-content/uploads/2025/07/imgi_17_img_0_7-CHAVES-CAPA_247f4babde0e42c996d2506c79facbf6.jpg', 'Instituto dos Sonhos', 'advanced', true, true);

-- Inserir módulos para DOCES DOS SONHOS
WITH doces_course AS (SELECT id FROM courses WHERE title = 'Doces dos Sonhos')
INSERT INTO course_modules (id, course_id, title, description, order_index) 
SELECT 
  gen_random_uuid(),
  doces_course.id,
  module_title,
  module_desc,
  module_order
FROM doces_course,
(VALUES 
  ('Módulo 1', 'Primeiras receitas básicas', 1),
  ('Módulo 2', 'Receitas intermediárias', 2),
  ('Receita para Diabéticos', 'Receitas especiais para diabéticos', 3)
) AS modules(module_title, module_desc, module_order);

-- Inserir módulos para EXERCÍCIOS DOS SONHOS  
WITH exercicios_course AS (SELECT id FROM courses WHERE title = 'Exercícios dos Sonhos')
INSERT INTO course_modules (id, course_id, title, description, order_index)
SELECT 
  gen_random_uuid(),
  exercicios_course.id,
  module_title,
  module_desc,
  module_order
FROM exercicios_course,
(VALUES 
  ('Membros Superiores', 'Exercícios para braços e ombros', 1),
  ('Treino para Gestantes', 'Exercícios seguros durante a gravidez', 2),
  ('Pernas Definidas', 'Fortalecimento e definição das pernas', 3),
  ('Treino de Mobilidade', 'Exercícios de alongamento e flexibilidade', 4),
  ('Bum Bum na Nuca', 'Fortalecimento dos glúteos', 5)
) AS modules(module_title, module_desc, module_order);

-- Inserir módulos para PLATAFORMA DOS SONHOS
WITH plataforma_course AS (SELECT id FROM courses WHERE title = 'Plataforma dos Sonhos')
INSERT INTO course_modules (id, course_id, title, description, order_index)
SELECT 
  gen_random_uuid(),
  plataforma_course.id,
  module_title,
  module_desc,
  module_order
FROM plataforma_course,
(VALUES 
  ('7 Chaves', 'As 7 chaves para transformação pessoal', 1),
  ('12 Chás', 'Benefícios terapêuticos dos chás', 2),
  ('Pílulas do Bem', 'Práticas rápidas de bem-estar', 3),
  ('Jejum Intermitente', 'Guia completo sobre jejum intermitente', 4)
) AS modules(module_title, module_desc, module_order);

-- Inserir aulas para Módulo 1 - Doces dos Sonhos
WITH modulo1 AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Doces dos Sonhos' AND cm.title = 'Módulo 1'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  modulo1.id,
  lesson_title,
  lesson_desc,
  lesson_order,
  lesson_video,
  lesson_content
FROM modulo1,
(VALUES 
  ('Aula 1', 'Introdução aos doces saudáveis', 1, null, 'Bem-vindos ao mundo dos doces saudáveis!'),
  ('Brigadeiro de Banana', 'Aprenda a fazer brigadeiro saudável com banana', 2, null, 'Receita deliciosa e nutritiva de brigadeiro com banana.'),
  ('Cookies dos Sonhos', 'Cookies saudáveis e saborosos', 3, null, 'Prepare cookies incríveis sem culpa.')
) AS lessons(lesson_title, lesson_desc, lesson_order, lesson_video, lesson_content);

-- Inserir aulas para Módulo 2 - Doces dos Sonhos
WITH modulo2 AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Doces dos Sonhos' AND cm.title = 'Módulo 2'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  modulo2.id,
  lesson_title,
  lesson_desc,
  lesson_order,
  lesson_video,
  lesson_content
FROM modulo2,
(VALUES 
  ('Aula 1', 'Receitas intermediárias', 1, null, 'Evoluindo nas técnicas de confeitaria saudável.'),
  ('Bolo de Banana', 'Bolo fofo e nutritivo de banana', 2, null, 'Receita especial de bolo de banana integral.'),
  ('Panqueca dos Sonhos', 'Panquecas deliciosas e saudáveis', 3, null, 'Panquecas perfeitas para qualquer hora do dia.')
) AS lessons(lesson_title, lesson_desc, lesson_order, lesson_video, lesson_content);

-- Inserir aulas para Receita para Diabéticos
WITH diabeticos AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Doces dos Sonhos' AND cm.title = 'Receita para Diabéticos'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  diabeticos.id,
  lesson_title,
  lesson_desc,
  lesson_order,
  lesson_video,
  lesson_content
FROM diabeticos,
(VALUES 
  ('Bolo de Baunilha', 'Bolo de baunilha sem açúcar', 1, null, 'Delicioso bolo de baunilha adequado para diabéticos.'),
  ('Queijadinha', 'Queijadinha sem açúcar refinado', 2, null, 'Queijadinha tradicional com adoçantes naturais.'),
  ('Quindim', 'Quindim diet delicioso', 3, null, 'Versão saudável do quindim tradicional.')
) AS lessons(lesson_title, lesson_desc, lesson_order, lesson_video, lesson_content);

-- Inserir aulas para Membros Superiores
WITH membros_sup AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Exercícios dos Sonhos' AND cm.title = 'Membros Superiores'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  membros_sup.id,
  'Treino Completo Membros Superiores',
  'Exercícios completos para braços, ombros e costas',
  1,
  null,
  'Sequência de exercícios para fortalecimento dos membros superiores.'
FROM membros_sup;

-- Inserir aulas para Treino para Gestantes
WITH gestantes AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Exercícios dos Sonhos' AND cm.title = 'Treino para Gestantes'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  gestantes.id,
  lesson_title,
  lesson_desc,
  lesson_order,
  lesson_video,
  lesson_content
FROM gestantes,
(VALUES 
  ('Boas Vindas', 'Introdução ao treino para gestantes', 1, null, 'Bem-vindas ao programa especial para gestantes.'),
  ('Aliviando a Tensão da Lombar', 'Exercícios para alívio das costas', 2, null, 'Movimentos seguros para aliviar a tensão lombar.'),
  ('Agachamento', 'Agachamentos seguros na gravidez', 3, null, 'Técnica correta de agachamento para gestantes.'),
  ('Aliviando a Tensão da Lombar 2', 'Mais exercícios para as costas', 4, null, 'Sequência adicional para alívio lombar.'),
  ('Membros Superiores 1', 'Exercícios para braços - parte 1', 5, null, 'Fortalecimento seguro dos braços.'),
  ('Membros Superiores 2', 'Exercícios para braços - parte 2', 6, null, 'Continuação do treino de membros superiores.'),
  ('Membros Inferiores', 'Exercícios para pernas', 7, null, 'Fortalecimento das pernas durante a gravidez.'),
  ('Relaxamento da Lombar', 'Relaxamento e alongamento', 8, null, 'Técnicas de relaxamento para a região lombar.')
) AS lessons(lesson_title, lesson_desc, lesson_order, lesson_video, lesson_content);

-- Inserir aulas para Pernas Definidas
WITH pernas AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Exercícios dos Sonhos' AND cm.title = 'Pernas Definidas'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  pernas.id,
  lesson_title,
  lesson_desc,
  lesson_order,
  lesson_video,
  lesson_content
FROM pernas,
(VALUES 
  ('Boas Vindas', 'Introdução ao treino de pernas', 1, null, 'Bem-vindos ao programa de definição das pernas.'),
  ('Quadriceps Cadeira', 'Exercício de quadríceps na cadeira', 2, null, 'Fortalecimento do quadríceps.'),
  ('Quadriceps Leg-Press', 'Leg press para quadríceps', 3, null, 'Técnica correta no leg press.'),
  ('Quadriceps Máquina Rack', 'Quadríceps no rack', 4, null, 'Exercício de quadríceps no rack.'),
  ('Posterior de Coxa', 'Fortalecimento posterior', 5, null, 'Exercícios para posterior da coxa.'),
  ('Passada', 'Exercício de passada', 6, null, 'Movimento de passada para pernas.'),
  ('Posterior Cadeira Flexora', 'Flexora para posterior', 7, null, 'Uso da cadeira flexora.'),
  ('Panturrilha em Pé', 'Exercício para panturrilha', 8, null, 'Fortalecimento da panturrilha.'),
  ('Coxa Interna Adução', 'Máquina de adução', 9, null, 'Exercício para coxa interna.'),
  ('Levantamento Terra', 'Terra para pernas completas', 10, null, 'Levantamento terra para pernas.')
) AS lessons(lesson_title, lesson_desc, lesson_order, lesson_video, lesson_content);

-- Inserir aulas para Treino de Mobilidade
WITH mobilidade AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Exercícios dos Sonhos' AND cm.title = 'Treino de Mobilidade'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  mobilidade.id,
  lesson_title,
  lesson_desc,
  lesson_order,
  lesson_video,
  lesson_content
FROM mobilidade,
(VALUES 
  ('Alongamento Posterior de Coxa', 'Alongamento para posterior da coxa', 1, null, 'Técnicas de alongamento para posterior.'),
  ('Alongamento Interno de Coxa', 'Alongamento para coxa interna', 2, null, 'Flexibilidade da coxa interna.'),
  ('Alongamento Glúteo e Quadril', 'Alongamento de glúteos', 3, null, 'Mobilidade de glúteos e quadril.'),
  ('Alongamento de Quadril', 'Mobilidade do quadril', 4, null, 'Exercícios para flexibilidade do quadril.'),
  ('Alongamento Lateral de Quadril', 'Alongamento lateral', 5, null, 'Mobilidade lateral do quadril.')
) AS lessons(lesson_title, lesson_desc, lesson_order, lesson_video, lesson_content);

-- Inserir aulas para Bum Bum na Nuca
WITH gluteos AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Exercícios dos Sonhos' AND cm.title = 'Bum Bum na Nuca'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  gluteos.id,
  lesson_title,
  lesson_desc,
  lesson_order,
  lesson_video,
  lesson_content
FROM gluteos,
(VALUES 
  ('Boas Vindas', 'Introdução ao treino de glúteos', 1, null, 'Bem-vindos ao programa Bum Bum na Nuca.'),
  ('Aquecimento', 'Aquecimento para glúteos', 2, null, 'Preparação para o treino.'),
  ('Elevação Pélvica com Barra', 'Hip thrust com barra', 3, null, 'Exercício principal para glúteos.'),
  ('Exercício Ponte', 'Ponte para glúteos', 4, null, 'Movimento de ponte.'),
  ('Extensão de Quadril', 'Extensão de quadril', 5, null, 'Movimento de extensão.'),
  ('Agachamento Barra Guiada', 'Agachamento no smith', 6, null, 'Agachamento na barra guiada.'),
  ('Afundo Barra Guiada', 'Afundo no smith', 7, null, 'Afundo na barra guiada.'),
  ('Abdução no Cross', 'Abdução no cross over', 8, null, 'Exercício de abdução.'),
  ('Abdução no Cross 02', 'Variação de abdução', 9, null, 'Segunda variação de abdução.'),
  ('Abdução', 'Exercício de abdução', 10, null, 'Movimento de abdução.'),
  ('Abdução na Banda', 'Abdução com banda elástica', 11, null, 'Uso de banda elástica.'),
  ('Abdução em 45°', 'Abdução em ângulo', 12, null, 'Abdução em posição específica.')
) AS lessons(lesson_title, lesson_desc, lesson_order, lesson_video, lesson_content);

-- Inserir aulas para 7 Chaves
WITH chaves AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Plataforma dos Sonhos' AND cm.title = '7 Chaves'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  chaves.id,
  lesson_title,
  lesson_desc,
  lesson_order,
  lesson_video,
  lesson_content
FROM chaves,
(VALUES 
  ('Chave 01 - Paciência', 'A importância da paciência', 1, null, 'Desenvolvendo a virtude da paciência.'),
  ('Chave 02 - Imaginação', 'O poder da imaginação', 2, null, 'Como usar a imaginação a seu favor.'),
  ('Chave 03 - Adaptação', 'Capacidade de adaptação', 3, null, 'Flexibilidade diante das mudanças.'),
  ('Chave 04 - Hábito', 'Formação de hábitos', 4, null, 'Como criar hábitos positivos.'),
  ('Chave 05 - Inteligência Emocional', 'Desenvolvendo IE', 5, null, 'Inteligência emocional na prática.'),
  ('Chave 06 - Vitimismo', 'Superando o vitimismo', 6, null, 'Como sair da posição de vítima.'),
  ('Chave 07 - Liberdade', 'Conquistando a liberdade', 7, null, 'O caminho para a verdadeira liberdade.')
) AS lessons(lesson_title, lesson_desc, lesson_order, lesson_video, lesson_content);

-- Inserir aulas para 12 Chás
WITH chas AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Plataforma dos Sonhos' AND cm.title = '12 Chás'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  chas.id,
  lesson_title,
  lesson_desc,
  lesson_order,
  lesson_video,
  lesson_content
FROM chas,
(VALUES 
  ('Chá de Alecrim', 'Benefícios do chá de alecrim', 1, null, 'Propriedades terapêuticas do alecrim.'),
  ('Chá de Canela', 'Chá de canela e seus benefícios', 2, null, 'Como preparar e usar o chá de canela.'),
  ('Chá de Gengibre', 'Poder do gengibre', 3, null, 'Benefícios anti-inflamatórios do gengibre.'),
  ('Chá de Hibisco', 'Hibisco para saúde', 4, null, 'Propriedades antioxidantes do hibisco.'),
  ('Chá Preto', 'Benefícios do chá preto', 5, null, 'Energia e antioxidantes do chá preto.'),
  ('Chá Verde', 'Poder do chá verde', 6, null, 'Propriedades detox do chá verde.'),
  ('Chá Vermelho', 'Chá vermelho e metabolismo', 7, null, 'Como o chá vermelho acelera o metabolismo.'),
  ('Chá de Espinheira Santa', 'Espinheira santa medicinal', 8, null, 'Benefícios digestivos da espinheira santa.'),
  ('Chá de Ora-pro-nóbis', 'Superalimento ora-pro-nóbis', 9, null, 'Nutrientes do ora-pro-nóbis.')
) AS lessons(lesson_title, lesson_desc, lesson_order, lesson_video, lesson_content);

-- Inserir aulas para Pílulas do Bem
WITH pilulas AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Plataforma dos Sonhos' AND cm.title = 'Pílulas do Bem'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  pilulas.id,
  'Pílulas do Bem',
  'Práticas rápidas de bem-estar',
  1,
  null,
  'Dicas e práticas rápidas para melhorar seu bem-estar diário.'
FROM pilulas;

-- Inserir aulas para Jejum Intermitente
WITH jejum AS (
  SELECT cm.id FROM course_modules cm 
  JOIN courses c ON cm.course_id = c.id 
  WHERE c.title = 'Plataforma dos Sonhos' AND cm.title = 'Jejum Intermitente'
)
INSERT INTO course_lessons (id, module_id, title, description, order_index, video_url, content)
SELECT 
  gen_random_uuid(),
  jejum.id,
  'Jejum Intermitente',
  'Guia completo sobre jejum intermitente',
  1,
  null,
  'Tudo que você precisa saber sobre jejum intermitente.'
FROM jejum;