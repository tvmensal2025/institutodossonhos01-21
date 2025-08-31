-- ========================================
-- SOFIA - DADOS DE IDADE E GÊNERO
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- RELAÇÃO ENTRE IDADE, GÊNERO E ALIMENTOS
-- ========================================

-- INSERIR DADOS DE IDADE E ALIMENTOS RELACIONADOS
INSERT INTO idade_alimentos (faixa_etaria, descricao_faixa, necessidades_nutricionais, alimentos_essenciais, alimentos_evitar, suplementos_recomendados, consideracoes_especiais, evidencia_cientifica, nivel_evidencia) VALUES

-- INFÂNCIA (0-12 anos)
('0-6 meses', 'Lactentes', ARRAY['Leite materno', 'Proteínas', 'Gorduras essenciais'], ARRAY['Leite materno', 'Fórmulas infantis'], ARRAY['Mel', 'Leite de vaca', 'Alimentos sólidos'], ARRAY['Vitamina D'], ARRAY['Aleitamento exclusivo', 'Introdução gradual de alimentos'], 'Diretrizes OMS', 5),

('6-12 meses', 'Desmame', ARRAY['Proteínas', 'Ferro', 'Zinco', 'Vitamina D'], ARRAY['Carnes', 'Legumes', 'Frutas'], ARRAY['Mel', 'Leite de vaca', 'Alimentos alergênicos'], ARRAY['Vitamina D', 'Ferro'], ARRAY['Introdução gradual', 'Observar alergias'], 'Diretrizes OMS', 5),

