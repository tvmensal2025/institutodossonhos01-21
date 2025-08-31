-- Criar aulas para cada módulo

-- Buscar módulos e criar aulas correspondentes
WITH module_data AS (
  SELECT 
    cm.id as module_id,
    cm.title as module_title,
    c.title as course_title
  FROM course_modules cm
  JOIN courses c ON cm.course_id = c.id
  WHERE c.title IN ('Doces Funcionais para Emagrecimento', 'Exercícios para Queima de Gordura', 'Mindset de Emagrecimento Saudável')
)

INSERT INTO course_lessons (module_id, title, description, order_index, duration_minutes, is_premium)
-- Aulas para Doces Funcionais
SELECT 
  (SELECT module_id FROM module_data WHERE course_title = 'Doces Funcionais para Emagrecimento' AND module_title = 'Fundamentos dos Doces Funcionais'),
  unnest(ARRAY['Introdução aos Ingredientes Funcionais', 'Substituições Inteligentes', 'Adoçantes Naturais']),
  unnest(ARRAY[
    'Conheça os ingredientes que vão revolucionar seus doces',
    'Como substituir açúcar e farinha refinada',
    'Stevia, xilitol e outras opções saudáveis'
  ]),
  unnest(ARRAY[1, 2, 3]),
  unnest(ARRAY[15, 20, 18]),
  unnest(ARRAY[false, false, false])

UNION ALL

SELECT 
  (SELECT module_id FROM module_data WHERE course_title = 'Doces Funcionais para Emagrecimento' AND module_title = 'Receitas Básicas'),
  unnest(ARRAY['Brigadeiro Funcional', 'Brownie de Batata Doce', 'Pudim de Chia']),
  unnest(ARRAY[
    'O clássico brigadeiro em versão saudável',
    'Brownie delicioso e nutritivo',
    'Pudim cremoso rico em ômega 3'
  ]),
  unnest(ARRAY[1, 2, 3]),
  unnest(ARRAY[25, 30, 20]),
  unnest(ARRAY[false, false, false])

UNION ALL

SELECT 
  (SELECT module_id FROM module_data WHERE course_title = 'Doces Funcionais para Emagrecimento' AND module_title = 'Técnicas Avançadas'),
  unnest(ARRAY['Mousses Proteicos', 'Bolos Low Carb', 'Sobremesas Geladas']),
  unnest(ARRAY[
    'Mousses cremosos com alto teor proteico',
    'Bolos saborosos com baixo carboidrato',
    'Sorvetes e picolés funcionais'
  ]),
  unnest(ARRAY[1, 2, 3]),
  unnest(ARRAY[35, 40, 30]),
  unnest(ARRAY[false, true, true])

UNION ALL

-- Aulas para Exercícios
SELECT 
  (SELECT module_id FROM module_data WHERE course_title = 'Exercícios para Queima de Gordura' AND module_title = 'Aquecimento e Preparação'),
  unnest(ARRAY['Aquecimento Dinâmico', 'Mobilidade Articular', 'Preparação Mental']),
  unnest(ARRAY[
    'Aquecimento completo para otimizar o treino',
    'Exercícios de mobilidade e flexibilidade',
    'Como se preparar mentalmente para o treino'
  ]),
  unnest(ARRAY[1, 2, 3]),
  unnest(ARRAY[10, 15, 12]),
  unnest(ARRAY[false, false, false])

UNION ALL

SELECT 
  (SELECT module_id FROM module_data WHERE course_title = 'Exercícios para Queima de Gordura' AND module_title = 'Exercícios Cardio'),
  unnest(ARRAY['HIIT Iniciante', 'Cardio Dance', 'Treino Tabata']),
  unnest(ARRAY[
    'Treino intervalado de alta intensidade',
    'Queime calorias dançando',
    'Protocolo Tabata para máxima queima'
  ]),
  unnest(ARRAY[1, 2, 3]),
  unnest(ARRAY[20, 30, 15]),
  unnest(ARRAY[false, false, true])

UNION ALL

SELECT 
  (SELECT module_id FROM module_data WHERE course_title = 'Exercícios para Queima de Gordura' AND module_title = 'Força e Resistência'),
  unnest(ARRAY['Treino Funcional', 'Peso Corporal', 'Circuito Metabólico']),
  unnest(ARRAY[
    'Exercícios funcionais para o dia a dia',
    'Treino completo usando apenas o peso do corpo',
    'Circuito intensivo para acelerar o metabolismo'
  ]),
  unnest(ARRAY[1, 2, 3]),
  unnest(ARRAY[25, 20, 30]),
  unnest(ARRAY[false, true, true])

UNION ALL

-- Aulas para Mindset
SELECT 
  (SELECT module_id FROM module_data WHERE course_title = 'Mindset de Emagrecimento Saudável' AND module_title = 'Mindset e Crenças'),
  unnest(ARRAY['Identificando Sabotadores', 'Reprogramando Crenças', 'Visualização Criativa']),
  unnest(ARRAY[
    'Como identificar pensamentos que sabotam seus resultados',
    'Técnicas para mudar crenças limitantes',
    'Poder da visualização para alcançar objetivos'
  ]),
  unnest(ARRAY[1, 2, 3]),
  unnest(ARRAY[30, 35, 25]),
  unnest(ARRAY[true, true, true])

UNION ALL

SELECT 
  (SELECT module_id FROM module_data WHERE course_title = 'Mindset de Emagrecimento Saudável' AND module_title = 'Hábitos Saudáveis'),
  unnest(ARRAY['Criando Rotinas', 'Gerenciamento do Tempo', 'Motivação Duradoura']),
  unnest(ARRAY[
    'Como criar rotinas que se mantêm sozinhas',
    'Organizando o tempo para seus objetivos de saúde',
    'Mantendo a motivação a longo prazo'
  ]),
  unnest(ARRAY[1, 2, 3]),
  unnest(ARRAY[28, 22, 33]),
  unnest(ARRAY[true, true, true])

UNION ALL

SELECT 
  (SELECT module_id FROM module_data WHERE course_title = 'Mindset de Emagrecimento Saudável' AND module_title = 'Manutenção a Longo Prazo'),
  unnest(ARRAY['Prevenindo Recaídas', 'Flexibilidade Mental', 'Celebrando Conquistas']),
  unnest(ARRAY[
    'Estratégias para evitar o efeito sanfona',
    'Como ser flexível sem perder o foco',
    'A importância de reconhecer e celebrar progressos'
  ]),
  unnest(ARRAY[1, 2, 3]),
  unnest(ARRAY[32, 27, 25]),
  unnest(ARRAY[true, true, true]);