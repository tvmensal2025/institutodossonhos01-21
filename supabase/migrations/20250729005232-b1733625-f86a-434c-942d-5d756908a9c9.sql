-- Modificar tabela course_modules para permitir módulos independentes
ALTER TABLE course_modules 
ALTER COLUMN course_id DROP NOT NULL;

-- Modificar tabela course_lessons para permitir aulas diretamente em cursos
ALTER TABLE course_lessons 
ALTER COLUMN module_id DROP NOT NULL,
ADD COLUMN course_id UUID REFERENCES courses(id);

-- Adicionar campos de thumbnail para módulos e aulas
ALTER TABLE course_modules 
ADD COLUMN thumbnail_url TEXT;

ALTER TABLE course_lessons 
ADD COLUMN thumbnail_url TEXT;

-- Adicionar campo para definir o tipo de estrutura
ALTER TABLE courses 
ADD COLUMN structure_type TEXT DEFAULT 'course_module_lesson' 
CHECK (structure_type IN ('course_lesson', 'course_module_lesson'));

ALTER TABLE course_modules
ADD COLUMN structure_type TEXT DEFAULT 'module_lesson'
CHECK (structure_type IN ('module_lesson', 'standalone_module'));

-- Criar índices para melhor performance
CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX idx_course_modules_standalone ON course_modules(course_id) WHERE course_id IS NULL;

-- Atualizar políticas RLS para permitir as novas estruturas
DROP POLICY IF EXISTS "Everyone can view course modules" ON course_modules;
CREATE POLICY "Everyone can view course modules" ON course_modules
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Everyone can view course lessons" ON course_lessons;  
CREATE POLICY "Everyone can view course lessons" ON course_lessons
FOR SELECT USING (true);

-- Permitir admins gerenciarem módulos e aulas
CREATE POLICY "Admins can manage course modules" ON course_modules
FOR ALL USING (is_admin_user());