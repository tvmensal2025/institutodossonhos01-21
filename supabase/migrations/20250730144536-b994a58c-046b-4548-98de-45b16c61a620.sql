-- Criar alguns desafios de exemplo para testar

-- Inserir categorias de metas
INSERT INTO public.goal_categories (name, description, icon, color) VALUES
('Peso', 'Metas relacionadas ao controle de peso', '⚖️', '#3b82f6'),
('Exercício', 'Metas de atividade física', '🏃', '#10b981'),
('Alimentação', 'Metas de alimentação saudável', '🥗', '#f59e0b'),
('Bem-estar', 'Metas de saúde mental e bem-estar', '🧘', '#8b5cf6')
ON CONFLICT DO NOTHING;

-- Inserir challenges de exemplo
INSERT INTO public.challenges (title, description, category, difficulty, points, duration_days) VALUES
('Caminhada Diária', 'Caminhe pelo menos 30 minutos todos os dias', 'Exercício', 'facil', 10, 7),
('Beber 2L de Água', 'Consuma pelo menos 2 litros de água por dia', 'Bem-estar', 'facil', 5, 7),
('5 Refeições por Dia', 'Faça 5 refeições balanceadas ao longo do dia', 'Alimentação', 'medio', 15, 14),
('Perder 2kg', 'Meta de redução de peso saudável', 'Peso', 'medio', 25, 30),
('30 min de Meditação', 'Pratique meditação por 30 minutos diários', 'Bem-estar', 'dificil', 20, 21)
ON CONFLICT DO NOTHING;

-- Inserir missions básicas
INSERT INTO public.missions (title, description, category, difficulty, points) VALUES
('Primeira Pesagem', 'Registre seu primeiro peso na plataforma', 'Peso', 'facil', 10),
('Completar Perfil', 'Preencha todas as informações do seu perfil', 'Bem-estar', 'facil', 15),
('Primeira Análise de Comida', 'Analise sua primeira refeição com a IA', 'Alimentação', 'medio', 20)
ON CONFLICT DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT 'Challenges criados:', COUNT(*) FROM public.challenges;
SELECT 'Goal categories criadas:', COUNT(*) FROM public.goal_categories;
SELECT 'Missions criadas:', COUNT(*) FROM public.missions;