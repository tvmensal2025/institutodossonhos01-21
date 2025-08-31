-- 📊 ADICIONAR DADOS DE TESTE PARA O RAFAEL
-- Execute este script no SQL Editor do Supabase

-- 1. Obter o user_id do Rafael
DO $$
DECLARE
    rafael_user_id UUID;
BEGIN
    -- Buscar o user_id do Rafael
    SELECT user_id INTO rafael_user_id 
    FROM profiles 
    WHERE email = 'rafael.ids@icloud.com';
    
    IF rafael_user_id IS NULL THEN
        RAISE NOTICE '❌ Rafael não encontrado. Execute primeiro o script de correção do Rafael.';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Rafael encontrado. User ID: %', rafael_user_id;
    
    -- 2. Adicionar dados de peso (últimos 30 dias)
    INSERT INTO weight_measurements (user_id, weight, measurement_date, notes, created_at, updated_at)
    SELECT 
        rafael_user_id,
        75.0 + (random() * 2 - 1), -- Peso entre 74-76 kg com variação
        CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 29),
        'Medição automática de teste',
        NOW(),
        NOW()
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Dados de peso adicionados (30 dias)';
    
    -- 3. Adicionar metas de saúde
    INSERT INTO user_goals (user_id, goal_type, title, description, target_value, current_value, start_date, target_date, status, created_at, updated_at)
    VALUES 
        (rafael_user_id, 'weight', 'Perder 5kg', 'Meta de peso para melhorar saúde', 70.0, 75.0, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '90 days', 'active', NOW(), NOW()),
        (rafael_user_id, 'nutrition', 'Comer mais vegetais', 'Aumentar consumo de vegetais', 5, 3, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', 'active', NOW(), NOW()),
        (rafael_user_id, 'exercise', 'Exercitar 3x por semana', 'Manter atividade física regular', 3, 2, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '120 days', 'active', NOW(), NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Metas de saúde adicionadas';
    
    -- 4. Adicionar respostas diárias (últimos 7 dias)
    INSERT INTO daily_responses (user_id, question_id, response, response_date, created_at, updated_at)
    SELECT 
        rafael_user_id,
        'energy_level',
        CASE (random() * 4)::int
            WHEN 0 THEN 'Muito baixa'
            WHEN 1 THEN 'Baixa'
            WHEN 2 THEN 'Média'
            WHEN 3 THEN 'Alta'
            ELSE 'Muito alta'
        END,
        CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
        NOW(),
        NOW()
    ON CONFLICT DO NOTHING;
    
    INSERT INTO daily_responses (user_id, question_id, response, response_date, created_at, updated_at)
    SELECT 
        rafael_user_id,
        'stress_level',
        CASE (random() * 4)::int
            WHEN 0 THEN 'Muito baixo'
            WHEN 1 THEN 'Baixo'
            WHEN 2 THEN 'Médio'
            WHEN 3 THEN 'Alto'
            ELSE 'Muito alto'
        END,
        CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
        NOW(),
        NOW()
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Respostas diárias adicionadas (7 dias)';
    
    -- 5. Adicionar logs nutricionais (últimos 7 dias)
    INSERT INTO nutrition_logs (user_id, food_name, calories, protein, carbs, fat, meal_type, logged_date, created_at, updated_at)
    SELECT 
        rafael_user_id,
        CASE (random() * 5)::int
            WHEN 0 THEN 'Café da manhã completo'
            WHEN 1 THEN 'Almoço balanceado'
            WHEN 2 THEN 'Jantar leve'
            WHEN 3 THEN 'Lanche da tarde'
            ELSE 'Suplemento proteico'
        END,
        200 + (random() * 400), -- 200-600 calorias
        10 + (random() * 20),   -- 10-30g proteína
        20 + (random() * 40),   -- 20-60g carboidratos
        5 + (random() * 15),    -- 5-20g gordura
        CASE (random() * 3)::int
            WHEN 0 THEN 'breakfast'
            WHEN 1 THEN 'lunch'
            WHEN 2 THEN 'dinner'
            ELSE 'snack'
        END,
        CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
        NOW(),
        NOW()
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Logs nutricionais adicionados (7 dias)';
    
    -- 6. Adicionar anamnese básica
    INSERT INTO anamnesis (user_id, height, gender, birth_date, medical_history, medications, allergies, family_history, lifestyle_factors, created_at, updated_at)
    VALUES (
        rafael_user_id,
        175, -- altura em cm
        'male',
        '1985-01-15', -- data de nascimento exemplo
        'Histórico médico básico para teste',
        'Nenhuma medicação regular',
        'Nenhuma alergia conhecida',
        'Histórico familiar de diabetes tipo 2',
        'Sedentário, trabalha em escritório',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        height = EXCLUDED.height,
        medical_history = EXCLUDED.medical_history,
        updated_at = NOW();
    
    RAISE NOTICE '✅ Anamnese básica adicionada';
    
    -- 7. Verificar dados criados
    RAISE NOTICE '';
    RAISE NOTICE '📊 RESUMO DOS DADOS ADICIONADOS:';
    RAISE NOTICE '   - Peso: 30 medições (últimos 30 dias)';
    RAISE NOTICE '   - Metas: 3 metas ativas';
    RAISE NOTICE '   - Respostas diárias: 14 respostas (7 dias)';
    RAISE NOTICE '   - Logs nutricionais: 7 registros (7 dias)';
    RAISE NOTICE '   - Anamnese: dados básicos de saúde';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Agora o Rafael pode testar o Dr. Vital com dados reais!';
    
END $$;

-- 8. Verificar se os dados foram criados
SELECT 
  '📊 VERIFICAÇÃO FINAL:' as info,
  p.full_name,
  p.email,
  (SELECT COUNT(*) FROM weight_measurements WHERE user_id = p.user_id) as peso_medicoes,
  (SELECT COUNT(*) FROM user_goals WHERE user_id = p.user_id) as metas,
  (SELECT COUNT(*) FROM daily_responses WHERE user_id = p.user_id) as respostas_diarias,
  (SELECT COUNT(*) FROM nutrition_logs WHERE user_id = p.user_id) as logs_nutricao,
  (SELECT COUNT(*) FROM anamnesis WHERE user_id = p.user_id) as anamneses
FROM profiles p
WHERE p.email = 'rafael.ids@icloud.com';
