-- Criar tabela google_fit_data no Supabase
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Criar tabela para dados do Google Fit
CREATE TABLE IF NOT EXISTS public.google_fit_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data_date DATE NOT NULL,
    steps_count INTEGER DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    distance_meters INTEGER DEFAULT 0,
    heart_rate_avg INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    sleep_duration_hours DECIMAL(4,2) DEFAULT 0,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    heart_rate_resting INTEGER,
    heart_rate_max INTEGER,
    raw_data JSONB,
    sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, data_date)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_date ON google_fit_data(user_id, data_date);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_sync_timestamp ON google_fit_data(sync_timestamp);

-- Habilitar RLS
ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários só veem seus próprios dados
CREATE POLICY "Users can view own Google Fit data" ON google_fit_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Google Fit data" ON google_fit_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Google Fit data" ON google_fit_data
    FOR UPDATE USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE google_fit_data IS 'Dados do Google Fit dos usuários - Instituto dos Sonhos';
COMMENT ON COLUMN google_fit_data.active_minutes IS 'Minutos ativos registrados pelo Google Fit';
COMMENT ON COLUMN google_fit_data.sleep_duration_hours IS 'Duração do sono em horas';
COMMENT ON COLUMN google_fit_data.weight_kg IS 'Peso em quilogramas do Google Fit';
COMMENT ON COLUMN google_fit_data.height_cm IS 'Altura em centímetros do Google Fit';
