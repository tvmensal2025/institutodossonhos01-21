-- Primeiro criar as tabelas que estão faltando, depois corrigir as políticas

-- 1. Adicionar campo thumbnail_url na tabela course_modules
ALTER TABLE public.course_modules 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. Criar tabela course_lessons se não existir
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Habilitar RLS para course_lessons
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- 4. Agora adicionar as políticas RLS para permitir admin full access
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses" 
ON public.courses 
FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage course modules" ON public.course_modules;
CREATE POLICY "Admins can manage course modules" 
ON public.course_modules 
FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons" 
ON public.lessons 
FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage course lessons" ON public.course_lessons;
CREATE POLICY "Admins can manage course lessons" 
ON public.course_lessons 
FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage company data" ON public.company_data;
CREATE POLICY "Admins can manage company data" 
ON public.company_data 
FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage challenges" ON public.challenges;
CREATE POLICY "Admins can manage challenges" 
ON public.challenges 
FOR ALL 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage goal categories" ON public.goal_categories;
CREATE POLICY "Admins can manage goal categories" 
ON public.goal_categories 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 5. Inserir categorias padrão se não existirem
INSERT INTO public.goal_categories (name, icon, color) VALUES
('Peso', '⚖️', '#3b82f6'),
('Exercício', '💪', '#10b981'),
('Alimentação', '🥗', '#f59e0b'),
('Hidratação', '💧', '#06b6d4'),
('Sono', '😴', '#8b5cf6'),
('Bem-estar', '🧘', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Verificação final
SELECT 'Políticas RLS e tabelas criadas com sucesso!' as status;