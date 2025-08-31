-- Migração para corrigir estrutura das tabelas e adicionar funcionalidades faltantes

-- 1. Criar tabela de user_custom_saboteurs (referenciada no código mas não existe)
CREATE TABLE IF NOT EXISTS public.user_custom_saboteurs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saboteur_id UUID NOT NULL REFERENCES public.custom_saboteurs(id) ON DELETE CASCADE,
  severity_level INTEGER DEFAULT 1 CHECK (severity_level >= 1 AND severity_level <= 10),
  identified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  strategies_used TEXT[],
  progress_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, saboteur_id)
);

-- 2. Adicionar colunas faltantes na tabela sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS target_saboteurs TEXT[] DEFAULT '{}';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS tools TEXT[] DEFAULT '{}';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 30;

-- 3. Criar tabela user_scores (referenciada em vários places)
CREATE TABLE IF NOT EXISTS public.user_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score_value NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC DEFAULT 100,
  evaluation_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, category, evaluation_date)
);

-- 4. Adicionar colunas faltantes em user_goals
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS final_points INTEGER DEFAULT 0;

-- 5. Criar tabela de course_progress para tracking de progresso dos cursos
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);

-- 6. Criar tabela de user_subscriptions para controle de assinaturas
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
  payment_method TEXT,
  amount_paid NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Criar tabela de intelligent_notifications para notificações inteligentes
CREATE TABLE IF NOT EXISTS public.intelligent_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  is_read BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Adicionar RLS policies para as novas tabelas
ALTER TABLE public.user_custom_saboteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligent_notifications ENABLE ROW LEVEL SECURITY;

-- Policies para user_custom_saboteurs
CREATE POLICY "Users can view their own saboteurs" ON public.user_custom_saboteurs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own saboteur records" ON public.user_custom_saboteurs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saboteur records" ON public.user_custom_saboteurs
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies para user_scores
CREATE POLICY "Users can view their own scores" ON public.user_scores
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own scores" ON public.user_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scores" ON public.user_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies para course_progress
CREATE POLICY "Users can view their own course progress" ON public.course_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own course progress" ON public.course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own course progress" ON public.course_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies para user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies para intelligent_notifications
CREATE POLICY "Users can view their own notifications" ON public.intelligent_notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.intelligent_notifications
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.intelligent_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 9. Adicionar triggers para updated_at
CREATE OR REPLACE TRIGGER update_user_custom_saboteurs_updated_at
  BEFORE UPDATE ON public.user_custom_saboteurs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_user_scores_updated_at
  BEFORE UPDATE ON public.user_scores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_course_progress_updated_at
  BEFORE UPDATE ON public.course_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_custom_saboteurs_user_id ON public.user_custom_saboteurs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON public.user_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON public.course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_intelligent_notifications_user_id ON public.intelligent_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_intelligent_notifications_category ON public.intelligent_notifications(category);
CREATE INDEX IF NOT EXISTS idx_intelligent_notifications_is_read ON public.intelligent_notifications(is_read);

-- 11. Adicionar comentários nas tabelas
COMMENT ON TABLE public.user_custom_saboteurs IS 'Relação entre usuários e seus saboteadores identificados';
COMMENT ON TABLE public.user_scores IS 'Pontuações dos usuários em diferentes categorias (saúde, bem-estar, etc.)';
COMMENT ON TABLE public.course_progress IS 'Progresso dos usuários nos cursos e lições';
COMMENT ON TABLE public.user_subscriptions IS 'Controle de assinaturas e planos dos usuários';
COMMENT ON TABLE public.intelligent_notifications IS 'Sistema de notificações inteligentes personalizadas';