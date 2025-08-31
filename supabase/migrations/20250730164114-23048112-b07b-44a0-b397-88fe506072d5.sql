-- Corrigir duplicação de pontos na tabela challenges
-- Manter apenas xp_reward e remover points
ALTER TABLE public.challenges DROP COLUMN IF EXISTS points;

-- Adicionar colunas ausentes que o código espera
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.goal_categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Criar tabela google_fit_data se necessária
CREATE TABLE IF NOT EXISTS public.google_fit_data (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    data_type text NOT NULL,
    value numeric,
    unit text,
    recorded_at timestamp with time zone DEFAULT now(),
    synced_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- RLS para google_fit_data
ALTER TABLE public.google_fit_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own google fit data" ON public.google_fit_data
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own google fit data" ON public.google_fit_data  
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Adicionar coluna analysis_date em preventive_health_analyses se necessária
ALTER TABLE public.preventive_health_analyses 
ADD COLUMN IF NOT EXISTS analysis_date date DEFAULT CURRENT_DATE;