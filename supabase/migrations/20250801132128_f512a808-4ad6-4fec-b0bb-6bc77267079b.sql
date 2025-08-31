-- Verificar se a tabela ai_configurations tem todas as configurações necessárias
INSERT INTO ai_configurations (functionality, service, model, max_tokens, temperature, is_enabled, preset_level) 
VALUES 
  ('chat_advanced', 'openai', 'gpt-4.1-2025-04-14', 2000, 0.8, true, 'maximo'),
  ('gemini_chat', 'gemini', 'gemini-1.5-pro', 2000, 0.7, true, 'maximo'),
  ('sofia_enhanced', 'gemini', 'gemini-1.5-flash', 1500, 0.8, true, 'maximo')
ON CONFLICT (functionality) DO UPDATE SET 
  model = EXCLUDED.model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  is_enabled = EXCLUDED.is_enabled,
  preset_level = EXCLUDED.preset_level;