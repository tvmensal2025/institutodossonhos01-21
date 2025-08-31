-- ========================================
-- SOFIA - DADOS DE OBJETIVOS FITNESS E ALIMENTOS
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- RELAÇÃO ENTRE OBJETIVOS FITNESS E ALIMENTOS
-- ========================================

-- INSERIR DADOS DE OBJETIVOS FITNESS E ALIMENTOS RELACIONADOS
INSERT INTO objetivos_fitness_alimentos (objetivo, descricao_objetivo, alimentos_essenciais, alimentos_evitar, suplementos_recomendados, protocolo_nutricional, consideracoes_especiais, evidencia_cientifica, nivel_evidencia) VALUES

-- OBJETIVOS DE COMPOSIÇÃO CORPORAL
('Hipertrofia', 'Aumento de massa muscular', ARRAY['Proteínas magras', 'Carboidratos complexos', 'Gorduras boas'], ARRAY['Açúcares', 'Alimentos processados', 'Gorduras trans'], ARRAY['Proteína', 'Creatina', 'BCAA', 'Beta-alanina'], 'Alta proteína (2g/kg), carboidratos moderados, gorduras boas', ARRAY['Treino de força', 'Sono adequado', 'Recuperação'], 'Meta-análise', 5),

('Emagrecimento', 'Redução de gordura corporal', ARRAY['Proteínas magras', 'Fibras', 'Gorduras boas'], ARRAY['Açúcares', 'Carboidratos refinados', 'Alimentos processados'], ARRAY['Proteína', 'Ômega 3', 'Cafeína'], 'Déficit calórico, alta proteína, baixo carboidrato', ARRAY['Exercício aeróbico', 'Treino de força', 'Sono adequado'], 'Meta-análise', 5),

('Definição Muscular', 'Redução de gordura mantendo músculo', ARRAY['Proteínas magras', 'Carboidratos complexos', 'Gorduras boas'], ARRAY['Açúcares', 'Alimentos processados', 'Gorduras trans'], ARRAY['Proteína', 'Creatina', 'BCAA'], 'Déficit calórico moderado, alta proteína', ARRAY['Treino de força', 'Cardio moderado', 'Recuperação'], 'Estudos clínicos', 4),

