-- Migração para criar as tabelas em falta mencionadas nos erros

-- Tabela daily_missions
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  mission_type text NOT NULL,
  title text NOT NULL,
  description text,
  target_value integer DEFAULT 1,
  current_value integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  points_reward integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela user_scores
CREATE TABLE IF NOT EXISTS public.user_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  weekly_points integer DEFAULT 0,
  monthly_points integer DEFAULT 0,
  level_current integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela mood_tracking
CREATE TABLE IF NOT EXISTS public.mood_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 10),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  notes text,
  activities text[],
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela life_wheel
CREATE TABLE IF NOT EXISTS public.life_wheel (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date date NOT NULL DEFAULT CURRENT_DATE,
  health_score integer CHECK (health_score >= 1 AND health_score <= 10),
  career_score integer CHECK (career_score >= 1 AND career_score <= 10),
  relationships_score integer CHECK (relationships_score >= 1 AND relationships_score <= 10),
  personal_growth_score integer CHECK (personal_growth_score >= 1 AND personal_growth_score <= 10),
  finance_score integer CHECK (finance_score >= 1 AND finance_score <= 10),
  recreation_score integer CHECK (recreation_score >= 1 AND recreation_score <= 10),
  physical_environment_score integer CHECK (physical_environment_score >= 1 AND physical_environment_score <= 10),
  contribution_score integer CHECK (contribution_score >= 1 AND contribution_score <= 10),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela activity_categories
CREATE TABLE IF NOT EXISTS public.activity_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  icon text DEFAULT '🏃',
  color text DEFAULT '#3B82F6',
  points_per_session integer DEFAULT 5,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela activity_sessions
CREATE TABLE IF NOT EXISTS public.activity_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.activity_categories(id) ON DELETE CASCADE,
  session_date timestamp with time zone DEFAULT now(),
  duration_minutes integer,
  intensity_level text CHECK (intensity_level IN ('low', 'moderate', 'high')),
  calories_burned integer,
  notes text,
  points_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_wheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para daily_missions
CREATE POLICY "Users can manage their own daily missions" ON public.daily_missions
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para user_scores
CREATE POLICY "Users can view and update their own scores" ON public.user_scores
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para mood_tracking
CREATE POLICY "Users can manage their own mood tracking" ON public.mood_tracking
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para life_wheel
CREATE POLICY "Users can manage their own life wheel assessments" ON public.life_wheel
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para activity_categories
CREATE POLICY "Everyone can view activity categories" ON public.activity_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage activity categories" ON public.activity_categories
  FOR ALL USING (is_admin_user());

-- Políticas RLS para activity_sessions
CREATE POLICY "Users can manage their own activity sessions" ON public.activity_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date ON public.daily_missions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON public.user_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_date ON public.mood_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_life_wheel_user_date ON public.life_wheel(user_id, assessment_date);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_date ON public.activity_sessions(user_id, session_date);

-- Inserir categorias de atividade padrão
INSERT INTO public.activity_categories (name, description, icon, color, points_per_session) VALUES
  ('Caminhada', 'Caminhada leve ou intensa', '🚶', '#10B981', 5),
  ('Corrida', 'Corrida ou jogging', '🏃', '#EF4444', 10),
  ('Academia', 'Treino de musculação', '💪', '#8B5CF6', 15),
  ('Yoga', 'Prática de yoga e alongamento', '🧘', '#06B6D4', 8),
  ('Natação', 'Natação e exercícios aquáticos', '🏊', '#3B82F6', 12),
  ('Ciclismo', 'Andar de bicicleta', '🚴', '#F59E0B', 10),
  ('Dança', 'Aulas de dança', '💃', '#EC4899', 8),
  ('Futebol', 'Futebol e esportes coletivos', '⚽', '#22C55E', 12)
ON CONFLICT (name) DO NOTHING;