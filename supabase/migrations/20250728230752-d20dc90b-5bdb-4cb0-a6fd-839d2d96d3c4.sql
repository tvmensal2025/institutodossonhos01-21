-- Criar tabela de cursos
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'doces', 'exercicios', 'plataforma'
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  instructor_name TEXT,
  duration_minutes INTEGER,
  difficulty_level TEXT,
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de módulos
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de aulas
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  video_url TEXT,
  content TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de progresso do usuário nos cursos
CREATE TABLE IF NOT EXISTS public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Habilitar RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para cursos
CREATE POLICY "Everyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

-- Políticas para módulos
CREATE POLICY "Everyone can view course modules" ON public.course_modules
  FOR SELECT USING (true);

-- Políticas para aulas
CREATE POLICY "Everyone can view course lessons" ON public.course_lessons
  FOR SELECT USING (true);

-- Políticas para progresso do usuário
CREATE POLICY "Users can view their own progress" ON public.user_course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" ON public.user_course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_course_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Inserir os cursos principais
INSERT INTO public.courses (title, description, category) VALUES
('Doces dos Sonhos', 'Receitas deliciosas e saudáveis para todos os momentos', 'doces'),
('Exercícios dos Sonhos', 'Treinos especializados para diferentes objetivos', 'exercicios'),
('Plataforma dos Sonhos', 'Desenvolvimento pessoal e bem-estar', 'plataforma');

-- Inserir módulos para Doces dos Sonhos
INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 'Módulo 1', 'Receitas básicas e deliciosas', id, 1
FROM public.courses WHERE title = 'Doces dos Sonhos';

INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 'Módulo 2', 'Receitas avançadas', id, 2
FROM public.courses WHERE title = 'Doces dos Sonhos';

INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 'Receitas para Diabéticos', 'Opções saudáveis e saborosas', id, 3
FROM public.courses WHERE title = 'Doces dos Sonhos';

-- Inserir módulos para Exercícios dos Sonhos
INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 'Membros Superiores', 'Fortalecimento da parte superior do corpo', id, 1
FROM public.courses WHERE title = 'Exercícios dos Sonhos';

INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 'Treino para Gestantes', 'Exercícios seguros durante a gravidez', id, 2
FROM public.courses WHERE title = 'Exercícios dos Sonhos';

INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 'Pernas Definidas', 'Treino completo para membros inferiores', id, 3
FROM public.courses WHERE title = 'Exercícios dos Sonhos';

INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 'Treino de Mobilidade', 'Alongamentos e flexibilidade', id, 4
FROM public.courses WHERE title = 'Exercícios dos Sonhos';

INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 'Bum Bum na Nuca', 'Treino focado em glúteos', id, 5
FROM public.courses WHERE title = 'Exercícios dos Sonhos';

-- Inserir módulos para Plataforma dos Sonhos
INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT '7 Chaves', 'As 7 chaves para o desenvolvimento pessoal', id, 1
FROM public.courses WHERE title = 'Plataforma dos Sonhos';

INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT '12 Chás', 'Benefícios e preparo dos chás medicinais', id, 2
FROM public.courses WHERE title = 'Plataforma dos Sonhos';

INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 'Pílulas do Bem', 'Dicas rápidas para o bem-estar', id, 3
FROM public.courses WHERE title = 'Plataforma dos Sonhos';

INSERT INTO public.course_modules (title, description, course_id, order_index)
SELECT 'Jejum Intermitente', 'Guia completo sobre jejum intermitente', id, 4
FROM public.courses WHERE title = 'Plataforma dos Sonhos';