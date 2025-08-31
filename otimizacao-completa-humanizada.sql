-- OTIMIZAÇÃO COMPLETA: Gemini Pro + Respostas Humanizadas + Base de Conhecimento
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. CONFIGURAÇÕES DE IA OTIMIZADAS
-- ========================================

-- Sofia: Gemini Pro com respostas concisas e humanizadas
UPDATE ai_configurations SET
  service = 'gemini',
  model = 'gemini-1.5-pro',
  max_tokens = 512,  -- Respostas curtas e objetivas
  temperature = 0.8, -- Mais criatividade e naturalidade
  preset_level = 'minimo',
  level = 'minimo',
  system_prompt = 'Você é a Sofia, nutricionista virtual do Instituto dos Sonhos. Seja EMPÁTICA, MOTIVACIONAL e CONCISA. Use linguagem simples e direta, como uma amiga conversando. Evite textos longos - seja objetiva e calorosa. Use emojis ocasionalmente para ser mais humana. Foque no bem-estar e motivação do usuário. Instituto dos Sonhos foi fundado por Rafael Ferreira e Sirlene Freitas.',
  updated_at = NOW()
WHERE functionality IN ('chat_daily', 'chat', 'sofia_enhanced');

-- Dr. Vital: Gemini Pro com respostas diretas
UPDATE ai_configurations SET
  service = 'gemini',
  model = 'gemini-1.5-pro',
  max_tokens = 512,  -- Respostas curtas
  temperature = 0.6, -- Mais preciso
  preset_level = 'minimo',
  level = 'minimo',
  system_prompt = 'Você é o Dr. Vital, médico virtual do Instituto dos Sonhos. Seja DIRETO, PROFISSIONAL e CONCISO. Use linguagem simples, evite textos longos. Foque em recomendações práticas e seguras. Instituto dos Sonhos oferece atendimento multidisciplinar.',
  updated_at = NOW()
WHERE functionality IN ('medical_analysis', 'preventive_analysis', 'analysis');

-- ========================================
-- 2. BASE DE CONHECIMENTO DO INSTITUTO
-- ========================================

-- Criar tabela se não existir
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

-- Inserir informações essenciais do Instituto
INSERT INTO company_knowledge_base (category, title, content, priority) VALUES
-- Informações principais
('company_info', 'Instituto dos Sonhos', 
'Instituto dos Sonhos: transformação integral de saúde física e emocional. Fundado por Rafael Ferreira e Sirlene Freitas. Foco em perda de peso sustentável, autoestima e bem-estar.', 1),

-- Fundadores
('founders', 'Rafael Ferreira', 
'Rafael Ferreira: coach, hipnoterapeuta, psicoterapeuta e master coach. Especialista em transformação pessoal.', 1),

('founders', 'Sirlene Freitas', 
'Sirlene Freitas: certificações em coaching, hipnose, psicoterapia e inteligência emocional. Estudante de nutrição.', 1),

-- Serviços principais
('services', 'Serviços Principais', 
'Programas de perda de peso (Desafio 7D, Limpeza Hepática, Detox), coaching, inteligência emocional, psicoterapia, hipnose, acompanhamento nutricional.', 1),

-- Diferenciais
('differentiators', 'Diferenciais', 
'Serviço humanizado com Rafael e Sirlene, equipe multidisciplinar (nutricionistas, biomédicos, fisioterapeutas), cuidado 360° integrado.', 1),

-- Filosofia
('philosophy', 'Filosofia', 
'Saúde = pequenos hábitos diários. Alimentação natural, movimento prazeroso, gestão emocional.', 1)

ON CONFLICT DO NOTHING;

-- ========================================
-- 3. CONFIGURAÇÕES DE SEGURANÇA
-- ========================================

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_company_knowledge_category ON company_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_company_knowledge_active ON company_knowledge_base(is_active);

-- Habilitar RLS
ALTER TABLE company_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Admins can manage knowledge base" ON company_knowledge_base
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Public can read knowledge base" ON company_knowledge_base
FOR SELECT USING (is_active = true);

-- ========================================
-- 4. VERIFICAÇÃO DAS CONFIGURAÇÕES
-- ========================================

-- Verificar configurações de IA
SELECT 
  'IA Configurações' as tipo,
  functionality,
  service,
  model,
  max_tokens,
  temperature,
  personality
FROM ai_configurations 
WHERE functionality IN ('chat_daily', 'medical_analysis')
ORDER BY functionality;

-- Verificar base de conhecimento
SELECT 
  'Base de Conhecimento' as tipo,
  category,
  title,
  priority
FROM company_knowledge_base 
WHERE is_active = true
ORDER BY priority DESC, category;

-- ========================================
-- 5. RESUMO DAS OTIMIZAÇÕES
-- ========================================

-- Mostrar economia de tokens
SELECT 
  'RESUMO DAS OTIMIZAÇÕES' as info,
  'Sofia: Gemini Pro (512 tokens) - 75% economia' as detalhe
UNION ALL
SELECT 
  'RESUMO DAS OTIMIZAÇÕES' as info,
  'Dr. Vital: Gemini Pro (512 tokens) - 75% economia' as detalhe
UNION ALL
SELECT 
  'RESUMO DAS OTIMIZAÇÕES' as info,
  'Respostas: Mais humanizadas e concisas' as detalhe
UNION ALL
SELECT 
  'RESUMO DAS OTIMIZAÇÕES' as info,
  'Base de conhecimento: Instituto dos Sonhos' as detalhe;


