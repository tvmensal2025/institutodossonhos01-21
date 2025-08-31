-- Corrigir RLS de forma simples
-- Desabilitar RLS temporariamente para permitir inserção de desafios

-- 1. Desabilitar RLS nas tabelas
ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participations DISABLE ROW LEVEL SECURITY;

-- 2. Limpar desafios antigos
DELETE FROM challenges WHERE title IN ('hjhjhjhjhj', ',,,,,,,', 'bbbb', 'bmw de', 'noinn', 'JEJUM INTERMITENTE ***');

-- 3. Inserir desafios de teste
INSERT INTO challenges (
    title, description, category, difficulty, duration_days, 
    points_reward, badge_icon, badge_name, instructions, tips,
    is_active, is_featured, is_group_challenge, daily_log_target, daily_log_unit
) VALUES 
(
    'Beber 2L de Água Diariamente',
    'Mantenha-se hidratado bebendo pelo menos 2 litros de água por dia',
    'Hidratação',
    'facil',
    30,
    50,
    '💧',
    'Hidratação Master',
    'Beba água regularmente ao longo do dia.',
    ARRAY['Tenha sempre uma garrafa de água por perto', 'Beba um copo ao acordar'],
    true,
    true,
    false,
    2000,
    'ml'
),
(
    'Caminhar 8000 Passos',
    'Dê pelo menos 8000 passos todos os dias para manter-se ativo',
    'Atividade Física',
    'medio',
    30,
    75,
    '🚶‍♂️',
    'Caminhador Dedicado',
    'Use um contador de passos ou app no celular.',
    ARRAY['Estacione mais longe', 'Use escadas'],
    true,
    true,
    false,
    8000,
    'passos'
),
(
    'Exercitar-se 30 Minutos',
    'Faça pelo menos 30 minutos de exercício físico moderado',
    'Atividade Física',
    'dificil',
    30,
    120,
    '💪',
    'Atleta Dedicado',
    'Pode ser academia, corrida, natação, dança ou esportes.',
    ARRAY['Escolha atividade prazerosa', 'Comece gradualmente'],
    true,
    true,
    false,
    30,
    'minutos'
),
(
    '💧 Hidratação em Grupo - Janeiro 2025',
    'Desafio comunitário: Vamos todos beber 2.5L de água por dia!',
    'Hidratação',
    'facil',
    31,
    150,
    '💧',
    'Hidratação Comunitária',
    'Junte-se à comunidade e mantenha-se hidratado.',
    ARRAY['Beba um copo ao acordar', 'Use uma garrafa marcada'],
    true,
    true,
    true,
    2500,
    'ml'
),
(
    '🚶‍♀️ Caminhada Matinal Coletiva',
    'Desafio: 30 minutos de caminhada toda manhã. Vamos começar o dia com energia!',
    'Atividade Física',
    'facil',
    21,
    200,
    '🚶‍♀️',
    'Caminhador Matinal',
    'Caminhe 30 minutos todas as manhãs e compartilhe sua energia!',
    ARRAY['Acorde 30min mais cedo', 'Convide um amigo'],
    true,
    true,
    true,
    30,
    'minutos'
);

-- 4. Reabilitar RLS com políticas simples
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participations ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas simples
CREATE POLICY "Allow read challenges" ON challenges FOR SELECT USING (true);
CREATE POLICY "Allow read participations" ON challenge_participations FOR SELECT USING (true);
CREATE POLICY "Allow insert participations" ON challenge_participations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update participations" ON challenge_participations FOR UPDATE USING (true);

-- 6. Verificar resultado
SELECT '✅ RLS corrigido e desafios criados!' as status;
SELECT COUNT(*) as total_desafios FROM challenges WHERE is_active = true; 