-- Migração para completar estrutura de cursos, módulos e lições

-- 1. Adicionar campos que podem estar faltando na tabela lessons
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS course_id uuid,
ADD COLUMN IF NOT EXISTS content text,
ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 2. Popular course_id na tabela lessons usando JOIN com course_modules
UPDATE public.lessons 
SET course_id = cm.course_id 
FROM public.course_modules cm 
WHERE lessons.module_id = cm.id 
AND lessons.course_id IS NULL;

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS para lessons (admin-only para escrita)
DROP POLICY IF EXISTS "Everyone can view published lessons" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated users can create lessons" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated users can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated users can delete lessons" ON public.lessons;

CREATE POLICY "Everyone can view published lessons" 
ON public.lessons 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses c 
    JOIN public.course_modules cm ON c.id = cm.course_id 
    WHERE cm.id = lessons.module_id 
    AND c.is_published = true
  )
);

CREATE POLICY "Admin can insert lessons" 
ON public.lessons 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update lessons" 
ON public.lessons 
FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete lessons" 
ON public.lessons 
FOR DELETE 
USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Adicionar foreign keys para integridade
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_lessons_module'
  ) THEN
    ALTER TABLE public.lessons 
    ADD CONSTRAINT fk_lessons_module 
    FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_lessons_course'
  ) THEN
    ALTER TABLE public.lessons 
    ADD CONSTRAINT fk_lessons_course 
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Criar trigger para updated_at
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 7. Função para obter hierarquia completa do curso
CREATE OR REPLACE FUNCTION public.get_course_hierarchy(course_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'course', to_jsonb(c),
    'modules', COALESCE(modules_array, '[]'::jsonb)
  ) INTO result
  FROM public.courses c
  LEFT JOIN (
    SELECT 
      cm.course_id,
      jsonb_agg(
        jsonb_build_object(
          'module', to_jsonb(cm),
          'lessons', COALESCE(lessons_array, '[]'::jsonb)
        ) ORDER BY cm.order_index
      ) as modules_array
    FROM public.course_modules cm
    LEFT JOIN (
      SELECT 
        l.module_id,
        jsonb_agg(to_jsonb(l) ORDER BY l.order_index) as lessons_array
      FROM public.lessons l
      GROUP BY l.module_id
    ) lessons_data ON cm.id = lessons_data.module_id
    WHERE cm.course_id = course_uuid
    GROUP BY cm.course_id
  ) modules_data ON c.id = modules_data.course_id
  WHERE c.id = course_uuid;
  
  RETURN result;
END;
$$;

-- 8. Função para calcular progresso do curso
CREATE OR REPLACE FUNCTION public.calculate_course_progress(user_uuid uuid, course_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  total_lessons integer;
  completed_lessons integer;
  progress_percentage numeric;
  result jsonb;
BEGIN
  -- Contar total de lições no curso
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons l
  JOIN public.course_modules cm ON l.module_id = cm.id
  WHERE cm.course_id = course_uuid;
  
  -- Contar lições completadas pelo usuário
  SELECT COUNT(*) INTO completed_lessons
  FROM public.course_progress cp
  JOIN public.lessons l ON cp.lesson_id = l.id
  JOIN public.course_modules cm ON l.module_id = cm.id
  WHERE cp.user_id = user_uuid 
    AND cm.course_id = course_uuid 
    AND cp.progress_percentage = 100;
  
  -- Calcular porcentagem
  IF total_lessons > 0 THEN
    progress_percentage := (completed_lessons::numeric / total_lessons::numeric) * 100;
  ELSE
    progress_percentage := 0;
  END IF;
  
  result := jsonb_build_object(
    'total_lessons', total_lessons,
    'completed_lessons', completed_lessons,
    'progress_percentage', ROUND(progress_percentage, 2),
    'is_completed', progress_percentage = 100
  );
  
  RETURN result;
END;
$$;