-- RECUPERAÇÃO FINAL COMPLETA - TUDO QUE FOI PERDIDO DESDE 16:00 ONTEM

-- RECUPERAR MISSÕES COM VALORES CORRETOS
INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Hidratação Máxima', 'Beba pelo menos 2 litros de água por dia', 'hydration', 'easy', 10, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Hidratação Máxima');

INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Exercício Completo', 'Pratique 30 minutos de exercício pela manhã', 'exercise', 'medium', 25, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Exercício Completo');

INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Mentalidade Positiva', 'Medite por 10 minutos diariamente', 'mindset', 'easy', 15, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Mentalidade Positiva');

INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Nutrição Completa', 'Consuma 5 porções de frutas e vegetais', 'nutrition', 'medium', 20, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Nutrição Completa');

INSERT INTO missions (title, description, category, difficulty, points, is_active)
SELECT 'Sono Perfeito', 'Durma pelo menos 8 horas por noite', 'sleep', 'medium', 20, true
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Sono Perfeito');

-- RECUPERAR CONFIGURAÇÕES DE IA COM VALORES CORRETOS
INSERT INTO ai_configurations (functionality, service, model, temperature, max_tokens, preset_level, is_enabled)
SELECT 'chat_bot', 'openai', 'gpt-4', 0.7, 1024, 'maximo', true
WHERE NOT EXISTS (SELECT 1 FROM ai_configurations WHERE functionality = 'chat_bot');

INSERT INTO ai_configurations (functionality, service, model, temperature, max_tokens, preset_level, is_enabled)
SELECT 'food_analysis', 'google', 'gemini-1.5-flash', 0.5, 2048, 'maximo', true
WHERE NOT EXISTS (SELECT 1 FROM ai_configurations WHERE functionality = 'food_analysis');

INSERT INTO ai_configurations (functionality, service, model, temperature, max_tokens, preset_level, is_enabled)
SELECT 'health_insights', 'openai', 'gpt-4', 0.6, 1500, 'maximo', true
WHERE NOT EXISTS (SELECT 1 FROM ai_configurations WHERE functionality = 'health_insights');

INSERT INTO ai_configurations (functionality, service, model, temperature, max_tokens, preset_level, is_enabled)
SELECT 'goal_tracking', 'openai', 'gpt-3.5-turbo', 0.8, 800, 'maximo', true
WHERE NOT EXISTS (SELECT 1 FROM ai_configurations WHERE functionality = 'goal_tracking');

INSERT INTO ai_configurations (functionality, service, model, temperature, max_tokens, preset_level, is_enabled)
SELECT 'weekly_reports', 'openai', 'gpt-4', 0.5, 2000, 'maximo', true
WHERE NOT EXISTS (SELECT 1 FROM ai_configurations WHERE functionality = 'weekly_reports');