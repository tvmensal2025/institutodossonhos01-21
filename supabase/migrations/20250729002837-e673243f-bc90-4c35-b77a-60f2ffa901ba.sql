-- Limpar qualquer curso existente com títulos similares para evitar duplicatas
DELETE FROM courses WHERE title IN ('Doces Funcionais para Emagrecimento', 'Exercícios para Queima de Gordura', 'Mindset de Emagrecimento Saudável');

-- Inserir cursos com valores corretos
INSERT INTO courses (
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
  'Doces Funcionais para Emagrecimento',
  'Aprenda a preparar doces deliciosos e saudáveis que ajudam no processo de emagrecimento. Receitas práticas com ingredientes funcionais que satisfazem sua vontade de doce sem prejudicar seus objetivos.',
  'culinaria',
  '/images/curso-doces-funcionais.jpg',
  true,
  false,
  'Sofia Vitale',
  180,
  'beginner',
  0
),

-- Curso de Fitness - Exercícios dos Sonhos  
(
  'Exercícios para Queima de Gordura',
  'Programa completo de exercícios focado na queima de gordura e tonificação muscular. Treinos práticos para fazer em casa ou na academia, adequados para todos os níveis.',
  'fitness',
  '/images/curso-exercicios-queima.jpg',
  true,
  false,
  'Dr. Fit',
  240,
  'intermediate',
  0
),

-- Curso de Desenvolvimento Pessoal - Plataforma dos Sonhos
(
  'Mindset de Emagrecimento Saudável',
  'Transforme sua mentalidade e crie hábitos sustentáveis para um emagrecimento duradouro. Técnicas de coaching e psicologia positiva para uma mudança de vida real.',
  'desenvolvimento-pessoal',
  '/images/curso-mindset-emagrecimento.jpg',
  true,
  true,
  'Sofia Vitale',
  300,
  'advanced',
  97
);