('Ganho de Peso', 'Aumento de peso saudável', ARRAY['Proteínas', 'Carboidratos complexos', 'Gorduras boas'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Proteína', 'Creatina', 'Carboidratos'], 'Superávit calórico, alta proteína, carboidratos', ARRAY['Treino de força', 'Descanso adequado'], 'Estudos clínicos', 4),

-- OBJETIVOS DE PERFORMANCE
('Força', 'Aumento de força máxima', ARRAY['Proteínas magras', 'Carboidratos complexos', 'Gorduras boas'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Creatina', 'Proteína', 'Beta-alanina'], 'Alta proteína, carboidratos adequados, creatina', ARRAY['Treino de força', 'Recuperação', 'Sono'], 'Meta-análise', 5),

('Resistência', 'Melhora da capacidade aeróbica', ARRAY['Carboidratos complexos', 'Proteínas magras', 'Gorduras boas'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Carboidratos', 'Beta-alanina', 'Cafeína'], 'Alto carboidrato, proteína moderada, hidratação', ARRAY['Treino aeróbico', 'Recuperação', 'Hidratação'], 'Estudos clínicos', 4),

('Potência', 'Melhora da explosão muscular', ARRAY['Proteínas magras', 'Carboidratos complexos', 'Gorduras boas'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Alta proteína, carboidratos, creatina', ARRAY['Treino pliométrico', 'Recuperação', 'Sono'], 'Estudos clínicos', 4),

('Velocidade', 'Melhora da velocidade de movimento', ARRAY['Proteínas magras', 'Carboidratos complexos'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Creatina', 'Beta-alanina', 'Cafeína'], 'Alta proteína, carboidratos, creatina', ARRAY['Treino de velocidade', 'Recuperação', 'Técnica'], 'Estudos clínicos', 4),

-- OBJETIVOS DE SAÚDE
('Saúde Cardiovascular', 'Melhora da saúde do coração', ARRAY['Peixes', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Gorduras saturadas', 'Sódio', 'Açúcares'], ARRAY['Ômega 3', 'Coenzima Q10', 'Magnésio'], 'Baixa gordura saturada, alta fibra, ômega 3', ARRAY['Exercício aeróbico', 'Controle de peso', 'Não fumar'], 'Meta-análise', 5),

('Saúde Óssea', 'Fortalecimento dos ossos', ARRAY['Laticínios', 'Peixes', 'Legumes verdes', 'Frutas'], ARRAY['Açúcares', 'Álcool', 'Cafeína excessiva'], ARRAY['Cálcio', 'Vitamina D', 'Magnésio'], 'Alto cálcio, vitamina D, exercício de impacto', ARRAY['Treino de força', 'Exposição solar', 'Não fumar'], 'Estudos clínicos', 4),

('Saúde Mental', 'Melhora da saúde mental', ARRAY['Peixes', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados', 'Álcool'], ARRAY['Ômega 3', 'Magnésio', 'Vitamina D'], 'Ômega 3, antioxidantes, probióticos', ARRAY['Exercício regular', 'Sono adequado', 'Meditação'], 'Estudos clínicos', 4),

('Sistema Imunológico', 'Fortalecimento da imunidade', ARRAY['Frutas', 'Legumes', 'Peixes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Vitamina C', 'Vitamina D', 'Zinco', 'Probióticos'], 'Antioxidantes, probióticos, vitaminas', ARRAY['Exercício moderado', 'Sono adequado', 'Redução de stress'], 'Estudos clínicos', 4),

-- OBJETIVOS ESPECÍFICOS
('Flexibilidade', 'Melhora da flexibilidade', ARRAY['Proteínas magras', 'Frutas', 'Legumes'], ARRAY['Alimentos pesados'], ARRAY['Magnésio', 'Ômega 3'], 'Proteína adequada, hidratação, magnésio', ARRAY['Alongamento regular', 'Yoga', 'Mobilidade'], 'Estudos clínicos', 4),

('Equilíbrio', 'Melhora do equilíbrio', ARRAY['Proteínas magras', 'Frutas', 'Legumes'], ARRAY['Alimentos pesados'], ARRAY['Magnésio', 'Ômega 3'], 'Proteína adequada, hidratação', ARRAY['Treino de equilíbrio', 'Tai Chi', 'Pilates'], 'Estudos clínicos', 4),

('Coordenação', 'Melhora da coordenação motora', ARRAY['Proteínas magras', 'Frutas', 'Legumes'], ARRAY['Alimentos pesados'], ARRAY['Magnésio', 'Ômega 3'], 'Proteína adequada, hidratação', ARRAY['Esportes', 'Dança', 'Atividades motoras'], 'Estudos clínicos', 4),

('Recuperação', 'Otimização da recuperação', ARRAY['Proteínas magras', 'Carboidratos complexos'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Proteína', 'Carboidratos', 'Magnésio'], 'Proteína pós-treino, carboidratos, hidratação', ARRAY['Sono adequado', 'Alongamento', 'Massagem'], 'Estudos clínicos', 4),

-- OBJETIVOS DE COMPETIÇÃO
('Preparação para Maratona', 'Preparação para corrida de longa distância', ARRAY['Carboidratos complexos', 'Proteínas magras', 'Gorduras boas'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Carboidratos', 'Eletrólitos', 'Cafeína'], 'Carboidratos altos, proteína moderada, hidratação', ARRAY['Treino progressivo', 'Recuperação', 'Taper'], 'Estudos clínicos', 4),

('Preparação para Triatlo', 'Preparação para triatlo', ARRAY['Carboidratos complexos', 'Proteínas magras', 'Gorduras boas'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Carboidratos', 'Eletrólitos', 'Cafeína'], 'Carboidratos altos, proteína moderada', ARRAY['Treino multidisciplinar', 'Recuperação', 'Taper'], 'Estudos clínicos', 4),

('Preparação para Competição de Força', 'Preparação para competição de powerlifting', ARRAY['Proteínas magras', 'Carboidratos complexos'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Creatina', 'Proteína', 'Beta-alanina'], 'Alta proteína, carboidratos, creatina', ARRAY['Treino de força', 'Recuperação', 'Taper'], 'Estudos clínicos', 4),

('Preparação para Competição de Fisiculturismo', 'Preparação para competição de bodybuilding', ARRAY['Proteínas magras', 'Carboidratos complexos'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Proteína', 'Creatina', 'BCAA'], 'Alta proteína, carboidratos controlados', ARRAY['Treino de força', 'Cardio', 'Pose'], 'Estudos clínicos', 4),

-- OBJETIVOS DE REABILITAÇÃO
('Reabilitação de Lesão', 'Recuperação de lesão esportiva', ARRAY['Proteínas magras', 'Frutas', 'Legumes'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Proteína', 'Ômega 3', 'Vitamina C'], 'Alta proteína, anti-inflamatórios', ARRAY['Fisioterapia', 'Descanso', 'Progressão gradual'], 'Estudos clínicos', 4),

('Reabilitação Pós-Cirúrgica', 'Recuperação pós-cirurgia', ARRAY['Proteínas magras', 'Frutas', 'Legumes'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Proteína', 'Vitamina C', 'Zinco'], 'Alta proteína, vitaminas de recuperação', ARRAY['Fisioterapia', 'Descanso', 'Progressão gradual'], 'Estudos clínicos', 4),

('Prevenção de Lesões', 'Prevenção de lesões esportivas', ARRAY['Proteínas magras', 'Frutas', 'Legumes'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Ômega 3', 'Magnésio', 'Vitamina D'], 'Anti-inflamatórios, vitaminas', ARRAY['Aquecimento', 'Alongamento', 'Técnica adequada'], 'Estudos clínicos', 4),

('Manutenção da Mobilidade', 'Manutenção da mobilidade articular', ARRAY['Proteínas magras', 'Frutas', 'Legumes'], ARRAY['Alimentos pesados'], ARRAY['Ômega 3', 'Magnésio'], 'Anti-inflamatórios, hidratação', ARRAY['Alongamento', 'Mobilidade', 'Movimento regular'], 'Estudos clínicos', 4); 