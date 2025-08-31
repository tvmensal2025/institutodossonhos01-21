-- Criar tabela para restrições/preferências persistentes do usuário
CREATE TABLE IF NOT EXISTS public.user_food_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  food_name TEXT NOT NULL,
  preference_type TEXT NOT NULL CHECK (preference_type IN ('restriction', 'preference', 'allergy', 'dislike')),
  severity_level INTEGER DEFAULT 1 CHECK (severity_level BETWEEN 1 AND 5),
  notes TEXT,
  auto_detected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Evitar duplicatas
  UNIQUE(user_id, food_name, preference_type)
);

-- Habilitar RLS
ALTER TABLE public.user_food_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage their own food preferences" 
ON public.user_food_preferences 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_user_food_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_food_preferences_updated_at
  BEFORE UPDATE ON public.user_food_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_food_preferences_updated_at();

-- Criar tabela para histórico de ingredientes usados
CREATE TABLE IF NOT EXISTS public.user_ingredient_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  ingredient_name TEXT NOT NULL,
  meal_plan_id UUID REFERENCES public.meal_plan_history(id),
  frequency_used INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Evitar duplicatas
  UNIQUE(user_id, ingredient_name)
);

-- Habilitar RLS
ALTER TABLE public.user_ingredient_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own ingredient history" 
ON public.user_ingredient_history 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Adicionar colunas à tabela meal_plan_history para melhor tracking
ALTER TABLE public.meal_plan_history 
ADD COLUMN IF NOT EXISTS generation_params JSONB,
ADD COLUMN IF NOT EXISTS restrictions_applied TEXT[],
ADD COLUMN IF NOT EXISTS preferences_applied TEXT[],
ADD COLUMN IF NOT EXISTS calories_target INTEGER,
ADD COLUMN IF NOT EXISTS protein_target INTEGER,
ADD COLUMN IF NOT EXISTS carbs_target INTEGER,
ADD COLUMN IF NOT EXISTS fat_target INTEGER,
ADD COLUMN IF NOT EXISTS fiber_target INTEGER;