-- Criar cursos com as imagens fornecidas
INSERT INTO courses (
  id,
  title, 
  description, 
  category, 
  thumbnail_url, 
  is_published, 
  is_premium, 
  instructor_name, 
  duration_minutes, 
  difficulty_level, 
  price
) VALUES 
-- Curso de Culinária - Doces dos Sonhos
(
  gen_random_uuid(),
  'Doces Funcionais para Emagrecimento',
  'Aprenda a preparar doces deliciosos e saudáveis que ajudam no processo de emagrecimento. Receitas práticas com ingredientes funcionais.',
  'culinaria',
  '/images/curso-doces-funcionais.jpg',
  true,
  false,
  'Sofia Vitale',
  180,
  'Iniciante',
  0
),

-- Curso de Fitness - Exercícios dos Sonhos  
(
  gen_random_uuid(),
  'Exercícios para Queima de Gordura',
  'Programa completo de exercícios focado na queima de gordura e tonificação muscular. Treinos práticos para fazer em casa.',
  'fitness',
  '/images/curso-exercicios-queima.jpg',
  true,
  false,
  'Dr. Fit',
  240,
  'Intermediário',
  0
),

-- Curso de Desenvolvimento Pessoal - Plataforma dos Sonhos
(
  gen_random_uuid(),
  'Mindset de Emagrecimento Saudável',
  'Transforme sua mentalidade e crie hábitos sustentáveis para um emagrecimento duradouro. Técnicas de coaching e psicologia positiva.',
  'desenvolvimento-pessoal',
  '/images/curso-mindset-emagrecimento.jpg',
  true,
  true,
  'Sofia Vitale',
  300,
  'Todos os níveis',
  97
)

ON CONFLICT (id) DO NOTHING;