-- ========================================
-- SOFIA - DADOS DE ATIVIDADE FÍSICA E ALIMENTOS
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- RELAÇÃO ENTRE ATIVIDADE FÍSICA E ALIMENTOS
-- ========================================

-- INSERIR DADOS DE ATIVIDADE FÍSICA E ALIMENTOS RELACIONADOS
INSERT INTO atividade_fisica_alimentos (tipo_atividade, intensidade, duracao, alimentos_pre_treino, alimentos_pos_treino, alimentos_evitar, hidratacao_recomendada, suplementos_recomendados, mecanismo_acao, evidencia_cientifica, nivel_evidencia) VALUES

-- ATIVIDADES AERÓBICAS
('Corrida', 'Alta', '30-60 minutos', ARRAY['Banana', 'Aveia', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Carboidratos fornecem energia para atividade prolongada', 'Estudos clínicos', 4),

('Ciclismo', 'Média-Alta', '45-90 minutos', ARRAY['Banana', 'Barras energéticas', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos pesados', 'Fibras excessivas'], '500-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Hidratação adequada previne fadiga', 'Estudos clínicos', 4),

('Natação', 'Média', '30-60 minutos', ARRAY['Banana', 'Aveia', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-750ml por hora', ARRAY['Creatina', 'Beta-alanina'], 'Proteína pós-treino acelera recuperação', 'Estudos clínicos', 4),

('Caminhada', 'Baixa', '30-60 minutos', ARRAY['Frutas', 'Chá verde'], ARRAY['Proteína', 'Carboidratos'], ARRAY['Alimentos pesados'], '250-500ml por hora', ARRAY['Multivitamínico'], 'Atividade leve não requer suplementação específica', 'Estudos clínicos', 4),

-- ATIVIDADES DE FORÇA
('Musculação', 'Alta', '45-90 minutos', ARRAY['Proteína', 'Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Creatina'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-750ml por hora', ARRAY['Creatina', 'Proteína', 'BCAA'], 'Proteína pré-treino fornece aminoácidos essenciais', 'Meta-análise', 5),

('CrossFit', 'Alta', '20-60 minutos', ARRAY['Proteína', 'Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '750-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Alta intensidade requer carboidratos de rápida absorção', 'Estudos clínicos', 4),

('Pilates', 'Baixa-Média', '45-60 minutos', ARRAY['Frutas', 'Chá verde'], ARRAY['Proteína', 'Carboidratos'], ARRAY['Alimentos pesados'], '250-500ml por hora', ARRAY['Multivitamínico'], 'Foco em flexibilidade e controle motor', 'Estudos clínicos', 4),

('Yoga', 'Baixa', '60-90 minutos', ARRAY['Chá verde', 'Frutas'], ARRAY['Proteína', 'Carboidratos'], ARRAY['Alimentos pesados'], '250-500ml por hora', ARRAY['Magnésio'], 'Atividade de baixa intensidade com foco mental', 'Estudos clínicos', 4),

-- ATIVIDADES DE RESISTÊNCIA
('Maratona', 'Alta', '3-5 horas', ARRAY['Carboidratos', 'Café', 'Géis'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '1000-1500ml por hora', ARRAY['Carboidratos', 'Eletrólitos', 'Cafeína'], 'Carboidratos são combustível principal para endurance', 'Meta-análise', 5),

('Triatlo', 'Alta', '2-8 horas', ARRAY['Carboidratos', 'Café', 'Géis'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '1000-1500ml por hora', ARRAY['Carboidratos', 'Eletrólitos', 'Cafeína'], 'Hidratação e eletrólitos críticos para performance', 'Estudos clínicos', 4),

('Ultramaratona', 'Alta', '6-24 horas', ARRAY['Carboidratos', 'Gorduras', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Fibras excessivas'], '1000-2000ml por hora', ARRAY['Carboidratos', 'Eletrólitos', 'Cafeína'], 'Eventos longos requerem múltiplas fontes de energia', 'Estudos clínicos', 4),

('Ciclismo de Estrada', 'Alta', '2-6 horas', ARRAY['Carboidratos', 'Café', 'Géis'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '1000-1500ml por hora', ARRAY['Carboidratos', 'Eletrólitos', 'Cafeína'], 'Hidratação contínua previne desidratação', 'Estudos clínicos', 4),

-- ATIVIDADES DE ALTA INTENSIDADE
('HIIT', 'Alta', '20-45 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-750ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Alta intensidade requer energia de rápida disponibilidade', 'Estudos clínicos', 4),

('Tabata', 'Alta', '4-20 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos'], ARRAY['Alimentos gordurosos'], '250-500ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Treinos curtos e intensos', 'Estudos clínicos', 4),

('Circuit Training', 'Alta', '30-60 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-750ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Combinação de força e cardio', 'Estudos clínicos', 4),

('Bootcamp', 'Alta', '45-60 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-750ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Treino militar de alta intensidade', 'Estudos clínicos', 4),

-- ATIVIDADES DE FLEXIBILIDADE
('Alongamento', 'Baixa', '15-30 minutos', ARRAY['Chá verde'], ARRAY['Proteína'], ARRAY['Alimentos pesados'], '250ml por hora', ARRAY['Magnésio'], 'Foco em flexibilidade e relaxamento', 'Estudos clínicos', 4),

('Pilates Reformer', 'Baixa-Média', '45-60 minutos', ARRAY['Frutas', 'Chá verde'], ARRAY['Proteína', 'Carboidratos'], ARRAY['Alimentos pesados'], '250-500ml por hora', ARRAY['Magnésio'], 'Controle motor e estabilização', 'Estudos clínicos', 4),

('Yoga Vinyasa', 'Média', '60-90 minutos', ARRAY['Chá verde', 'Frutas'], ARRAY['Proteína', 'Carboidratos'], ARRAY['Alimentos pesados'], '250-500ml por hora', ARRAY['Magnésio'], 'Sequência fluida de posturas', 'Estudos clínicos', 4),

('Tai Chi', 'Baixa', '30-60 minutos', ARRAY['Chá verde'], ARRAY['Proteína'], ARRAY['Alimentos pesados'], '250ml por hora', ARRAY['Magnésio'], 'Movimento lento e meditativo', 'Estudos clínicos', 4),

-- ATIVIDADES ESPORTIVAS
('Futebol', 'Alta', '90 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Esporte intermitente de alta intensidade', 'Estudos clínicos', 4),

('Basquete', 'Alta', '40-48 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Esporte de explosão e resistência', 'Estudos clínicos', 4),

('Tênis', 'Alta', '60-180 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Esporte de resistência e explosão', 'Estudos clínicos', 4),

('Vôlei', 'Alta', '60-120 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Esporte de explosão e coordenação', 'Estudos clínicos', 4),

-- ATIVIDADES AQUÁTICAS
('Hidroginástica', 'Baixa-Média', '45-60 minutos', ARRAY['Frutas', 'Chá verde'], ARRAY['Proteína', 'Carboidratos'], ARRAY['Alimentos pesados'], '250-500ml por hora', ARRAY['Multivitamínico'], 'Atividade de baixo impacto', 'Estudos clínicos', 4),

('Natação Competitiva', 'Alta', '60-120 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-750ml por hora', ARRAY['Creatina', 'Beta-alanina'], 'Esporte de resistência', 'Estudos clínicos', 4),

('Polo Aquático', 'Alta', '60-90 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-750ml por hora', ARRAY['Creatina', 'Beta-alanina'], 'Esporte de resistência e força', 'Estudos clínicos', 4),

('Nado Sincronizado', 'Média-Alta', '60-120 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-750ml por hora', ARRAY['Creatina', 'Beta-alanina'], 'Esporte de resistência e flexibilidade', 'Estudos clínicos', 4),

-- ATIVIDADES DE COMBATE
('Boxe', 'Alta', '60-120 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Esporte de explosão e resistência', 'Estudos clínicos', 4),

('MMA', 'Alta', '60-180 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Esporte de força e resistência', 'Estudos clínicos', 4),

('Jiu-Jitsu', 'Alta', '60-120 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Esporte de força e técnica', 'Estudos clínicos', 4),

('Muay Thai', 'Alta', '60-120 minutos', ARRAY['Carboidratos', 'Café'], ARRAY['Proteína', 'Carboidratos', 'Eletrólitos'], ARRAY['Alimentos gordurosos', 'Fibras excessivas'], '500-1000ml por hora', ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Esporte de explosão e resistência', 'Estudos clínicos', 4); 