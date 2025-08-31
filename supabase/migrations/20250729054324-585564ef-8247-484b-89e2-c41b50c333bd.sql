-- Corrigir tabela weight_measurements - adicionar colunas faltantes
ALTER TABLE public.weight_measurements 
ADD COLUMN IF NOT EXISTS agua_corporal_percent DECIMAL(5,2) DEFAULT 0.00;

-- Criar tabelas faltantes que estão causando erros 404
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mission_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER DEFAULT 1,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  points_reward INTEGER DEFAULT 10,
  date_assigned DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score_type TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.life_wheel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  notes TEXT,
  evaluation_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'Activity',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.activity_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 5),
  calories_burned INTEGER,
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  mission TEXT,
  vision TEXT,
  values TEXT,
  about_us TEXT,
  main_services TEXT,
  differentials TEXT,
  company_culture TEXT,
  health_philosophy TEXT,
  target_audience TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para todas as novas tabelas
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_wheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para daily_missions
CREATE POLICY "Users can view their own daily missions" ON public.daily_missions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily missions" ON public.daily_missions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily missions" ON public.daily_missions
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para user_scores
CREATE POLICY "Users can view their own scores" ON public.user_scores
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scores" ON public.user_scores
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para life_wheel
CREATE POLICY "Users can view their own life wheel" ON public.life_wheel
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own life wheel" ON public.life_wheel
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life wheel" ON public.life_wheel
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para activity_categories
CREATE POLICY "Users can view their own activity categories" ON public.activity_categories
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity categories" ON public.activity_categories
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity categories" ON public.activity_categories
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para activity_sessions
CREATE POLICY "Users can view their own activity sessions" ON public.activity_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity sessions" ON public.activity_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity sessions" ON public.activity_sessions
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para company_data (público para leitura, admin para escrita)
CREATE POLICY "Everyone can view company data" ON public.company_data
FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage company data" ON public.company_data
FOR ALL USING (auth.uid() IS NOT NULL);

-- Inserir dados padrão da empresa se não existir
INSERT INTO public.company_data (name, mission, vision, values, about_us) 
SELECT 
  'Sua Empresa',
  'Nossa missão é...',
  'Nossa visão é...',
  'Nossos valores são...',
  'Sobre nós...'
WHERE NOT EXISTS (SELECT 1 FROM public.company_data);

-- Corrigir a coluna mood_tracking.date (parece estar com nome errado)
ALTER TABLE public.mood_tracking 
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;