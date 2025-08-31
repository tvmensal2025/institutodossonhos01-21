-- CRIAR DESAFIOS LIMPOS - Estrutura sem erros
-- 2 desafios: Exercício e Hidratação

-- 1. Limpar dados existentes
DELETE FROM public.challenge_daily_logs;
DELETE FROM public.challenge_participations;
DELETE FROM public.challenges;

-- 2. Verificar estrutura das tabelas
SELECT 'Estrutura das tabelas:' as info,
       table_name,
       column_name,
       data_type
FROM information_schema.columns 
WHERE table_name IN ('challenges', 'challenge_participations', 'challenge_daily_logs')
ORDER BY table_name, column_name;

-- 3. Inserir os 2 desafios
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
-- Desafio 1: Exercício Diário
(
    gen_random_uuid(),
    'Exercício Diário',
    'Faça 30 minutos de exercício todos os dias por uma semana',
    'exercicio',
    'medio',
    7,
    100,
    '🏃‍♂️',
    'Atleta Diário',
    'Exercite-se por 30 minutos todos os dias. Pode ser caminhada, corrida, academia ou qualquer atividade física.',
    ARRAY['Comece devagar', 'Escolha uma atividade que goste', 'Mantenha consistência'],
    true,
    true,
    false,
    'hours',
    'horas',
    0.5,
    NOW(),
    NOW()
),
-- Desafio 2: Hidratação Perfeita
(
    gen_random_uuid(),
    'Hidratação Perfeita',
    'Beba 2 litros de água todos os dias por uma semana',
    'hidratacao',
    'facil',
    7,
    80,
    '💧',
    'Hidratado',
    'Beba pelo menos 2 litros de água por dia. Use um app ou garrafa para controlar.',
    ARRAY['Tenha sempre uma garrafa por perto', 'Use um app para lembrar', 'Beba água antes das refeições'],
    true,
    true,
    false,
    'quantity',
    'litros',
    2,
    NOW(),
    NOW()
);

-- 4. Verificar se os desafios foram criados
SELECT 'Desafios criados:' as info,
       title,
       category,
       difficulty,
       duration_days,
       points_reward,
       daily_log_target,
       daily_log_unit
FROM public.challenges
ORDER BY created_at DESC;

-- 5. Resultado final
SELECT 'DESAFIOS CRIADOS COM SUCESSO!' as status,
       'Estrutura limpa e sem erros' as resultado; 