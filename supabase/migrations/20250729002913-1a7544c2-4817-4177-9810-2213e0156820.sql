-- Criar módulos e aulas para os cursos

-- Primeiro, obter os IDs dos cursos criados
WITH course_ids AS (
  SELECT id, title FROM courses 
  WHERE title IN ('Doces Funcionais para Emagrecimento', 'Exercícios para Queima de Gordura', 'Mindset de Emagrecimento Saudável')
)

-- Inserir módulos para cada curso
INSERT INTO course_modules (course_id, title, description, order_index)
SELECT 
  (SELECT id FROM course_ids WHERE title = 'Doces Funcionais para Emagrecimento'),
  unnest(ARRAY['Fundamentos dos Doces Funcionais', 'Receitas Básicas', 'Técnicas Avançadas']),
  unnest(ARRAY[
    'Aprenda os princípios básicos dos ingredientes funcionais',
    'Doces simples e deliciosos para começar',
    'Receitas mais elaboradas e criativas'
  ]),
  unnest(ARRAY[1, 2, 3])

UNION ALL

SELECT 
  (SELECT id FROM course_ids WHERE title = 'Exercícios para Queima de Gordura'),
  unnest(ARRAY['Aquecimento e Preparação', 'Exercícios Cardio', 'Força e Resistência']),
  unnest(ARRAY[
    'Como preparar o corpo para o treino',
    'Exercícios cardiovasculares eficientes',
    'Treinos de força para acelerar o metabolismo'
  ]),
  unnest(ARRAY[1, 2, 3])

UNION ALL

SELECT 
  (SELECT id FROM course_ids WHERE title = 'Mindset de Emagrecimento Saudável'),
  unnest(ARRAY['Mindset e Crenças', 'Hábitos Saudáveis', 'Manutenção a Longo Prazo']),
  unnest(ARRAY[
    'Identificando e transformando crenças limitantes',
    'Criando novos hábitos que sustentam seus objetivos',
    'Estratégias para manter os resultados para sempre'
  ]),
  unnest(ARRAY[1, 2, 3]);