-- Atualizar tabela de configurações de IA com presets inteligentes
DELETE FROM ai_configurations; -- Limpar configurações antigas

-- Inserir configurações pré-definidas para diferentes níveis
INSERT INTO ai_configurations (functionality, service, model, max_tokens, temperature, is_enabled) VALUES

-- GEMINI - MÁXIMO PODER (Mais Inteligente)
('chat_daily', 'gemini', 'gemini-1.5-pro', 8192, 0.7, true),
('weekly_report', 'gemini', 'gemini-1.5-pro', 8192, 0.7, true),
('monthly_report', 'gemini', 'gemini-1.5-pro', 8192, 0.6, true),
('medical_analysis', 'gemini', 'gemini-1.5-pro', 8192, 0.5, true),
('preventive_analysis', 'gemini', 'gemini-1.5-pro', 8192, 0.6, true),

-- CHATGPT - MEIO TERMO (Equilibrado)
('chat_daily_backup', 'openai', 'gpt-4.1-2025-04-14', 4096, 0.7, false),
('weekly_report_backup', 'openai', 'gpt-4.1-2025-04-14', 4096, 0.7, false),
('monthly_report_backup', 'openai', 'gpt-4.1-2025-04-14', 4096, 0.6, false),

-- CHATGPT MINI - MÍNIMO (Mais Rápido/Económico)
('chat_daily_mini', 'openai', 'gpt-4.1-mini-2025-04-14', 2048, 0.7, false),
('weekly_report_mini', 'openai', 'gpt-4.1-mini-2025-04-14', 2048, 0.7, false);

-- Criar tabela para presets de configuração
CREATE TABLE IF NOT EXISTS ai_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_name text NOT NULL,
  preset_level text NOT NULL, -- 'minimo', 'meio', 'maximo'
  service text NOT NULL, -- 'openai' ou 'gemini'
  model text NOT NULL,
  max_tokens integer NOT NULL,
  temperature numeric NOT NULL,
  description text,
  is_recommended boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Inserir presets pré-configurados
INSERT INTO ai_presets (preset_name, preset_level, service, model, max_tokens, temperature, description, is_recommended) VALUES

-- NÍVEL MÁXIMO (Mais Inteligente)
('Gemini 1.5 Pro - Máximo', 'maximo', 'gemini', 'gemini-1.5-pro', 8192, 0.7, 'IA mais poderosa - Análises profundas e insights avançados', true),
('ChatGPT 4.1 - Máximo', 'maximo', 'openai', 'gpt-4.1-2025-04-14', 4096, 0.7, 'IA robusta - Excelente para análises detalhadas', false),

-- NÍVEL MEIO (Equilibrado)
('ChatGPT 4.1 - Meio', 'meio', 'openai', 'gpt-4.1-2025-04-14', 2048, 0.7, 'Equilibrio perfeito entre qualidade e velocidade', true),
('Gemini 1.5 Pro - Meio', 'meio', 'gemini', 'gemini-1.5-pro', 4096, 0.7, 'Inteligência superior com economia de tokens', false),

-- NÍVEL MÍNIMO (Mais Rápido)
('ChatGPT 4.1 Mini - Mínimo', 'minimo', 'openai', 'gpt-4.1-mini-2025-04-14', 1024, 0.7, 'Mais rápido e econômico - Respostas básicas', true),
('Gemini 1.5 Pro - Mínimo', 'minimo', 'gemini', 'gemini-1.5-pro', 2048, 0.7, 'Inteligência superior com tokens limitados', false);

-- Habilitar RLS na nova tabela
ALTER TABLE ai_presets ENABLE ROW LEVEL SECURITY;

-- Política RLS para ai_presets
CREATE POLICY "Only admins can manage AI presets" ON ai_presets
  FOR ALL USING (is_admin_user());

-- Adicionar coluna para indicar qual preset está ativo
ALTER TABLE ai_configurations 
ADD COLUMN IF NOT EXISTS preset_level text DEFAULT 'maximo',
ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT true;