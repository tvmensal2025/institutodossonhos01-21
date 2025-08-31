-- Executar este SQL diretamente no Supabase SQL Editor

-- 1. Criar tabela para log de uso de IA
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_name TEXT NOT NULL,
  characters_used INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10,6) NOT NULL DEFAULT 0,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  test_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_date ON ai_usage_logs(date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_ai_name ON ai_usage_logs(ai_name);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);

-- 3. Criar tabela para configurações de IA
CREATE TABLE IF NOT EXISTS ai_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  config_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Inserir configuração padrão de voz
INSERT INTO ai_configurations (name, config_data) 
VALUES (
  'voice_config',
  '{
    "speakingRate": 0.85,
    "pitch": 1.3,
    "volumeGainDb": 1.2,
    "voiceName": "pt-BR-Neural2-C",
    "isEnabled": true
  }'
) ON CONFLICT (name) DO UPDATE SET 
  config_data = EXCLUDED.config_data,
  updated_at = NOW();

-- 5. Verificar se as tabelas foram criadas
SELECT 'ai_usage_logs' as table_name, COUNT(*) as row_count FROM ai_usage_logs
UNION ALL
SELECT 'ai_configurations' as table_name, COUNT(*) as row_count FROM ai_configurations;
