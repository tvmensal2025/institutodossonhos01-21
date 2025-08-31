-- Corrigir estrutura da tabela ai_configurations para restaurar funcionalidade completa
-- Primeiro, verificar se a coluna functionality existe
DO $$ 
BEGIN
    -- Adicionar coluna functionality se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_configurations' AND column_name='functionality') THEN
        ALTER TABLE ai_configurations ADD COLUMN functionality TEXT;
    END IF;
    
    -- Adicionar coluna service se não existir  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_configurations' AND column_name='service') THEN
        ALTER TABLE ai_configurations ADD COLUMN service TEXT;
    END IF;
    
    -- Adicionar coluna is_enabled se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_configurations' AND column_name='is_enabled') THEN
        ALTER TABLE ai_configurations ADD COLUMN is_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Limpar dados existentes para recriar estrutura correta
DELETE FROM ai_configurations;

-- Inserir configurações padrão do sistema
INSERT INTO ai_configurations (functionality, service, model, max_tokens, temperature, is_enabled, preset_level) VALUES
('chat_daily', 'openai', 'gpt-4o', 4000, 0.8, true, 'maximo'),
('weekly_report', 'openai', 'gpt-4o', 8192, 0.8, true, 'maximo'),
('monthly_report', 'openai', 'gpt-4o', 8192, 0.7, true, 'maximo'), 
('medical_analysis', 'openai', 'gpt-4o', 8192, 0.3, true, 'maximo'),
('preventive_analysis', 'openai', 'gpt-4o', 8192, 0.5, true, 'maximo'),
('food_analysis', 'openai', 'gpt-4o', 4000, 0.7, true, 'maximo'),
('daily_missions', 'openai', 'gpt-4o', 4000, 0.8, true, 'maximo'),
('whatsapp_reports', 'openai', 'gpt-4o', 4000, 0.7, true, 'maximo'),
('email_reports', 'openai', 'gpt-4o', 4000, 0.7, true, 'maximo');

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ai_configurations_functionality ON ai_configurations(functionality);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_is_enabled ON ai_configurations(is_enabled);

-- Verificar dados inseridos
SELECT functionality, service, model, max_tokens, temperature, preset_level, is_enabled 
FROM ai_configurations 
ORDER BY functionality;