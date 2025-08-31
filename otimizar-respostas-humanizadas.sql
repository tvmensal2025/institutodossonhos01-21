-- Otimizar respostas da Sofia para serem mais humanizadas e concisas

-- 1. Reduzir ainda mais os tokens para respostas mais curtas
UPDATE ai_configurations SET
  max_tokens = 512,  -- Reduzido de 1024 para 512 (respostas mais curtas)
  temperature = 0.8, -- Aumentado para mais criatividade
  updated_at = NOW()
WHERE functionality IN ('chat_daily', 'chat', 'sofia_enhanced');

-- 2. Atualizar system prompt da Sofia para respostas mais humanizadas
UPDATE ai_configurations SET
  system_prompt = 'Você é a Sofia, nutricionista virtual do Instituto dos Sonhos. Seja EMPÁTICA, MOTIVACIONAL e CONCISA. Use linguagem simples e direta, como uma amiga conversando. Evite textos longos - seja objetiva e calorosa. Use emojis ocasionalmente para ser mais humana. Foque no bem-estar e motivação do usuário. Instituto dos Sonhos foi fundado por Rafael Ferreira e Sirlene Freitas.',
  updated_at = NOW()
WHERE functionality = 'chat_daily' AND personality = 'sofia';

-- 3. Atualizar system prompt do Dr. Vital também
UPDATE ai_configurations SET
  system_prompt = 'Você é o Dr. Vital, médico virtual do Instituto dos Sonhos. Seja DIRETO, PROFISSIONAL e CONCISO. Use linguagem simples, evite textos longos. Foque em recomendações práticas e seguras. Instituto dos Sonhos oferece atendimento multidisciplinar.',
  updated_at = NOW()
WHERE functionality = 'medical_analysis' AND personality = 'drvital';

-- 4. Verificar as configurações atualizadas
SELECT 
  functionality,
  service,
  model,
  max_tokens,
  temperature,
  personality,
  LEFT(system_prompt, 100) || '...' as system_prompt_preview
FROM ai_configurations 
WHERE functionality IN ('chat_daily', 'medical_analysis')
ORDER BY functionality;


