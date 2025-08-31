-- Habilitar RLS nas tabelas que não têm mas deveriam ter
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_measurements ENABLE ROW LEVEL SECURITY;

-- Criar tabela company_data se não existir para resolver erro 406
CREATE TABLE IF NOT EXISTS company_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT DEFAULT 'Mission Health Nexus',
  description TEXT DEFAULT 'Plataforma de saúde e bem-estar',
  contact_email TEXT DEFAULT 'admin@missionhealth.com',
  phone TEXT,
  address TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Inserir dados padrão da empresa se não existir
INSERT INTO company_data (company_name, description, contact_email)
VALUES ('Mission Health Nexus', 'Plataforma completa de saúde e bem-estar com IA avançada', 'admin@missionhealth.com')
ON CONFLICT DO NOTHING;