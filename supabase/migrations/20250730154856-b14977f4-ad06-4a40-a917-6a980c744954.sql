-- Inserir categorias básicas para metas
INSERT INTO public.goal_categories (name, description, icon, color) VALUES
('Saúde', 'Metas relacionadas à saúde física e mental', '🏥', '#10B981'),
('Exercício', 'Atividades físicas e treinos', '💪', '#3B82F6'),
('Alimentação', 'Nutrição e hábitos alimentares', '🥗', '#F59E0B'),
('Peso', 'Controle e metas de peso corporal', '⚖️', '#8B5CF6'),
('Hidratação', 'Consumo de água e líquidos', '💧', '#06B6D4'),
('Sono', 'Qualidade e duração do sono', '😴', '#6366F1'),
('Mindfulness', 'Meditação e bem-estar mental', '🧘', '#EC4899'),
('Habitos', 'Desenvolvimento de novos hábitos', '✅', '#84CC16')
ON CONFLICT (name) DO NOTHING;