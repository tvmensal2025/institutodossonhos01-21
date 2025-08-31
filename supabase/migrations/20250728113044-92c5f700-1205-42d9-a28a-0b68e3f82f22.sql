-- Criar tabela para anamnese sistêmica
CREATE TABLE public.user_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  profession TEXT,
  marital_status TEXT,
  full_address TEXT,
  city_state TEXT,
  how_found_method TEXT,
  
  -- Histórico Familiar (JSONB para flexibilidade)
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
  food_relationship_score INTEGER CHECK (food_relationship_score >= 0 AND food_relationship_score <= 10),
  has_compulsive_eating BOOLEAN,
  compulsive_eating_situations TEXT,
  problematic_foods JSONB,
  forbidden_foods JSONB,
  feels_guilt_after_eating BOOLEAN,
  eats_in_secret BOOLEAN,
  eats_until_uncomfortable BOOLEAN,
  
  -- Qualidade de Vida
  sleep_hours_per_night DECIMAL(3,1),
  sleep_quality_score INTEGER CHECK (sleep_quality_score >= 0 AND sleep_quality_score <= 10),
  daily_stress_level INTEGER CHECK (daily_stress_level >= 0 AND daily_stress_level <= 10),
  physical_activity_type TEXT,
  physical_activity_frequency TEXT,
  daily_energy_level INTEGER CHECK (daily_energy_level >= 0 AND daily_energy_level <= 10),
  general_quality_of_life INTEGER CHECK (general_quality_of_life >= 0 AND general_quality_of_life <= 10),
  
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
CREATE POLICY "Users can view their own anamnesis" 
ON public.user_anamnesis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own anamnesis" 
ON public.user_anamnesis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anamnesis" 
ON public.user_anamnesis 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all anamnesis" 
ON public.user_anamnesis 
FOR SELECT 
USING (is_admin_user());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_anamnesis_updated_at
BEFORE UPDATE ON public.user_anamnesis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar se usuário completou anamnese
CREATE OR REPLACE FUNCTION public.user_has_completed_anamnesis(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_anamnesis 
    WHERE user_id = user_uuid 
    AND completed_at IS NOT NULL
  );
END;
$$;

-- Função para calcular IMC automaticamente
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

-- Trigger para calcular IMC automaticamente
CREATE TRIGGER calculate_bmi_on_anamnesis
BEFORE INSERT OR UPDATE ON public.user_anamnesis
FOR EACH ROW
EXECUTE FUNCTION public.calculate_bmi_trigger();