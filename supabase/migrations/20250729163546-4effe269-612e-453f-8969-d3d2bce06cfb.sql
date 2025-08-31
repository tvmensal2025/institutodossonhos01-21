-- Adicionar políticas RLS para tabela course_lessons

-- Habilitar RLS na tabela course_lessons
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Políticas para course_lessons - todos podem ver lições publicadas
DROP POLICY IF EXISTS "Everyone can view course lessons" ON public.course_lessons;
CREATE POLICY "Everyone can view course lessons" 
ON public.course_lessons 
FOR SELECT 
USING (true);

-- Apenas usuários autenticados podem criar lições
DROP POLICY IF EXISTS "Authenticated users can create lessons" ON public.course_lessons;
CREATE POLICY "Authenticated users can create lessons" 
ON public.course_lessons 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Apenas usuários autenticados podem atualizar lições
DROP POLICY IF EXISTS "Authenticated users can update lessons" ON public.course_lessons;
CREATE POLICY "Authenticated users can update lessons" 
ON public.course_lessons 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Apenas usuários autenticados podem deletar lições
DROP POLICY IF EXISTS "Authenticated users can delete lessons" ON public.course_lessons;
CREATE POLICY "Authenticated users can delete lessons" 
ON public.course_lessons 
FOR DELETE 
USING (auth.uid() IS NOT NULL);