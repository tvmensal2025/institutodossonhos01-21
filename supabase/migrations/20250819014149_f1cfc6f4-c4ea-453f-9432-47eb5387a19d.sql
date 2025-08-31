-- Garantir unicidade por funcionalidade
CREATE UNIQUE INDEX IF NOT EXISTS ai_configurations_functionality_unique 
ON ai_configurations(functionality) 
WHERE functionality IS NOT NULL;

-- Upsert das configurações padrão
INSERT INTO ai_configurations (functionality, service_name, model, max_tokens, temperature, is_active, preset_level)
VALUES
('chat_daily', 'openai', 'gpt-4o', 4000, 0.8, true, 'maximo'),
('weekly_report', 'openai', 'gpt-4o', 8192, 0.8, true, 'maximo'),
('monthly_report', 'openai', 'gpt-4o', 8192, 0.7, true, 'maximo'),
('medical_analysis', 'openai', 'gpt-4o', 8192, 0.3, true, 'maximo'),
('preventive_analysis', 'openai', 'gpt-4o', 8192, 0.5, true, 'maximo'),
('food_analysis', 'openai', 'gpt-4o', 4000, 0.7, true, 'maximo'),
('daily_missions', 'openai', 'gpt-4o', 4000, 0.8, true, 'maximo'),
('whatsapp_reports', 'openai', 'gpt-4o', 4000, 0.7, true, 'maximo'),
('email_reports', 'openai', 'gpt-4o', 4000, 0.7, true, 'maximo')
ON CONFLICT (functionality) DO UPDATE SET
  service_name = EXCLUDED.service_name,
  model = EXCLUDED.model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  preset_level = EXCLUDED.preset_level,
  is_active = EXCLUDED.is_active,
  updated_at = now();