('1-3 anos', 'Primeira infância', ARRAY['Proteínas', 'Cálcio', 'Ferro', 'Vitamina D'], ARRAY['Carnes', 'Laticínios', 'Frutas', 'Legumes'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Vitamina D', 'Ferro'], ARRAY['Desenvolvimento de preferências', 'Hábitos alimentares'], 'Estudos clínicos', 4),

('4-8 anos', 'Idade pré-escolar', ARRAY['Proteínas', 'Cálcio', 'Ferro', 'Vitaminas B'], ARRAY['Carnes', 'Laticínios', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico'], ARRAY['Desenvolvimento cognitivo', 'Atividade física'], 'Estudos clínicos', 4),

('9-12 anos', 'Pré-adolescência', ARRAY['Proteínas', 'Cálcio', 'Ferro', 'Vitaminas B'], ARRAY['Carnes', 'Laticínios', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico'], ARRAY['Crescimento acelerado', 'Desenvolvimento puberal'], 'Estudos clínicos', 4),

-- ADOLESCÊNCIA (13-19 anos)
('13-15 anos', 'Adolescência inicial', ARRAY['Proteínas', 'Cálcio', 'Ferro', 'Zinco'], ARRAY['Carnes', 'Laticínios', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico', 'Ferro'], ARRAY['Crescimento puberal', 'Desenvolvimento hormonal'], 'Estudos clínicos', 4),

('16-19 anos', 'Adolescência tardia', ARRAY['Proteínas', 'Cálcio', 'Ferro', 'Vitaminas B'], ARRAY['Carnes', 'Laticínios', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico'], ARRAY['Maturação física', 'Independência alimentar'], 'Estudos clínicos', 4),

-- ADULTO JOVEM (20-39 anos)
('20-29 anos', 'Adulto jovem', ARRAY['Proteínas', 'Vitaminas B', 'Ferro', 'Cálcio'], ARRAY['Carnes', 'Laticínios', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico'], ARRAY['Estabelecimento de carreira', 'Atividade física'], 'Estudos clínicos', 4),

('30-39 anos', 'Adulto maduro', ARRAY['Proteínas', 'Vitaminas B', 'Antioxidantes', 'Ômega 3'], ARRAY['Carnes', 'Peixes', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico', 'Ômega 3'], ARRAY['Estresse profissional', 'Responsabilidades familiares'], 'Estudos clínicos', 4),

-- ADULTO MÉDIO (40-59 anos)
('40-49 anos', 'Meia-idade inicial', ARRAY['Proteínas', 'Antioxidantes', 'Ômega 3', 'Cálcio'], ARRAY['Carnes', 'Peixes', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico', 'Ômega 3', 'Cálcio'], ARRAY['Mudanças hormonais', 'Prevenção de doenças'], 'Estudos clínicos', 4),

('50-59 anos', 'Meia-idade tardia', ARRAY['Proteínas', 'Antioxidantes', 'Ômega 3', 'Cálcio', 'Vitamina D'], ARRAY['Carnes', 'Peixes', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico', 'Ômega 3', 'Cálcio', 'Vitamina D'], ARRAY['Menopausa/Andropausa', 'Prevenção de osteoporose'], 'Estudos clínicos', 4),

-- ADULTO SÊNIOR (60+ anos)
('60-69 anos', 'Sênior inicial', ARRAY['Proteínas', 'Antioxidantes', 'Ômega 3', 'Cálcio', 'Vitamina D'], ARRAY['Carnes', 'Peixes', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico', 'Ômega 3', 'Cálcio', 'Vitamina D'], ARRAY['Perda muscular', 'Prevenção de quedas'], 'Estudos clínicos', 4),

('70-79 anos', 'Sênior maduro', ARRAY['Proteínas', 'Antioxidantes', 'Ômega 3', 'Cálcio', 'Vitamina D', 'B12'], ARRAY['Carnes', 'Peixes', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico', 'Ômega 3', 'Cálcio', 'Vitamina D', 'B12'], ARRAY['Sarcopenia', 'Declínio cognitivo'], 'Estudos clínicos', 4),

('80+ anos', 'Idoso avançado', ARRAY['Proteínas', 'Antioxidantes', 'Ômega 3', 'Cálcio', 'Vitamina D', 'B12'], ARRAY['Carnes', 'Peixes', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares', 'Alimentos processados'], ARRAY['Multivitamínico', 'Ômega 3', 'Cálcio', 'Vitamina D', 'B12'], ARRAY['Fragilidade', 'Dependência'], 'Estudos clínicos', 4);

-- INSERIR DADOS DE GÊNERO E ALIMENTOS RELACIONADOS
INSERT INTO genero_alimentos (genero, necessidades_especificas, alimentos_beneficos, alimentos_evitar, suplementos_recomendados, consideracoes_hormonais, evidencia_cientifica, nivel_evidencia) VALUES

-- MASCULINO
('Masculino', ARRAY['Maior necessidade proteica', 'Maior necessidade calórica', 'Maior necessidade de zinco'], ARRAY['Carnes vermelhas', 'Peixes', 'Ovos', 'Laticínios', 'Grãos integrais'], ARRAY['Açúcares excessivos', 'Alimentos processados'], ARRAY['Proteína', 'Zinco', 'Vitamina D', 'Ômega 3'], ARRAY['Testosterona', 'Desenvolvimento muscular', 'Metabolismo mais rápido'], 'Estudos clínicos', 4),

-- FEMININO
('Feminino', ARRAY['Maior necessidade de ferro', 'Maior necessidade de cálcio', 'Maior necessidade de ácido fólico'], ARRAY['Carnes', 'Peixes', 'Laticínios', 'Legumes verdes', 'Grãos integrais'], ARRAY['Açúcares excessivos', 'Alimentos processados'], ARRAY['Ferro', 'Cálcio', 'Ácido fólico', 'Vitamina D', 'Ômega 3'], ARRAY['Estrogênio', 'Ciclo menstrual', 'Menopausa'], 'Estudos clínicos', 4),

-- NÃO-BINÁRIO
('Não-binário', ARRAY['Necessidades individuais', 'Considerações hormonais específicas'], ARRAY['Carnes', 'Peixes', 'Laticínios', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares excessivos', 'Alimentos processados'], ARRAY['Multivitamínico', 'Ômega 3'], ARRAY['Variações hormonais', 'Necessidades individuais'], 'Estudos clínicos', 4),

-- TRANSGÊNERO
('Transgênero', ARRAY['Necessidades específicas de hormonioterapia', 'Considerações de transição'], ARRAY['Carnes', 'Peixes', 'Laticínios', 'Frutas', 'Legumes', 'Grãos integrais'], ARRAY['Açúcares excessivos', 'Alimentos processados'], ARRAY['Multivitamínico', 'Ômega 3', 'Suplementos específicos'], ARRAY['Hormonioterapia', 'Transição hormonal', 'Necessidades específicas'], 'Estudos clínicos', 4); 