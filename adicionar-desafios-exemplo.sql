-- Adicionar desafios de exemplo para que apareçam para o usuário

-- 1. Limpar desafios existentes (opcional)
DELETE FROM public.challenge_participations;
DELETE FROM public.challenges;

-- 2. Inserir desafios de exemplo
INSERT INTO public.challenges (
    id,
    title,
    description,
    category,
    difficulty,
    duration_days,
    points_reward,
    badge_icon,
    badge_name,
    instructions,
    tips,
    is_active,
    is_featured,
    is_group_challenge,
    daily_log_type,
    daily_log_unit,
    daily_log_target,
    created_at,
    updated_at
) VALUES 
-- Desafio 1: Hidratação
(
    gen_random_uuid(),
    'Hidratação Diária',
    'Beba 2L de água todos os dias por uma semana',
    'hidratacao',
    'facil',
    7,
    50,
    '💧',
    'Hidratado',
    'Beba pelo menos 2 litros de água por dia',
    ARRAY['Use um app para lembrar', 'Tenha sempre uma garrafa por perto'],
    true,
    true,
    false,
    'quantity',
    'litros',
    2,
    NOW(),
    NOW()
),
-- Desafio 2: Exercício
(
    gen_random_uuid(),
    'Exercício Matinal',
    'Faça 30 minutos de exercício todas as manhãs',
    'exercicio',
    'medio',
    14,
    120,
    '🏃‍♂️',
    'Atleta Matinal',
    'Exercite-se por 30 minutos todas as manhãs',
    ARRAY['Comece devagar', 'Prepare a roupa na noite anterior'],
    true,
    false,
    true,
    'hours',
    'horas',
    0.5,
    NOW(),
    NOW()
),
-- Desafio 3: Nutrição
(
    gen_random_uuid(),
    'Alimentação Saudável',
    'Coma 5 porções de frutas e vegetais por dia',
    'nutricao',
    'medio',
    21,
    200,
    '🥗',
    'Nutricionista',
    'Inclua 5 porções de frutas e vegetais em suas refeições diárias',
    ARRAY['Planeje as refeições', 'Varie as cores dos alimentos'],
    true,
    false,
    false,
    'quantity',
    'porções',
    5,
    NOW(),
    NOW()
),
-- Desafio 4: Sono
(
    gen_random_uuid(),
    'Sono de Qualidade',
    'Durma 8 horas por noite por 10 dias',
    'sono',
    'facil',
    10,
    80,
    '😴',
    'Dorminhoco',
    'Durma 8 horas por noite para melhorar sua saúde',
    ARRAY['Evite telas antes de dormir', 'Mantenha um horário regular'],
    true,
    true,
    false,
    'hours',
    'horas',
    8,
    NOW(),
    NOW()
),
-- Desafio 5: Mindfulness
(
    gen_random_uuid(),
    'Meditação Diária',
    'Medite por 10 minutos todos os dias',
    'mindfulness',
    'medio',
    30,
    300,
    '🧘‍♀️',
    'Zen Master',
    'Medite por 10 minutos todos os dias para reduzir o estresse',
    ARRAY['Escolha um local tranquilo', 'Use um app de meditação'],
    true,
    false,
    false,
    'minutes',
    'minutos',
    10,
    NOW(),
    NOW()
),
-- Desafio 6: Medição
(
    gen_random_uuid(),
    'Pesagem Semanal',
    'Pese-se uma vez por semana e registre',
    'medicao',
    'facil',
    4,
    40,
    '⚖️',
    'Monitor',
    'Pese-se uma vez por semana e registre seu progresso',
    ARRAY['Use sempre a mesma balança', 'Pese-se no mesmo horário'],
    true,
    false,
    false,
    'boolean',
    'vez',
    1,
    NOW(),
    NOW()
);

-- 3. Verificar se os desafios foram criados
SELECT 'Desafios criados:' as info,
       COUNT(*) as total_desafios,
       COUNT(CASE WHEN is_active = true THEN 1 END) as ativos,
       COUNT(CASE WHEN is_featured = true THEN 1 END) as em_destaque
FROM public.challenges;

-- 4. Mostrar todos os desafios
SELECT 'Lista de desafios:' as info,
       title,
       category,
       difficulty,
       duration_days,
       points_reward,
       is_active,
       is_featured
FROM public.challenges
ORDER BY created_at DESC; 