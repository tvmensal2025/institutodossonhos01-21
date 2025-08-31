-- Criar tabela para log de uso de IA
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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_date ON ai_usage_logs(date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_ai_name ON ai_usage_logs(ai_name);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);

-- Criar tabela para configurações de IA
CREATE TABLE IF NOT EXISTS ai_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  config_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ai_configurations_updated_at 
    BEFORE UPDATE ON ai_configurations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_usage_logs (apenas admins podem ver)
CREATE POLICY "Admins can view ai_usage_logs" ON ai_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert ai_usage_logs" ON ai_usage_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Políticas para ai_configurations (apenas admins podem gerenciar)
CREATE POLICY "Admins can manage ai_configurations" ON ai_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Inserir configuração padrão de voz
INSERT INTO ai_configurations (name, config_data) 
VALUES (
  'voice_config',
  '{
    "speakingRate": 0.70,
    "pitch": 1.3,
    "volumeGainDb": 1.2,
    "voiceName": "pt-BR-Neural2-C",
    "isEnabled": true
  }'
) ON CONFLICT (name) DO NOTHING;
