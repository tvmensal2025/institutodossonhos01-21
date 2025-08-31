-- Script para corrigir a tabela user_anamnesis - VERSÃO FINAL
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, vamos dropar a tabela atual e recriar com a estrutura correta
DROP TABLE IF EXISTS public.user_anamnesis CASCADE;

-- Recriar a tabela com a estrutura completa e corrigida
CREATE TABLE public.user_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  profession TEXT,
  marital_status TEXT,
  how_found_method TEXT,
  
  -- Histórico Familiar
  family_obesity_history BOOLEAN,
  family_diabetes_history BOOLEAN,
  family_heart_disease_history BOOLEAN,
  family_eating_disorders_history BOOLEAN,
  family_depression_anxiety_history BOOLEAN,
  family_thyroid_problems_history BOOLEAN,
  family_other_chronic_diseases TEXT,
  
  -- Histórico de Peso (SEM peso atual e altura)
  weight_gain_started_age INTEGER,
  major_weight_gain_periods TEXT,
  emotional_events_during_weight_gain TEXT,
  lowest_adult_weight DECIMAL(5,2),
  highest_adult_weight DECIMAL(5,2),
  weight_fluctuation_classification TEXT,
  
  -- Tratamentos Anteriores
  previous_weight_treatments JSONB DEFAULT '[]',
  most_effective_treatment TEXT,
  least_effective_treatment TEXT,
  had_rebound_effect BOOLEAN,
  
  -- Medicações Atuais
  current_medications JSONB DEFAULT '[]',
  chronic_diseases JSONB DEFAULT '[]',
  supplements JSONB DEFAULT '[]',
  herbal_medicines JSONB DEFAULT '[]',
  
  -- Relacionamento com Comida
  food_relationship_score INTEGER CHECK (food_relationship_score >= 0 AND food_relationship_score <= 10),
  has_compulsive_eating BOOLEAN,
  compulsive_eating_situations TEXT,
  problematic_foods JSONB DEFAULT '[]',
  forbidden_foods JSONB DEFAULT '[]',
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

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_anamnesis_updated_at 
    BEFORE UPDATE ON public.user_anamnesis 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.user_anamnesis IS 'Tabela para armazenar anamnese sistêmica dos usuários';
