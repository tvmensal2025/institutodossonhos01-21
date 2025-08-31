-- Criar tabela de categorias de metas (se não existir)
CREATE TABLE IF NOT EXISTS public.goal_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#3B82F6',
  base_points INTEGER DEFAULT 10,
  difficulty_multiplier JSONB DEFAULT '{"facil": 1.0, "medio": 1.5, "dificil": 2.0}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar se precisa adicionar colunas na tabela user_goals existente
DO $$ 
BEGIN
  -- Adicionar coluna category_id se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='category_id') THEN
    ALTER TABLE public.user_goals ADD COLUMN category_id UUID REFERENCES public.goal_categories(id);
  END IF;
  
  -- Adicionar coluna challenge_id se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='challenge_id') THEN
    ALTER TABLE public.user_goals ADD COLUMN challenge_id UUID REFERENCES public.challenges(id);
  END IF;
  
  -- Adicionar coluna title se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='title') THEN
    ALTER TABLE public.user_goals ADD COLUMN title TEXT NOT NULL DEFAULT 'Meta sem título';
  END IF;
  
  -- Adicionar coluna description se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='description') THEN
    ALTER TABLE public.user_goals ADD COLUMN description TEXT;
  END IF;
  
  -- Adicionar coluna target_value se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='target_value') THEN
    ALTER TABLE public.user_goals ADD COLUMN target_value NUMERIC;
  END IF;
  
  -- Adicionar coluna current_value se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='current_value') THEN
    ALTER TABLE public.user_goals ADD COLUMN current_value NUMERIC DEFAULT 0;
  END IF;
  
  -- Adicionar coluna unit se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='unit') THEN
    ALTER TABLE public.user_goals ADD COLUMN unit TEXT;
  END IF;
  
  -- Adicionar coluna difficulty se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='difficulty') THEN
    ALTER TABLE public.user_goals ADD COLUMN difficulty TEXT DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil'));
  END IF;
  
  -- Adicionar coluna target_date se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='target_date') THEN
    ALTER TABLE public.user_goals ADD COLUMN target_date DATE;
  END IF;
  
  -- Adicionar coluna admin_notes se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='admin_notes') THEN
    ALTER TABLE public.user_goals ADD COLUMN admin_notes TEXT;
  END IF;
  
  -- Adicionar coluna evidence_required se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='evidence_required') THEN
    ALTER TABLE public.user_goals ADD COLUMN evidence_required BOOLEAN DEFAULT true;
  END IF;
  
  -- Adicionar coluna is_group_goal se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='is_group_goal') THEN
    ALTER TABLE public.user_goals ADD COLUMN is_group_goal BOOLEAN DEFAULT false;
  END IF;
  
  -- Adicionar coluna approved_at se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='approved_at') THEN
    ALTER TABLE public.user_goals ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Adicionar coluna completed_at se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='completed_at') THEN
    ALTER TABLE public.user_goals ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Adicionar coluna approved_by se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='approved_by') THEN
    ALTER TABLE public.user_goals ADD COLUMN approved_by UUID;
  END IF;
  
  -- Adicionar coluna estimated_points se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='estimated_points') THEN
    ALTER TABLE public.user_goals ADD COLUMN estimated_points INTEGER DEFAULT 0;
  END IF;
  
  -- Adicionar coluna final_points se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='final_points') THEN
    ALTER TABLE public.user_goals ADD COLUMN final_points INTEGER;
  END IF;
END $$;

-- Criar outras tabelas necessárias
CREATE TABLE IF NOT EXISTS public.goal_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  evidence_type TEXT DEFAULT 'photo' CHECK (evidence_type IN ('photo', 'measurement', 'log', 'document')),
  file_url TEXT,
  description TEXT,
  value_recorded NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC,
  notes TEXT,
  evidence_id UUID REFERENCES public.goal_evidence(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goal_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('aprovada', 'rejeitada')),
  points_awarded INTEGER,
  admin_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.goal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_approvals ENABLE ROW LEVEL SECURITY;

-- Políticas para goal_categories
DROP POLICY IF EXISTS "Everyone can view goal categories" ON public.goal_categories;
CREATE POLICY "Everyone can view goal categories" 
ON public.goal_categories FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage goal categories" ON public.goal_categories;
CREATE POLICY "Admins can manage goal categories" 
ON public.goal_categories FOR ALL 
USING (is_admin_user());

-- Políticas para user_goals (usar DROP IF EXISTS para evitar conflitos)
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
CREATE POLICY "Users can view their own goals" 
ON public.user_goals FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
CREATE POLICY "Users can create their own goals" 
ON public.user_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
CREATE POLICY "Users can update their own goals" 
ON public.user_goals FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all goals" ON public.user_goals;
CREATE POLICY "Admins can view all goals" 
ON public.user_goals FOR SELECT 
USING (is_admin_user());

DROP POLICY IF EXISTS "Admins can update goal status" ON public.user_goals;
CREATE POLICY "Admins can update goal status" 
ON public.user_goals FOR UPDATE 
USING (is_admin_user());

-- Políticas para goal_evidence
DROP POLICY IF EXISTS "Users can manage their own evidence" ON public.goal_evidence;
CREATE POLICY "Users can manage their own evidence" 
ON public.goal_evidence FOR ALL 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all evidence" ON public.goal_evidence;
CREATE POLICY "Admins can view all evidence" 
ON public.goal_evidence FOR SELECT 
USING (is_admin_user());

-- Políticas para goal_updates
DROP POLICY IF EXISTS "Users can manage their own updates" ON public.goal_updates;
CREATE POLICY "Users can manage their own updates" 
ON public.goal_updates FOR ALL 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all updates" ON public.goal_updates;
CREATE POLICY "Admins can view all updates" 
ON public.goal_updates FOR SELECT 
USING (is_admin_user());

-- Políticas para goal_approvals
DROP POLICY IF EXISTS "Admins can manage approvals" ON public.goal_approvals;
CREATE POLICY "Admins can manage approvals" 
ON public.goal_approvals FOR ALL 
USING (is_admin_user());

DROP POLICY IF EXISTS "Users can view their goal approvals" ON public.goal_approvals;
CREATE POLICY "Users can view their goal approvals" 
ON public.goal_approvals FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_goals 
  WHERE id = goal_approvals.goal_id AND user_id = auth.uid()
));

-- Inserir categorias padrão (apenas se não existirem)
INSERT INTO public.goal_categories (name, description, icon, color, base_points) 
SELECT * FROM (VALUES
  ('Peso e Medidas', 'Metas relacionadas a peso corporal e medidas', '⚖️', '#10B981', 15),
  ('Exercício Físico', 'Metas de atividade física e fitness', '💪', '#3B82F6', 12),
  ('Hábitos Saudáveis', 'Metas de comportamento e rotina', '🌱', '#8B5CF6', 10),
  ('Nutrição', 'Metas relacionadas à alimentação', '🥗', '#F59E0B', 12),
  ('Bem-estar Mental', 'Metas de mindfulness e saúde mental', '🧘', '#EC4899', 14),
  ('Sono e Descanso', 'Metas relacionadas ao sono', '😴', '#6366F1', 11),
  ('Hidratação', 'Metas de consumo de água', '💧', '#06B6D4', 8)
) AS new_categories(name, description, icon, color, base_points)
WHERE NOT EXISTS (SELECT 1 FROM public.goal_categories WHERE goal_categories.name = new_categories.name);

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_goal_categories_updated_at ON public.goal_categories;
CREATE TRIGGER update_goal_categories_updated_at
  BEFORE UPDATE ON public.goal_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_goals_updated_at ON public.user_goals;
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();