-- Script para corrigir a estrutura da tabela google_fit_data
-- Execute este script no Supabase Dashboard

-- 1. Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'google_fit_data') THEN
        -- Criar tabela se não existir
        CREATE TABLE google_fit_data (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            date DATE NOT NULL,
            steps INTEGER DEFAULT 0,
            calories INTEGER DEFAULT 0,
            active_minutes INTEGER DEFAULT 0,
            heart_rate_min INTEGER,
            heart_rate_avg INTEGER,
            heart_rate_max INTEGER,
            sleep_hours DECIMAL(4,2),
            distance_meters INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela google_fit_data criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela google_fit_data já existe!';
    END IF;
END $$;

-- 2. Adicionar colunas que podem estar faltando
ALTER TABLE google_fit_data 
ADD COLUMN IF NOT EXISTS steps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS calories INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS heart_rate_min INTEGER,
ADD COLUMN IF NOT EXISTS heart_rate_avg INTEGER,
ADD COLUMN IF NOT EXISTS heart_rate_max INTEGER,
ADD COLUMN IF NOT EXISTS sleep_hours DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS distance_meters INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_id ON google_fit_data(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_date ON google_fit_data(date);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_date ON google_fit_data(user_id, date);

-- 4. Adicionar RLS (Row Level Security)
ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS
DROP POLICY IF EXISTS "Users can view their own Google Fit data" ON google_fit_data;
CREATE POLICY "Users can view their own Google Fit data" ON google_fit_data
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own Google Fit data" ON google_fit_data;
CREATE POLICY "Users can insert their own Google Fit data" ON google_fit_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own Google Fit data" ON google_fit_data;
CREATE POLICY "Users can update their own Google Fit data" ON google_fit_data
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own Google Fit data" ON google_fit_data;
CREATE POLICY "Users can delete their own Google Fit data" ON google_fit_data
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_google_fit_data_updated_at ON google_fit_data;
CREATE TRIGGER update_google_fit_data_updated_at
    BEFORE UPDATE ON google_fit_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'google_fit_data'
ORDER BY ordinal_position;

-- 8. Mensagem de sucesso
SELECT 'Tabela google_fit_data corrigida com sucesso!' as status;
