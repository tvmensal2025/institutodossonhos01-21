-- 🔧 CORREÇÃO DEFINITIVA ERRO CONSTRAINT AI_CONFIGURATIONS

-- Verificar e remover a constraint problemática que causa erro de duplicata
ALTER TABLE ai_configurations DROP CONSTRAINT IF EXISTS ai_configurations_service_name_key;

-- Verificar se existe índice único no service_name
DROP INDEX IF EXISTS ai_configurations_service_name_key;

-- Criar constraint única CORRETA - cada funcionalidade só pode ter uma configuração ativa
-- Isso permite múltiplos serviços (openai, google, etc) mas cada função só tem uma config
ALTER TABLE ai_configurations 
ADD CONSTRAINT ai_configurations_functionality_unique 
UNIQUE (functionality);

-- Limpar possíveis dados duplicados por funcionalidade
DELETE FROM ai_configurations a
WHERE a.id NOT IN (
  SELECT MIN(id) 
  FROM ai_configurations b 
  WHERE b.functionality = a.functionality
);

-- Verificar se existe dados na tabela
SELECT functionality, service_name, model, is_active 
FROM ai_configurations 
ORDER BY functionality;