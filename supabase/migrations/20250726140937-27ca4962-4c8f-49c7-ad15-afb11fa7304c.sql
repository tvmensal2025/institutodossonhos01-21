-- Criar tabela para dados do Google Fit se não existir
CREATE TABLE IF NOT EXISTS google_fit_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    steps INTEGER DEFAULT 0,
    calories INTEGER DEFAULT 0,
    distance DECIMAL(8,2) DEFAULT 0, -- em metros
    heart_rate INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    sleep_duration_minutes INTEGER DEFAULT 0,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices únicos por usuário e data
    UNIQUE(user_id, date)
);

-- Habilitar RLS
ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - usuários só veem seus próprios dados
CREATE POLICY "google_fit_data_select_policy" ON google_fit_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "google_fit_data_insert_policy" ON google_fit_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "google_fit_data_update_policy" ON google_fit_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "google_fit_data_delete_policy" ON google_fit_data
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_google_fit_data_updated_at
    BEFORE UPDATE ON google_fit_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_date 
    ON google_fit_data(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_google_fit_data_synced_at 
    ON google_fit_data(synced_at DESC);