-- Corrigir tabela chat_conversations para Sofia funcionar corretamente
-- A edge function health-chat-bot está tentando salvar bot_response mas a coluna não existe

ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS user_message TEXT,
ADD COLUMN IF NOT EXISTS bot_response TEXT,
ADD COLUMN IF NOT EXISTS character_name TEXT DEFAULT 'Sof.ia';

-- Criar tabela para análise emocional das conversas
CREATE TABLE IF NOT EXISTS public.chat_emotional_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID,
  sentiment_score NUMERIC(3,2) DEFAULT 0,
  emotions_detected TEXT[] DEFAULT '{}',
  pain_level INTEGER,
  stress_level INTEGER,
  energy_level INTEGER,
  mood_keywords TEXT[] DEFAULT '{}',
  physical_symptoms TEXT[] DEFAULT '{}',
  emotional_topics TEXT[] DEFAULT '{}',
  concerns_mentioned TEXT[] DEFAULT '{}',
  goals_mentioned TEXT[] DEFAULT '{}',
  achievements_mentioned TEXT[] DEFAULT '{}',
  analysis_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para análise emocional
ALTER TABLE public.chat_emotional_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emotional analysis" 
ON public.chat_emotional_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create emotional analysis" 
ON public.chat_emotional_analysis 
FOR INSERT 
WITH CHECK (true);

-- Criar tabela para anamnese sistêmica (dados da Sofia)
CREATE TABLE IF NOT EXISTS public.user_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Dados básicos
  main_complaint TEXT,
  current_medications TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  previous_surgeries TEXT[] DEFAULT '{}',
  family_history TEXT[] DEFAULT '{}',
  
  -- Sistema cardiovascular
  heart_problems BOOLEAN DEFAULT false,
  high_blood_pressure BOOLEAN DEFAULT false,
  circulation_issues BOOLEAN DEFAULT false,
  
  -- Sistema respiratório  
  breathing_problems BOOLEAN DEFAULT false,
  asthma BOOLEAN DEFAULT false,
  allergic_rhinitis BOOLEAN DEFAULT false,
  
  -- Sistema digestivo
  stomach_problems BOOLEAN DEFAULT false,
  intestinal_issues BOOLEAN DEFAULT false,
  food_intolerances TEXT[] DEFAULT '{}',
  
  -- Sistema endócrino
  diabetes BOOLEAN DEFAULT false,
  thyroid_problems BOOLEAN DEFAULT false,
  hormonal_issues BOOLEAN DEFAULT false,
  
  -- Sistema musculoesquelético
  joint_pain BOOLEAN DEFAULT false,
  muscle_problems BOOLEAN DEFAULT false,
  posture_issues BOOLEAN DEFAULT false,
  
  -- Sistema neurológico
  headaches BOOLEAN DEFAULT false,
  dizziness BOOLEAN DEFAULT false,
  memory_issues BOOLEAN DEFAULT false,
  
  -- Saúde mental
  anxiety BOOLEAN DEFAULT false,
  depression BOOLEAN DEFAULT false,
  sleep_disorders BOOLEAN DEFAULT false,
  stress_level INTEGER DEFAULT 5,
  
  -- Hábitos de vida
  smoking BOOLEAN DEFAULT false,
  alcohol_consumption TEXT,
  exercise_frequency TEXT,
  sleep_hours INTEGER DEFAULT 8,
  water_intake_liters NUMERIC(3,1) DEFAULT 2.0,
  
  -- Dados específicos para mulheres
  menstrual_cycle_regular BOOLEAN,
  contraceptive_use BOOLEAN DEFAULT false,
  pregnancies INTEGER DEFAULT 0,
  
  -- Observações gerais
  additional_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para anamnese
ALTER TABLE public.user_anamnesis ENABLE ROW LEVEL SECURITY;

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