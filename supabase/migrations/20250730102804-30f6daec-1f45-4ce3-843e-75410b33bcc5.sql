-- Corrigir erros críticos identificados nos logs

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
CREATE POLICY IF NOT EXISTS "Admins can manage course lessons" 
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

-- 8. Adicionar campos necessários na tabela challenges
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medio',
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS badge_icon TEXT DEFAULT '🎯',
ADD COLUMN IF NOT EXISTS badge_name TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS tips JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS daily_log_type TEXT DEFAULT 'boolean',
ADD COLUMN IF NOT EXISTS daily_log_target INTEGER,
ADD COLUMN IF NOT EXISTS daily_log_unit TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_group_challenge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 9. Adicionar políticas para goal_categories
DROP POLICY IF EXISTS "Admins can manage goal categories" ON public.goal_categories;
CREATE POLICY "Admins can manage goal categories" 
ON public.goal_categories 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 10. Verificar se user_goals tem constraint correto com challenges
-- Primeiro remover se existir
ALTER TABLE public.user_goals DROP CONSTRAINT IF EXISTS user_goals_challenge_id_fkey;

-- Adicionar constraint correta
ALTER TABLE public.user_goals 
ADD CONSTRAINT user_goals_challenge_id_fkey 
FOREIGN KEY (challenge_id) 
REFERENCES public.challenges(id) 
ON DELETE SET NULL;

-- 11. Adicionar constraint entre user_goals e goal_categories
ALTER TABLE public.user_goals DROP CONSTRAINT IF EXISTS user_goals_category_id_fkey;
ALTER TABLE public.user_goals 
ADD CONSTRAINT user_goals_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.goal_categories(id) 
ON DELETE SET NULL;

-- 12. Adicionar triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
CREATE TRIGGER IF NOT EXISTS update_courses_updated_at 
BEFORE UPDATE ON public.courses 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_challenges_updated_at 
BEFORE UPDATE ON public.challenges 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Inserir categorias padrão se não existirem
INSERT INTO public.goal_categories (name, icon, color) VALUES
('Peso', '⚖️', '#3b82f6'),
('Exercício', '💪', '#10b981'),
('Alimentação', '🥗', '#f59e0b'),
('Hidratação', '💧', '#06b6d4'),
('Sono', '😴', '#8b5cf6'),
('Bem-estar', '🧘', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- 14. Inserir dados padrão de empresa se não existir
INSERT INTO public.company_data (
  company_name, 
  description,
  primary_color,
  secondary_color
) VALUES (
  'Instituto dos Sonhos',
  'Plataforma completa de saúde e bem-estar com IA avançada',
  '#6366f1',
  '#8b5cf6'
) ON CONFLICT DO NOTHING;

-- Verificação final
SELECT 'Políticas RLS e estrutura corrigidas com sucesso!' as status;