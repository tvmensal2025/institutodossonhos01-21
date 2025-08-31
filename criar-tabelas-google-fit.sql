-- Criar tabelas do Google Fit
-- Execute este SQL no Supabase SQL Editor

-- 1. Tabela para tokens do Google Fit
CREATE TABLE IF NOT EXISTS google_fit_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Tabela para dados do Google Fit
CREATE TABLE IF NOT EXISTS google_fit_data (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  value REAL,
  unit TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  source TEXT,
  active_minutes INTEGER DEFAULT 0,
  sleep_duration_hours DECIMAL(4,2) DEFAULT 0,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  heart_rate_resting INTEGER,
  heart_rate_max INTEGER,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS nas tabelas
ALTER TABLE google_fit_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS para google_fit_tokens
DROP POLICY IF EXISTS "Users can manage their own Google Fit tokens" ON google_fit_tokens;
CREATE POLICY "Users can manage their own Google Fit tokens" ON google_fit_tokens
  FOR ALL USING (auth.uid() = user_id);

-- 5. Criar políticas RLS para google_fit_data
DROP POLICY IF EXISTS "Users can manage their own Google Fit data" ON google_fit_data;
CREATE POLICY "Users can manage their own Google Fit data" ON google_fit_data
  FOR ALL USING (auth.uid() = user_id);

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_google_fit_tokens_user ON google_fit_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user ON google_fit_data(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_type ON google_fit_data(data_type);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_date ON google_fit_data(start_time);

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_google_fit_tokens_updated_at ON google_fit_tokens;
CREATE TRIGGER update_google_fit_tokens_updated_at
    BEFORE UPDATE ON google_fit_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Verificar se as tabelas foram criadas
SELECT 
  'google_fit_tokens' as table_name,
  COUNT(*) as row_count
FROM google_fit_tokens
UNION ALL
SELECT 
  'google_fit_data' as table_name,
  COUNT(*) as row_count
FROM google_fit_data;
