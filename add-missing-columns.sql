-- Script para adicionar apenas as colunas que faltam na tabela user_anamnesis
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar colunas que faltam
ALTER TABLE public.user_anamnesis 
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS city_state TEXT,
ADD COLUMN IF NOT EXISTS how_found_method TEXT,
ADD COLUMN IF NOT EXISTS family_obesity_history BOOLEAN,
ADD COLUMN IF NOT EXISTS family_diabetes_history BOOLEAN,
ADD COLUMN IF NOT EXISTS family_heart_disease_history BOOLEAN,
ADD COLUMN IF NOT EXISTS family_eating_disorders_history BOOLEAN,
ADD COLUMN IF NOT EXISTS family_depression_anxiety_history BOOLEAN,
ADD COLUMN IF NOT EXISTS family_thyroid_problems_history BOOLEAN,
ADD COLUMN IF NOT EXISTS family_other_chronic_diseases TEXT,
ADD COLUMN IF NOT EXISTS weight_gain_started_age INTEGER,
ADD COLUMN IF NOT EXISTS major_weight_gain_periods TEXT,
ADD COLUMN IF NOT EXISTS emotional_events_during_weight_gain TEXT,
ADD COLUMN IF NOT EXISTS lowest_adult_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS highest_adult_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS current_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS current_bmi DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS weight_fluctuation_classification TEXT,
ADD COLUMN IF NOT EXISTS previous_weight_treatments JSONB,
ADD COLUMN IF NOT EXISTS most_effective_treatment TEXT,
ADD COLUMN IF NOT EXISTS least_effective_treatment TEXT,
ADD COLUMN IF NOT EXISTS had_rebound_effect BOOLEAN,
ADD COLUMN IF NOT EXISTS food_relationship_score INTEGER,
ADD COLUMN IF NOT EXISTS has_compulsive_eating BOOLEAN,
ADD COLUMN IF NOT EXISTS compulsive_eating_situations TEXT,
ADD COLUMN IF NOT EXISTS problematic_foods JSONB,
ADD COLUMN IF NOT EXISTS forbidden_foods JSONB,
ADD COLUMN IF NOT EXISTS feels_guilt_after_eating BOOLEAN,
ADD COLUMN IF NOT EXISTS eats_in_secret BOOLEAN,
ADD COLUMN IF NOT EXISTS eats_until_uncomfortable BOOLEAN,
ADD COLUMN IF NOT EXISTS sleep_hours_per_night DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS sleep_quality_score INTEGER,
ADD COLUMN IF NOT EXISTS daily_stress_level INTEGER,
ADD COLUMN IF NOT EXISTS physical_activity_type TEXT,
ADD COLUMN IF NOT EXISTS physical_activity_frequency TEXT,
ADD COLUMN IF NOT EXISTS daily_energy_level INTEGER,
ADD COLUMN IF NOT EXISTS general_quality_of_life INTEGER,
ADD COLUMN IF NOT EXISTS main_treatment_goals TEXT,
ADD COLUMN IF NOT EXISTS biggest_weight_loss_challenge TEXT,
ADD COLUMN IF NOT EXISTS ideal_weight_goal DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS timeframe_to_achieve_goal TEXT,
ADD COLUMN IF NOT EXISTS treatment_success_definition TEXT,
ADD COLUMN IF NOT EXISTS motivation_for_seeking_treatment TEXT;

-- Adicionar constraint UNIQUE se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_user_anamnesis' 
        AND table_name = 'user_anamnesis'
    ) THEN
        ALTER TABLE public.user_anamnesis ADD CONSTRAINT unique_user_anamnesis UNIQUE (user_id);
    END IF;
END $$;

-- Verificar se a coluna biggest_weight_loss_challenge foi criada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_anamnesis' 
AND column_name = 'biggest_weight_loss_challenge'; 