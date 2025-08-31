-- Criar tabela ai_configurations
CREATE TABLE IF NOT EXISTS ai_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  functionality VARCHAR(100) NOT NULL UNIQUE,
  service VARCHAR(50) NOT NULL DEFAULT 'openai',
  model VARCHAR(100) NOT NULL DEFAULT 'gpt-4',
  max_tokens INTEGER NOT NULL DEFAULT 4096,
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.8,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  system_prompt TEXT,
  personality VARCHAR(20) DEFAULT 'drvital',
  level VARCHAR(20) DEFAULT 'meio',
  cost_per_request DECIMAL(10,6) DEFAULT 0.01,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ai_configurations_functionality ON ai_configurations(functionality);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_service ON ai_configurations(service);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_enabled ON ai_configurations(is_enabled);

-- Inserir configurações padrão para todas as funcionalidades
INSERT INTO ai_configurations (functionality, service, model, max_tokens, temperature, is_enabled, personality, level, priority) VALUES
('medical_analysis', 'openai', 'gpt-4', 4096, 0.8, false, 'drvital', 'meio', 1),
('weekly_report', 'openai', 'gpt-4', 4096, 0.8, false, 'sofia', 'meio', 1),
('monthly_report', 'openai', 'gpt-4', 4096, 0.8, false, 'drvital', 'meio', 1),
('daily_chat', 'openai', 'gpt-4', 4096, 0.8, false, 'sofia', 'meio', 1),
('preventive_analysis', 'openai', 'gpt-4', 4096, 0.8, false, 'drvital', 'meio', 1),
('food_analysis', 'openai', 'gpt-4', 4096, 0.8, false, 'drvital', 'meio', 1),
('daily_missions', 'openai', 'gpt-4', 4096, 0.8, false, 'sofia', 'meio', 1),
('whatsapp_reports', 'openai', 'gpt-4', 4096, 0.8, false, 'sofia', 'meio', 1),
('email_reports', 'openai', 'gpt-4', 4096, 0.8, false, 'drvital', 'meio', 1)
ON CONFLICT (functionality) DO NOTHING;

-- Adicionar comentários para documentação
COMMENT ON TABLE ai_configurations IS 'Configurações de IA para diferentes funcionalidades';
COMMENT ON COLUMN ai_configurations.functionality IS 'Nome da funcionalidade (ex: medical_analysis)';
COMMENT ON COLUMN ai_configurations.service IS 'Serviço de IA (openai, gemini, sofia)';
COMMENT ON COLUMN ai_configurations.model IS 'Modelo específico do serviço';
COMMENT ON COLUMN ai_configurations.max_tokens IS 'Número máximo de tokens';
COMMENT ON COLUMN ai_configurations.temperature IS 'Temperatura para criatividade (0-2)';
COMMENT ON COLUMN ai_configurations.is_enabled IS 'Se a funcionalidade está ativa';
COMMENT ON COLUMN ai_configurations.system_prompt IS 'Prompt do sistema personalizado';
COMMENT ON COLUMN ai_configurations.personality IS 'Personalidade da IA (drvital, sofia)';
COMMENT ON COLUMN ai_configurations.level IS 'Nível de configuração (maximo, meio, minimo)';
COMMENT ON COLUMN ai_configurations.cost_per_request IS 'Custo estimado por request';
COMMENT ON COLUMN ai_configurations.priority IS 'Prioridade da funcionalidade (1-4)'; 