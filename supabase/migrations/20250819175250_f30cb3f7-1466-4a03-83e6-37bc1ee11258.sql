-- 🔧 CORREÇÃO ERRO CONSTRAINT AI_CONFIGURATIONS

-- Verificar constraints existentes
SELECT constraint_name, constraint_type, column_name 
FROM information_schema.constraint_column_usage 
WHERE table_name = 'ai_configurations';

-- Remover a constraint problemática que está causando o erro
DROP INDEX IF EXISTS idx_ai_configurations_service_name_unique;
ALTER TABLE ai_configurations DROP CONSTRAINT IF EXISTS ai_configurations_service_name_key;

-- Criar constraint única correta (functionality + service_name)
-- Isso permite múltiplos serviços, mas cada funcionalidade só pode ter um serviço ativo
ALTER TABLE ai_configurations 
ADD CONSTRAINT ai_configurations_functionality_unique 
UNIQUE (functionality);

-- Limpar dados duplicados se existirem
DELETE FROM ai_configurations a
USING ai_configurations b 
WHERE a.id > b.id 
  AND a.functionality = b.functionality;

-- Verificar estrutura final
SELECT * FROM ai_configurations LIMIT 5;