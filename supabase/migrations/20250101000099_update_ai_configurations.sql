-- Atualizar tabela ai_configurations para suportar personalidades e níveis
-- Adicionar colunas para personalidade e nível

-- Adicionar coluna personality
ALTER TABLE ai_configurations 
ADD COLUMN IF NOT EXISTS personality VARCHAR(20) DEFAULT 'drvital';

-- Adicionar coluna level
ALTER TABLE ai_configurations 
ADD COLUMN IF NOT EXISTS level VARCHAR(20) DEFAULT 'meio';

-- Criar tabela para documentos de IA
CREATE TABLE IF NOT EXISTS ai_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'guide',
  content TEXT NOT NULL,
  functionality VARCHAR(100) NOT NULL DEFAULT 'general',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ai_documents_functionality ON ai_documents(functionality);
CREATE INDEX IF NOT EXISTS idx_ai_documents_type ON ai_documents(type);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_personality ON ai_configurations(personality);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_level ON ai_configurations(level);

-- Atualizar configurações existentes com valores padrão
UPDATE ai_configurations 
SET personality = 'drvital', level = 'meio' 
WHERE personality IS NULL OR level IS NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN ai_configurations.personality IS 'Personalidade da IA: drvital ou sofia';
COMMENT ON COLUMN ai_configurations.level IS 'Nível de configuração: maximo, meio, minimo';
COMMENT ON TABLE ai_documents IS 'Documentos da base de conhecimento para IAs';
COMMENT ON COLUMN ai_documents.type IS 'Tipo do documento: medical, policy, guide, faq';
COMMENT ON COLUMN ai_documents.functionality IS 'Função específica ou general para todas'; 