COMMENT ON COLUMN public.user_anamnesis.profession IS 'Profissão do usuário';
COMMENT ON COLUMN public.user_anamnesis.marital_status IS 'Estado civil do usuário';
COMMENT ON COLUMN public.user_anamnesis.how_found_method IS 'Como o usuário conheceu o Instituto dos Sonhos';
COMMENT ON COLUMN public.user_anamnesis.family_obesity_history IS 'Histórico familiar de obesidade';
COMMENT ON COLUMN public.user_anamnesis.family_diabetes_history IS 'Histórico familiar de diabetes';
COMMENT ON COLUMN public.user_anamnesis.family_heart_disease_history IS 'Histórico familiar de doenças cardíacas';
COMMENT ON COLUMN public.user_anamnesis.family_eating_disorders_history IS 'Histórico familiar de distúrbios alimentares';
COMMENT ON COLUMN public.user_anamnesis.family_depression_anxiety_history IS 'Histórico familiar de depressão/ansiedade';
COMMENT ON COLUMN public.user_anamnesis.family_thyroid_problems_history IS 'Histórico familiar de problemas de tireoide';
COMMENT ON COLUMN public.user_anamnesis.family_other_chronic_diseases IS 'Outras doenças crônicas familiares';
COMMENT ON COLUMN public.user_anamnesis.weight_gain_started_age IS 'Idade que começou a ganhar peso excessivo';
COMMENT ON COLUMN public.user_anamnesis.major_weight_gain_periods IS 'Períodos de maior ganho de peso';
COMMENT ON COLUMN public.user_anamnesis.emotional_events_during_weight_gain IS 'Eventos emocionais durante ganho de peso';
COMMENT ON COLUMN public.user_anamnesis.lowest_adult_weight IS 'Menor peso na vida adulta (kg)';
COMMENT ON COLUMN public.user_anamnesis.highest_adult_weight IS 'Maior peso na vida adulta (kg)';
COMMENT ON COLUMN public.user_anamnesis.weight_fluctuation_classification IS 'Classificação da oscilação de peso';
COMMENT ON COLUMN public.user_anamnesis.previous_weight_treatments IS 'Tratamentos anteriores para controle de peso';
COMMENT ON COLUMN public.user_anamnesis.most_effective_treatment IS 'Tratamento mais eficaz';
COMMENT ON COLUMN public.user_anamnesis.least_effective_treatment IS 'Tratamento menos eficaz';
COMMENT ON COLUMN public.user_anamnesis.had_rebound_effect IS 'Teve efeito rebote';
COMMENT ON COLUMN public.user_anamnesis.current_medications IS 'Medicamentos atuais';
COMMENT ON COLUMN public.user_anamnesis.chronic_diseases IS 'Doenças crônicas';
COMMENT ON COLUMN public.user_anamnesis.supplements IS 'Suplementos';
COMMENT ON COLUMN public.user_anamnesis.herbal_medicines IS 'Medicamentos fitoterápicos';
COMMENT ON COLUMN public.user_anamnesis.food_relationship_score IS 'Score do relacionamento com comida (1-10)';
COMMENT ON COLUMN public.user_anamnesis.has_compulsive_eating IS 'Tem compulsão alimentar';
COMMENT ON COLUMN public.user_anamnesis.compulsive_eating_situations IS 'Situações de compulsão alimentar';
COMMENT ON COLUMN public.user_anamnesis.problematic_foods IS 'Alimentos problemáticos';
COMMENT ON COLUMN public.user_anamnesis.forbidden_foods IS 'Alimentos proibidos';
COMMENT ON COLUMN public.user_anamnesis.feels_guilt_after_eating IS 'Sente culpa após comer';
COMMENT ON COLUMN public.user_anamnesis.eats_in_secret IS 'Come escondido';
COMMENT ON COLUMN public.user_anamnesis.eats_until_uncomfortable IS 'Come até desconfortável';
COMMENT ON COLUMN public.user_anamnesis.sleep_hours_per_night IS 'Horas de sono por noite';
COMMENT ON COLUMN public.user_anamnesis.sleep_quality_score IS 'Score da qualidade do sono (1-10)';
COMMENT ON COLUMN public.user_anamnesis.daily_stress_level IS 'Nível de estresse diário (1-10)';
COMMENT ON COLUMN public.user_anamnesis.physical_activity_type IS 'Tipo de atividade física';
COMMENT ON COLUMN public.user_anamnesis.physical_activity_frequency IS 'Frequência de atividade física';
COMMENT ON COLUMN public.user_anamnesis.daily_energy_level IS 'Nível de energia diário (1-10)';
COMMENT ON COLUMN public.user_anamnesis.general_quality_of_life IS 'Qualidade de vida geral (1-10)';
COMMENT ON COLUMN public.user_anamnesis.main_treatment_goals IS 'Principais objetivos do tratamento';
COMMENT ON COLUMN public.user_anamnesis.biggest_weight_loss_challenge IS 'Maior desafio para perder peso';
COMMENT ON COLUMN public.user_anamnesis.ideal_weight_goal IS 'Peso ideal (kg)';
COMMENT ON COLUMN public.user_anamnesis.timeframe_to_achieve_goal IS 'Prazo para atingir objetivo';
COMMENT ON COLUMN public.user_anamnesis.treatment_success_definition IS 'Definição de sucesso no tratamento';
COMMENT ON COLUMN public.user_anamnesis.motivation_for_seeking_treatment IS 'Motivação para buscar tratamento';

-- Verificar se a tabela foi criada corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_anamnesis' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mensagem de sucesso
SELECT 'Tabela user_anamnesis criada com sucesso!' as status;
