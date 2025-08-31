-- Corrigir modelos obsoletos e configurações inconsistentes

-- Atualizar modelos obsoletos para modelos válidos
UPDATE ai_configurations 
SET model = 'gpt-4.1-2025-04-14' 
WHERE model IN ('gpt-4', 'gpt-4o') AND service = 'openai';

-- Corrigir food_analysis para usar OpenAI ao invés de Gemini
UPDATE ai_configurations 
SET service = 'openai', model = 'gpt-4.1-2025-04-14' 
WHERE functionality = 'food_analysis';

-- Verificar configurações finais
SELECT functionality, service, model, is_enabled, max_tokens, temperature 
FROM ai_configurations 
WHERE is_enabled = true 
ORDER BY functionality;