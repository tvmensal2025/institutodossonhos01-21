-- Inserir configurações de IA básicas
INSERT INTO ai_configurations (
  functionality, service, model, max_tokens, temperature, is_enabled, preset_level, created_at, updated_at
) VALUES 
  ('medical_analysis', 'openai', 'o3-2025-04-16', 4096, 0.3, true, 'maximo', NOW(), NOW()),
  ('weekly_report', 'openai', 'o3-2025-04-16', 4096, 0.3, true, 'maximo', NOW(), NOW()),
  ('monthly_report', 'openai', 'o3-2025-04-16', 6144, 0.3, true, 'maximo', NOW(), NOW()),
  ('chat_daily', 'openai', 'gpt-4.1-2025-04-14', 2000, 0.8, true, 'medio', NOW(), NOW()),
  ('preventive_analysis', 'openai', 'o3-2025-04-16', 3072, 0.4, true, 'maximo', NOW(), NOW()),
  ('food_analysis', 'openai', 'gpt-4.1-2025-04-14', 2000, 0.7, true, 'medio', NOW(), NOW()),
  ('gemini_chat', 'gemini', 'gemini-1.5-pro', 2000, 0.7, true, 'maximo', NOW(), NOW()),
  ('sofia_enhanced', 'gemini', 'gemini-1.5-flash', 1500, 0.8, true, 'maximo', NOW(), NOW()),
  ('analysis', 'openai', 'gpt-4.1-2025-04-14', 1500, 0.3, true, 'precise', NOW(), NOW()),
  ('chat', 'openai', 'gpt-4.1-2025-04-14', 2000, 0.7, true, 'balanced', NOW(), NOW()),
  ('content_generation', 'openai', 'gpt-4.1-2025-04-14', 3000, 0.8, true, 'creative', NOW(), NOW())
ON CONFLICT (functionality) DO UPDATE SET
  service = EXCLUDED.service,
  model = EXCLUDED.model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  is_enabled = EXCLUDED.is_enabled,
  preset_level = EXCLUDED.preset_level,
  updated_at = NOW();