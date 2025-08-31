-- Verificar se as tabelas de tracking existem e criar se necessário

-- Criar tabela water_tracking se não existir
CREATE TABLE IF NOT EXISTS public.water_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_ml INTEGER NOT NULL DEFAULT 250,
  source TEXT NOT NULL DEFAULT 'manual',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na water_tracking
ALTER TABLE public.water_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para water_tracking
CREATE POLICY IF NOT EXISTS "Users can view their own water tracking" 
ON public.water_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own water tracking" 
ON public.water_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own water tracking" 
ON public.water_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar tabela sleep_tracking se não existir
CREATE TABLE IF NOT EXISTS public.sleep_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hours DECIMAL(3,1) NOT NULL,
  quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 5),
  source TEXT NOT NULL DEFAULT 'manual',
  sleep_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, sleep_date)
);

-- Habilitar RLS na sleep_tracking
ALTER TABLE public.sleep_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sleep_tracking
CREATE POLICY IF NOT EXISTS "Users can view their own sleep tracking" 
ON public.sleep_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own sleep tracking" 
ON public.sleep_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own sleep tracking" 
ON public.sleep_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar tabela mood_tracking se não existir
CREATE TABLE IF NOT EXISTS public.mood_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 5),
  day_rating INTEGER NOT NULL CHECK (day_rating >= 1 AND day_rating <= 10),
  gratitude_note TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  recorded_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recorded_date)
);

-- Habilitar RLS na mood_tracking
ALTER TABLE public.mood_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mood_tracking
CREATE POLICY IF NOT EXISTS "Users can view their own mood tracking" 
ON public.mood_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own mood tracking" 
ON public.mood_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own mood tracking" 
ON public.mood_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_water_tracking_user_date ON public.water_tracking(user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_sleep_tracking_user_date ON public.sleep_tracking(user_id, sleep_date);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_date ON public.mood_tracking(user_id, recorded_date);