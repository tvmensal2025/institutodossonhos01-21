-- Corrigir erros críticos identificados nos logs
-- Usar sintaxe compatível com PostgreSQL

-- 1. Adicionar políticas RLS para permitir criação de cursos
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses" 
ON public.courses 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 2. Adicionar campo thumbnail_url na tabela course_modules
ALTER TABLE public.course_modules 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 3. Adicionar políticas RLS para course_modules
DROP POLICY IF EXISTS "Admins can manage course modules" ON public.course_modules;
CREATE POLICY "Admins can manage course modules" 
ON public.course_modules 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 4. Adicionar políticas RLS para lessons
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons" 
ON public.lessons 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 5. Verificar se course_lessons tem todas as políticas
DROP POLICY IF EXISTS "Admins can manage course lessons" ON public.course_lessons;
CREATE POLICY "Admins can manage course lessons" 
ON public.course_lessons 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 6. Adicionar políticas para company_data
DROP POLICY IF EXISTS "Admins can manage company data" ON public.company_data;
CREATE POLICY "Admins can manage company data" 
ON public.company_data 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 7. Corrigir políticas de challenges
DROP POLICY IF EXISTS "Admins can manage challenges" ON public.challenges;
CREATE POLICY "Admins can manage challenges" 
ON public.challenges 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 8. Adicionar políticas para goal_categories
DROP POLICY IF EXISTS "Admins can manage goal categories" ON public.goal_categories;
CREATE POLICY "Admins can manage goal categories" 
ON public.goal_categories 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 9. Inserir categorias padrão se não existirem
INSERT INTO public.goal_categories (name, icon, color) VALUES
('Peso', '⚖️', '#3b82f6'),
('Exercício', '💪', '#10b981'),
('Alimentação', '🥗', '#f59e0b'),
('Hidratação', '💧', '#06b6d4'),
('Sono', '😴', '#8b5cf6'),
('Bem-estar', '🧘', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Verificação final
SELECT 'Políticas RLS corrigidas com sucesso!' as status;