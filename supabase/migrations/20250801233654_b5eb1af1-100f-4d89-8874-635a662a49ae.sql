-- Inserir configurações de IA para ativar todas as funcionalidades
INSERT INTO ai_configurations (
  functionality, service, model, max_tokens, temperature, is_enabled, preset_level, 
  personality, level, priority, created_at, updated_at
) VALUES 
  ('medical_analysis', 'openai', 'o3-2025-04-16', 4096, 0.3, true, 'maximo', 'drvital', 'alto', 1, NOW(), NOW()),
  ('weekly_report', 'openai', 'o3-2025-04-16', 4096, 0.3, true, 'maximo', 'drvital', 'alto', 1, NOW(), NOW()),
  ('monthly_report', 'openai', 'o3-2025-04-16', 6144, 0.3, true, 'maximo', 'drvital', 'alto', 1, NOW(), NOW()),
  ('chat_daily', 'openai', 'gpt-4.1-2025-04-14', 2000, 0.8, true, 'medio', 'sofia', 'medio', 2, NOW(), NOW()),
  ('preventive_analysis', 'openai', 'o3-2025-04-16', 3072, 0.4, true, 'maximo', 'drvital', 'alto', 1, NOW(), NOW()),
  ('food_analysis', 'openai', 'gpt-4.1-2025-04-14', 2000, 0.7, true, 'medio', 'drvital', 'medio', 2, NOW(), NOW()),
  ('gemini_chat', 'gemini', 'gemini-1.5-pro', 2000, 0.7, true, 'maximo', 'sofia', 'alto', 1, NOW(), NOW()),
  ('sofia_enhanced', 'gemini', 'gemini-1.5-flash', 1500, 0.8, true, 'maximo', 'sofia', 'alto', 1, NOW(), NOW()),
  ('analysis', 'openai', 'gpt-4.1-2025-04-14', 1500, 0.3, true, 'precise', 'drvital', 'alto', 1, NOW(), NOW()),
  ('chat', 'openai', 'gpt-4.1-2025-04-14', 2000, 0.7, true, 'balanced', 'sofia', 'medio', 2, NOW(), NOW()),
  ('content_generation', 'openai', 'gpt-4.1-2025-04-14', 3000, 0.8, true, 'creative', 'sofia', 'medio', 2, NOW(), NOW())
ON CONFLICT (functionality) DO UPDATE SET
  service = EXCLUDED.service,
  model = EXCLUDED.model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  is_enabled = EXCLUDED.is_enabled,
  preset_level = EXCLUDED.preset_level,
  personality = EXCLUDED.personality,
  level = EXCLUDED.level,
  priority = EXCLUDED.priority,
  updated_at = NOW();

-- Criar tabela company_data se não existir para resolver o erro 406
CREATE TABLE IF NOT EXISTS company_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT DEFAULT 'Mission Health Nexus',
  company_description TEXT DEFAULT 'Plataforma de saúde e bem-estar',
  admin_email TEXT DEFAULT 'admin@missionhealth.com',
  max_users INTEGER DEFAULT 1000,
  subscription_plan TEXT DEFAULT 'premium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados padrão da empresa
INSERT INTO company_data (company_name, company_description, admin_email, max_users, subscription_plan)
VALUES ('Mission Health Nexus', 'Plataforma completa de saúde e bem-estar com IA avançada', 'admin@missionhealth.com', 10000, 'enterprise')
ON CONFLICT DO NOTHING;

-- Habilitar RLS na tabela company_data
ALTER TABLE company_data ENABLE ROW LEVEL SECURITY;

-- Política para admins poderem acessar dados da empresa
CREATE POLICY "Admins can access company data" ON company_data
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);