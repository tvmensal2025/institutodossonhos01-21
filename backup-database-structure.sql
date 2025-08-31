-- BACKUP COMPLETO DA ESTRUTURA DO BANCO
-- Execute este script se algo for perdido

-- =====================================================
-- BACKUP: Estrutura da tabela user_goals
-- =====================================================
-- Se a tabela user_goals perder colunas, execute:

-- Adicionar todas as colunas importantes
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS points_awarded INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Garantir que user_id não seja nullable
ALTER TABLE public.user_goals ALTER COLUMN user_id SET NOT NULL;

-- =====================================================
-- BACKUP: Tabela user_anamnesis
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
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

-- =====================================================
-- BACKUP: Políticas RLS Essenciais
-- =====================================================

-- RLS para user_goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem estar conflitantes
DROP POLICY IF EXISTS "Users can view own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can view all user goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can update user goals" ON public.user_goals;

-- Recriar políticas essenciais
CREATE POLICY "Users can view own goals"
ON public.user_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
ON public.user_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
ON public.user_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user goals"
ON public.user_goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update user goals"
ON public.user_goals
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- RLS para user_anamnesis
ALTER TABLE public.user_anamnesis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own anamnesis" ON public.user_anamnesis;
DROP POLICY IF EXISTS "Users can create their own anamnesis" ON public.user_anamnesis;
DROP POLICY IF EXISTS "Users can update their own anamnesis" ON public.user_anamnesis;

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

-- RLS para courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can create courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;

CREATE POLICY "Everyone can view published courses"
ON public.courses
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can create courses"
ON public.courses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update courses"
ON public.courses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete courses"
ON public.courses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- BACKUP: Funções e Triggers Essenciais
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_goals_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger para user_goals
DROP TRIGGER IF EXISTS update_user_goals_updated_at ON public.user_goals;
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_goals_updated_at();

-- Função para calcular IMC
CREATE OR REPLACE FUNCTION public.calculate_bmi_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.current_weight IS NOT NULL AND NEW.height_cm IS NOT NULL THEN
    NEW.current_bmi := NEW.current_weight / POWER(NEW.height_cm / 100, 2);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para user_anamnesis
DROP TRIGGER IF EXISTS calculate_bmi_on_anamnesis ON public.user_anamnesis;
CREATE TRIGGER calculate_bmi_on_anamnesis
BEFORE INSERT OR UPDATE ON public.user_anamnesis
FOR EACH ROW
EXECUTE FUNCTION public.calculate_bmi_trigger();

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Execute para verificar se tudo está correto:
SELECT 'Verificação Completa - Execute as queries abaixo:' as status;

-- SELECT table_name, column_name FROM information_schema.columns WHERE table_name = 'user_goals' AND column_name IN ('admin_notes', 'points_awarded');
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'user_anamnesis';
-- SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('user_goals', 'user_anamnesis', 'courses');