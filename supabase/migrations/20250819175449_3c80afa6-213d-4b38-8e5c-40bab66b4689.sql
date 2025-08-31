-- 🔧 CORREÇÃO FINAL ERRO CONSTRAINT AI_CONFIGURATIONS

-- Remover constraint problemática que impede inserção de serviços duplicados
ALTER TABLE ai_configurations DROP CONSTRAINT IF EXISTS ai_configurations_service_name_key;

-- Remover índice único se existir
DROP INDEX IF EXISTS ai_configurations_service_name_key;

-- Limpar tabela e recriar com dados limpos
TRUNCATE TABLE ai_configurations;

-- Inserir configurações padrão sem conflitos
INSERT INTO ai_configurations (
  functionality, service_name, model, max_tokens, temperature, is_active, preset_level
) VALUES 
  ('chat_daily', 'openai', 'gpt-4o', 2000, 0.7, true, 'maximo'),
  ('weekly_report', 'openai', 'gpt-4o', 4000, 0.8, true, 'maximo'),
  ('monthly_report', 'openai', 'gpt-4o', 4000, 0.7, true, 'maximo'),
  ('medical_analysis', 'openai', 'gpt-4o', 6000, 0.3, true, 'maximo'),
  ('preventive_analysis', 'openai', 'gpt-4o', 4000, 0.5, true, 'maximo')
ON CONFLICT DO NOTHING;

-- Agora criar constraint correta - funcionalidade única
ALTER TABLE ai_configurations 
ADD CONSTRAINT ai_configurations_functionality_unique 
UNIQUE (functionality);

-- Verificar resultado
SELECT functionality, service_name, model, is_active FROM ai_configurations;