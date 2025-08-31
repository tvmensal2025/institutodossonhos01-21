-- Corrigir configurações de IA que estão faltando
-- Inserir configurações para weekly_report, monthly_report e preventive_analysis

INSERT INTO ai_configurations (functionality, service, model, max_tokens, temperature, is_enabled, preset_level) VALUES
('weekly_report', 'gemini', 'gemini-1.5-pro', 8192, 0.7, true, 'maximo'),
('monthly_report', 'gemini', 'gemini-1.5-pro', 8192, 0.6, true, 'maximo'),
('preventive_analysis', 'gemini', 'gemini-1.5-pro', 8192, 0.6, true, 'maximo')
ON CONFLICT (functionality) DO UPDATE SET
  service = EXCLUDED.service,
  model = EXCLUDED.model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  is_enabled = EXCLUDED.is_enabled,
  preset_level = EXCLUDED.preset_level,
  updated_at = now(); 