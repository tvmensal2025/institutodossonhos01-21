-- Corrigir configurações do Google Fit - Instituto dos Sonhos
-- Este script verifica e corrige as configurações necessárias

-- 1. Verificar se a tabela profiles tem a coluna google_fit_enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'google_fit_enabled'
    ) THEN
        ALTER TABLE profiles ADD COLUMN google_fit_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna google_fit_enabled adicionada à tabela profiles';
    ELSE
        RAISE NOTICE 'Coluna google_fit_enabled já existe na tabela profiles';
    END IF;
END $$;

-- 2. Verificar se a tabela google_fit_tokens existe e está correta
CREATE TABLE IF NOT EXISTS google_fit_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    token_type TEXT DEFAULT 'Bearer',
    scope TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Verificar se a tabela google_fit_data existe e está correta
CREATE TABLE IF NOT EXISTS google_fit_data (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data_date DATE NOT NULL,
    
    -- Dados básicos
    steps_count INTEGER DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    calories_total INTEGER DEFAULT 0,
    distance_meters INTEGER DEFAULT 0,
    
    -- Dados cardiovasculares
    heart_rate_avg INTEGER,
    heart_rate_resting INTEGER,
    heart_rate_min INTEGER,
    heart_rate_max INTEGER,
    active_minutes INTEGER DEFAULT 0,
    
    -- Dados de sono
    sleep_duration_hours DECIMAL(4,2) DEFAULT 0,
    sleep_efficiency DECIMAL(5,2),
    sleep_stages JSONB,
    
    -- Dados antropométricos
    weight_kg DECIMAL(5,2),
    height_cm INTEGER,
    bmi DECIMAL(4,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    
    -- Dados de exercício
    exercise_minutes INTEGER DEFAULT 0,
    workout_sessions INTEGER DEFAULT 0,
    exercise_calories INTEGER DEFAULT 0,
    
    -- Dados de hidratação
    hydration_ml INTEGER DEFAULT 0,
    water_intake_ml INTEGER DEFAULT 0,
    
    -- Dados de nutrição
    nutrition_calories INTEGER DEFAULT 0,
    protein_g DECIMAL(6,2) DEFAULT 0,
    carbs_g DECIMAL(6,2) DEFAULT 0,
    fat_g DECIMAL(6,2) DEFAULT 0,
    
    -- Dados de oxigenação
    oxygen_saturation DECIMAL(4,2),
    respiratory_rate DECIMAL(4,2),
    
    -- Dados de ambiente
    location TEXT,
    weather TEXT,
    temperature_celsius DECIMAL(4,2),
    
    -- Dados de dispositivos
    device_type TEXT,
    data_source TEXT,
    
    -- Metadados
    sync_timestamp TIMESTAMPTZ DEFAULT NOW(),
    data_quality INTEGER DEFAULT 0,
    raw_data JSONB,
    
    UNIQUE(user_id, data_date)
);

-- 4. Habilitar RLS nas tabelas
ALTER TABLE google_fit_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para google_fit_tokens
DROP POLICY IF EXISTS "Users can manage their own Google Fit tokens" ON google_fit_tokens;
CREATE POLICY "Users can manage their own Google Fit tokens" ON google_fit_tokens
    FOR ALL USING (auth.uid() = user_id);

-- 6. Criar políticas RLS para google_fit_data
DROP POLICY IF EXISTS "Users can view own Google Fit data" ON google_fit_data;
CREATE POLICY "Users can view own Google Fit data" ON google_fit_data
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own Google Fit data" ON google_fit_data;
CREATE POLICY "Users can insert own Google Fit data" ON google_fit_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own Google Fit data" ON google_fit_data;
CREATE POLICY "Users can update own Google Fit data" ON google_fit_data
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_google_fit_tokens_user_id ON google_fit_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_tokens_expires_at ON google_fit_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_date ON google_fit_data(user_id, data_date);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_date ON google_fit_data(data_date);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_sync_timestamp ON google_fit_data(sync_timestamp);

-- 8. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_google_fit_tokens_updated_at ON google_fit_tokens;
CREATE TRIGGER update_google_fit_tokens_updated_at
    BEFORE UPDATE ON google_fit_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Adicionar comentários para documentação
COMMENT ON TABLE google_fit_tokens IS 'Tokens de acesso do Google Fit para usuários - Instituto dos Sonhos';
COMMENT ON TABLE google_fit_data IS 'Dados completos do Google Fit dos usuários - Instituto dos Sonhos';

-- 10. Verificar configuração atual
SELECT 
    'google_fit_tokens' as table_name,
    COUNT(*) as record_count
FROM google_fit_tokens
UNION ALL
SELECT 
    'google_fit_data' as table_name,
    COUNT(*) as record_count
FROM google_fit_data;

-- 11. Verificar se as colunas foram criadas corretamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'google_fit_data' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 12. Mensagem de confirmação
SELECT '✅ Configurações do Google Fit corrigidas com sucesso!' as status;
