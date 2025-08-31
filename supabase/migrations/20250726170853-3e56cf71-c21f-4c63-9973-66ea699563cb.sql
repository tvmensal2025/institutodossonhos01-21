-- Criar tabela de categorias de metas
CREATE TABLE public.goal_categories (
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

-- Criar tabela de metas dos usuários
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.goal_categories(id),
  challenge_id UUID REFERENCES public.challenges(id), -- Conexão com desafios existentes
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT, -- kg, dias, repetições, etc
  difficulty TEXT DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  target_date DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada', 'em_progresso', 'concluida', 'cancelada')),
  estimated_points INTEGER DEFAULT 0,
  final_points INTEGER,
  admin_notes TEXT,
  evidence_required BOOLEAN DEFAULT true,
  is_group_goal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID
);

-- Criar tabela de evidências das metas
CREATE TABLE public.goal_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  evidence_type TEXT DEFAULT 'photo' CHECK (evidence_type IN ('photo', 'measurement', 'log', 'document')),
  file_url TEXT,
  description TEXT,
  value_recorded NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de atualizações de progresso
CREATE TABLE public.goal_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC,
  notes TEXT,
  evidence_id UUID REFERENCES public.goal_evidence(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de aprovações administrativas
CREATE TABLE public.goal_approvals (
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
CREATE POLICY "Everyone can view goal categories" 
ON public.goal_categories FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage goal categories" 
ON public.goal_categories FOR ALL 
USING (is_admin_user());

-- Políticas para user_goals
CREATE POLICY "Users can view their own goals" 
ON public.user_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.user_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.user_goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all goals" 
ON public.user_goals FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Admins can update goal status" 
ON public.user_goals FOR UPDATE 
USING (is_admin_user());

-- Políticas para goal_evidence
CREATE POLICY "Users can manage their own evidence" 
ON public.goal_evidence FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all evidence" 
ON public.goal_evidence FOR SELECT 
USING (is_admin_user());

-- Políticas para goal_updates
CREATE POLICY "Users can manage their own updates" 
ON public.goal_updates FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all updates" 
ON public.goal_updates FOR SELECT 
USING (is_admin_user());

-- Políticas para goal_approvals
CREATE POLICY "Admins can manage approvals" 
ON public.goal_approvals FOR ALL 
USING (is_admin_user());

CREATE POLICY "Users can view their goal approvals" 
ON public.goal_approvals FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_goals 
  WHERE id = goal_approvals.goal_id AND user_id = auth.uid()
));

-- Inserir categorias padrão
INSERT INTO public.goal_categories (name, description, icon, color, base_points) VALUES
('Peso e Medidas', 'Metas relacionadas a peso corporal e medidas', '⚖️', '#10B981', 15),
('Exercício Físico', 'Metas de atividade física e fitness', '💪', '#3B82F6', 12),
('Hábitos Saudáveis', 'Metas de comportamento e rotina', '🌱', '#8B5CF6', 10),
('Nutrição', 'Metas relacionadas à alimentação', '🥗', '#F59E0B', 12),
('Bem-estar Mental', 'Metas de mindfulness e saúde mental', '🧘', '#EC4899', 14),
('Sono e Descanso', 'Metas relacionadas ao sono', '😴', '#6366F1', 11),
('Hidratação', 'Metas de consumo de água', '💧', '#06B6D4', 8);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_goal_categories_updated_at
  BEFORE UPDATE ON public.goal_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();