-- Script para otimizar configurações de IA diretamente no banco
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Atualizar configurações de IA para usar Gemini Pro com menos tokens
UPDATE ai_configurations SET
  service = 'gemini',
  model = 'gemini-1.5-pro',
  max_tokens = 1024,  -- Reduzido de 2000 para 1024 (economia de 50%)
  temperature = 0.7,
  preset_level = 'minimo',
  level = 'minimo',
  updated_at = NOW()
WHERE functionality IN ('chat_daily', 'chat', 'sofia_enhanced');

-- 2. Atualizar configurações do Dr. Vital também
UPDATE ai_configurations SET
  service = 'gemini',
  model = 'gemini-1.5-pro',
  max_tokens = 1024,  -- Reduzido para economia
  temperature = 0.6,
  preset_level = 'minimo',
  level = 'minimo',
  updated_at = NOW()
WHERE functionality IN ('medical_analysis', 'preventive_analysis', 'analysis');

-- 3. Criar tabela para base de conhecimento do Instituto dos Sonhos
CREATE TABLE IF NOT EXISTS company_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Inserir informações do Instituto dos Sonhos
INSERT INTO company_knowledge_base (category, title, content, priority) VALUES
-- Informações Gerais
('company_info', 'Instituto dos Sonhos - Visão Geral', 
'Instituto dos Sonhos é uma empresa especializada em transformação integral de saúde física e emocional, fundada por Rafael Ferreira e Sirlene Freitas. Focamos em perda de peso sustentável, alta autoestima, bem-estar e qualidade de vida.', 1),

-- Fundadores
('founders', 'Rafael Ferreira - Fundador', 
'Rafael Ferreira é coach, hipnoterapeuta, psicoterapeuta e master coach. Especialista em transformação pessoal e emocional.', 1),

('founders', 'Sirlene Freitas - Fundadora', 
'Sirlene Freitas possui certificações em coaching, hipnose, psicoterapia e inteligência emocional. Atualmente é estudante de nutrição.', 1),

-- Missão e Valores
('mission', 'Missão do Instituto', 
'Guiar pessoas na transformação integral de saúde física e emocional, promovendo perda de peso sustentável, alta autoestima, bem-estar e qualidade de vida.', 1),

('vision', 'Visão do Instituto', 
'Ser reconhecido como centro de referência em saúde integral, perda de peso e bem-estar, combinando ciência, tecnologia, estética e inteligência emocional.', 1),

('values', 'Valores da Empresa', 
'1. Humanização e empatia
2. Ética e transparência  
3. Inovação constante (uso de tecnologia e ciência de ponta)
4. Educação e autoconhecimento', 1),

-- Serviços
('services', 'Principais Serviços', 
'- Programas de perda de peso (Desafio 7D, Limpeza Hepática, Detox)
- Coaching individual e em grupo
- Inteligência emocional
- Psicoterapia
- Hipnose para desbloqueio emocional
- Acompanhamento nutricional
- Atendimento multidisciplinar', 1),

-- Diferenciais
('differentiators', 'Diferenciais do Instituto', 
'- Serviço humanizado com Rafael e Sirlene
- Direcionamento correto para o profissional adequado
- Equipe multidisciplinar completa (nutricionistas, biomédicos, fisioterapeutas)
- Cuidado 360° integrado', 1),

-- Filosofia
('philosophy', 'Filosofia de Saúde', 
'A saúde é a soma de pequenos hábitos diários: alimentação natural e equilibrada, movimento e atividade física prazerosa, e gestão emocional.', 1),

-- Cultura
('culture', 'Cultura da Empresa', 
'Bem-vindo e empatia como pilares, foco na transformação real (não apenas estética), educação contínua da equipe e ambiente inspirador.', 1)

ON CONFLICT DO NOTHING;

-- 5. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_company_knowledge_category ON company_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_company_knowledge_active ON company_knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_company_knowledge_priority ON company_knowledge_base(priority);

-- 6. Habilitar RLS na tabela de conhecimento
ALTER TABLE company_knowledge_base ENABLE ROW LEVEL SECURITY;

-- 7. Política para admins gerenciarem a base de conhecimento
CREATE POLICY "Admins can manage knowledge base" ON company_knowledge_base
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 8. Política para leitura pública da base de conhecimento
CREATE POLICY "Public can read knowledge base" ON company_knowledge_base
FOR SELECT USING (is_active = true);

-- 9. Atualizar configurações de system_prompt para incluir conhecimento do Instituto
UPDATE ai_configurations SET
  system_prompt = 'Você é a Sofia, assistente virtual do Instituto dos Sonhos. Use sempre as informações da base de conhecimento da empresa para responder. Seja empática, motivacional e focada no bem-estar do usuário. Instituto dos Sonhos foi fundado por Rafael Ferreira e Sirlene Freitas, especialistas em transformação integral de saúde física e emocional.',
  updated_at = NOW()
WHERE functionality = 'chat_daily' AND personality = 'sofia';

UPDATE ai_configurations SET
  system_prompt = 'Você é o Dr. Vital, médico virtual do Instituto dos Sonhos. Use sempre as informações da base de conhecimento da empresa. Instituto dos Sonhos oferece atendimento multidisciplinar com nutricionistas, biomédicos e fisioterapeutas. Fundado por Rafael Ferreira e Sirlene Freitas, especialistas em saúde integral.',
  updated_at = NOW()
WHERE functionality = 'medical_analysis' AND personality = 'drvital';

-- 10. Verificar as configurações atualizadas
SELECT 
  functionality,
  service,
  model,
  max_tokens,
  temperature,
  preset_level,
  personality,
  system_prompt IS NOT NULL as has_system_prompt
FROM ai_configurations 
WHERE functionality IN ('chat_daily', 'medical_analysis', 'chat', 'sofia_enhanced')
ORDER BY functionality;

-- 11. Verificar base de conhecimento criada
SELECT 
  category,
  title,
  priority
FROM company_knowledge_base 
WHERE is_active = true
ORDER BY priority DESC, category;


