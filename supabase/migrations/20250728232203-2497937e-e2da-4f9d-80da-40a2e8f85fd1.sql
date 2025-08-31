-- Criar tabela de aulas
CREATE TABLE public.course_lessons (
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

-- Habilitar RLS
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Políticas para aulas
CREATE POLICY "Everyone can view course lessons" ON public.course_lessons
  FOR SELECT USING (true);