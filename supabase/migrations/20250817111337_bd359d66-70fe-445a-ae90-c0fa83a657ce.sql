-- Remove configurações com modelos OpenAI problemáticos
DELETE FROM ai_configurations WHERE model IN ('o3-2025-04-16', 'o3-PRO');

-- Atualizar configurações para usar modelos válidos do OpenAI
UPDATE ai_configurations 
SET model = 'gpt-4.1-2025-04-14', 
    max_tokens = CASE 
      WHEN max_tokens > 4096 THEN 4096 
      ELSE max_tokens 
    END,
    updated_at = NOW()
WHERE service = 'openai' AND model NOT IN ('gpt-4.1-2025-04-14', 'gpt-5-2025-08-07', 'gpt-4o-mini', 'gpt-4o');

-- Adicionar configuração do Ollama se não existir
INSERT INTO ai_configurations (
  functionality,
  service,
  model,
  max_tokens,
  temperature,
  is_enabled,
  personality,
  level,
  priority,
  cost_per_request,
  created_at,
  updated_at
) VALUES 
('ollama_chat', 'ollama', 'llama3.1:8b-instruct-q4_0', 2048, 0.7, true, 'sofia', 'medio', 2, 0.0, NOW(), NOW())
ON CONFLICT (functionality) DO UPDATE SET
  service = EXCLUDED.service,
  model = EXCLUDED.model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = NOW();

-- Verificar configurações finais
SELECT functionality, service, model, max_tokens, temperature, is_enabled 
FROM ai_configurations 
ORDER BY functionality;