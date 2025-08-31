-- Criar tabela exercise_tracking para tracking de exercícios
CREATE TABLE IF NOT EXISTS public.exercise_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_type TEXT NOT NULL DEFAULT 'caminhada',
  duration_minutes INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  intensity_level TEXT CHECK (intensity_level IN ('baixa', 'moderada', 'alta')),
  notes TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, exercise_type)
);

-- Habilitar RLS
ALTER TABLE public.exercise_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own exercise tracking" 
ON public.exercise_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise tracking" 
ON public.exercise_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise tracking" 
ON public.exercise_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise tracking" 
ON public.exercise_tracking 
FOR DELETE 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_exercise_tracking_user_date ON public.exercise_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercise_tracking_type ON public.exercise_tracking(exercise_type);

-- Comentários
COMMENT ON TABLE public.exercise_tracking IS 'Tracking de exercícios dos usuários - Instituto dos Sonhos';
COMMENT ON COLUMN public.exercise_tracking.exercise_type IS 'Tipo de exercício realizado';
COMMENT ON COLUMN public.exercise_tracking.duration_minutes IS 'Duração do exercício em minutos';
COMMENT ON COLUMN public.exercise_tracking.calories_burned IS 'Calorias queimadas durante o exercício';
