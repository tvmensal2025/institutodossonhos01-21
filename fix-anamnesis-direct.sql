-- Script para corrigir a tabela user_anamnesis
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_anamnesis'
);

-- Criar a tabela se não existir
CREATE TABLE IF NOT EXISTS public.user_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Dados Pessoais
  profession TEXT,
  marital_status TEXT,
  city_state TEXT,
  how_found_method TEXT,
  
  -- Histórico Familiar
  family_obesity_history BOOLEAN,
  family_diabetes_history BOOLEAN,
  family_heart_disease_history BOOLEAN,
  family_eating_disorders_history BOOLEAN,
  family_depression_anxiety_history BOOLEAN,
  family_thyroid_problems_history BOOLEAN,
  family_other_chronic_diseases TEXT,
  
  -- Histórico de Peso
  weight_gain_started_age INTEGER,
  major_weight_gain_periods TEXT,
  emotional_events_during_weight_gain TEXT,
  lowest_adult_weight DECIMAL(5,2),
  highest_adult_weight DECIMAL(5,2),
  current_weight DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  current_bmi DECIMAL(4,2),
  weight_fluctuation_classification TEXT,
  
  -- Tratamentos Anteriores
  previous_weight_treatments JSONB,
  most_effective_treatment TEXT,
  least_effective_treatment TEXT,
  had_rebound_effect BOOLEAN,
  
  -- Medicações Atuais
  current_medications JSONB,
  chronic_diseases JSONB,
  supplements JSONB,
  herbal_medicines JSONB,
  
  -- Relacionamento com Comida
  food_relationship_score INTEGER,
  has_compulsive_eating BOOLEAN,
  compulsive_eating_situations TEXT,
  problematic_foods JSONB,
  forbidden_foods JSONB,
  feels_guilt_after_eating BOOLEAN,
  eats_in_secret BOOLEAN,
  eats_until_uncomfortable BOOLEAN,
  
  -- Qualidade de Vida
  sleep_hours_per_night DECIMAL(3,1),
  sleep_quality_score INTEGER,
  daily_stress_level INTEGER,
  physical_activity_type TEXT,
  physical_activity_frequency TEXT,
  daily_energy_level INTEGER,
  general_quality_of_life INTEGER,
  
  -- Objetivos e Expectativas
  main_treatment_goals TEXT,
  biggest_weight_loss_challenge TEXT,
  ideal_weight_goal DECIMAL(5,2),
  timeframe_to_achieve_goal TEXT,
  treatment_success_definition TEXT,
  motivation_for_seeking_treatment TEXT,
  
  -- Metadados
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para garantir uma anamnese por usuário
  CONSTRAINT unique_user_anamnesis UNIQUE (user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_anamnesis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY IF NOT EXISTS "Users can view their own anamnesis" 
ON public.user_anamnesis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own anamnesis" 
ON public.user_anamnesis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own anamnesis" 
ON public.user_anamnesis 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Função para calcular IMC
CREATE OR REPLACE FUNCTION public.calculate_bmi_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.current_weight IS NOT NULL AND NEW.height_cm IS NOT NULL THEN
    NEW.current_bmi := NEW.current_weight / POWER(NEW.height_cm / 100, 2);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para calcular IMC
DROP TRIGGER IF EXISTS calculate_bmi_on_anamnesis ON public.user_anamnesis;
CREATE TRIGGER calculate_bmi_on_anamnesis
BEFORE INSERT OR UPDATE ON public.user_anamnesis
FOR EACH ROW
EXECUTE FUNCTION public.calculate_bmi_trigger();

-- Verificar se a coluna biggest_weight_loss_challenge foi criada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_anamnesis' 
AND column_name = 'biggest_weight_loss_challenge'; 