-- ========================================
-- SOFIA - DADOS DE ESTADOS EMOCIONAIS E ALIMENTOS
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- RELAÇÃO ENTRE ESTADOS EMOCIONAIS E ALIMENTOS
-- ========================================

-- INSERIR DADOS DE ESTADOS EMOCIONAIS E ALIMENTOS RELACIONADOS
INSERT INTO estados_emocionais_alimentos (estado_emocional, descricao_estado, alimentos_beneficos, alimentos_evitar, mecanismo_acao, evidencia_cientifica, nivel_evidencia) VALUES

-- ESTADOS DE STRESS E ANSIEDADE
('Stress', 'Estado de tensão física e mental', ARRAY['Ashwagandha', 'Magnésio', 'Ômega 3', 'Probióticos'], ARRAY['Cafeína', 'Açúcares', 'Álcool'], 'Ashwagandha modula cortisol e reduz resposta ao stress', 'Estudos clínicos', 4),

('Ansiedade', 'Preocupação excessiva e nervosismo', ARRAY['Magnésio', 'Ômega 3', 'Probióticos', 'Camomila'], ARRAY['Cafeína', 'Açúcares', 'Álcool'], 'Magnésio relaxa sistema nervoso e reduz ansiedade', 'Meta-análise', 5),

('Pânico', 'Ataques de pânico e ansiedade extrema', ARRAY['Magnésio', 'Ômega 3', 'Probióticos', 'Valeriana'], ARRAY['Cafeína', 'Álcool', 'Açúcares'], 'Magnésio estabiliza sistema nervoso e reduz ataques', 'Estudos clínicos', 4),

('Irritabilidade', 'Facilidade para se irritar', ARRAY['Magnésio', 'Ômega 3', 'Vitamina B6', 'Probióticos'], ARRAY['Cafeína', 'Açúcares', 'Álcool'], 'Magnésio relaxa músculos e reduz irritabilidade', 'Estudos clínicos', 4),

-- ESTADOS DE HUMOR
('Depressão', 'Tristeza persistente e falta de energia', ARRAY['Ômega 3', 'Vitamina D', 'Probióticos', 'Triptofano'], ARRAY['Açúcares', 'Alimentos processados', 'Álcool'], 'Ômega 3 modula neurotransmissores e reduz inflamação', 'Meta-análise', 5),

('Tristeza', 'Estado de melancolia e tristeza', ARRAY['Ômega 3', 'Vitamina D', 'Probióticos', 'Chocolate amargo'], ARRAY['Açúcares', 'Álcool'], 'Ômega 3 melhora humor e reduz inflamação', 'Estudos clínicos', 4),

('Melancolia', 'Estado de tristeza profunda', ARRAY['Ômega 3', 'Vitamina D', 'Probióticos', 'Triptofano'], ARRAY['Açúcares', 'Álcool'], 'Triptofano é precursora da serotonina', 'Estudos clínicos', 4),

('Apatia', 'Falta de interesse e motivação', ARRAY['Ômega 3', 'Vitamina B12', 'Ferro', 'Probióticos'], ARRAY['Açúcares', 'Alimentos processados'], 'Vitamina B12 é essencial para energia e humor', 'Estudos clínicos', 4),

-- ESTADOS DE ENERGIA
('Fadiga Mental', 'Cansaço mental e falta de concentração', ARRAY['Ômega 3', 'Vitamina B12', 'Ferro', 'Ginseng'], ARRAY['Açúcares', 'Cafeína', 'Álcool'], 'Vitamina B12 melhora função cognitiva', 'Estudos clínicos', 4),

('Falta de Foco', 'Dificuldade de concentração', ARRAY['Ômega 3', 'Ginseng', 'Bacopa', 'Probióticos'], ARRAY['Açúcares', 'Alimentos processados'], 'Ômega 3 melhora função cognitiva e foco', 'Estudos clínicos', 4),

('Confusão Mental', 'Estado de confusão e desorientação', ARRAY['Ômega 3', 'Vitamina B12', 'Ginkgo', 'Probióticos'], ARRAY['Álcool', 'Açúcares'], 'Ômega 3 melhora clareza mental', 'Estudos clínicos', 4),

('Névoa Cerebral', 'Dificuldade de pensar claramente', ARRAY['Ômega 3', 'Vitamina B12', 'Probióticos', 'Ginkgo'], ARRAY['Açúcares', 'Alimentos processados'], 'Probióticos melhoram função cognitiva', 'Estudos clínicos', 4),

-- ESTADOS DE SONO
('Insônia', 'Dificuldade para dormir', ARRAY['Camomila', 'Valeriana', 'Magnésio', 'Passiflora'], ARRAY['Cafeína', 'Álcool', 'Alimentos pesados'], 'Camomila contém apigenina que se liga a receptores GABA', 'Estudos clínicos', 4),

('Sono Agitado', 'Sono de má qualidade', ARRAY['Magnésio', 'Camomila', 'Valeriana', 'Probióticos'], ARRAY['Cafeína', 'Álcool', 'Alimentos pesados'], 'Magnésio relaxa músculos e melhora sono', 'Estudos clínicos', 4),

('Pesadelos', 'Sonhos perturbadores', ARRAY['Magnésio', 'Camomila', 'Valeriana', 'Probióticos'], ARRAY['Álcool', 'Alimentos pesados'], 'Magnésio estabiliza sistema nervoso', 'Estudos clínicos', 4),

('Acordar Cansado', 'Fadiga ao acordar', ARRAY['Ômega 3', 'Vitamina B12', 'Probióticos', 'Magnésio'], ARRAY['Álcool', 'Açúcares'], 'Probióticos melhoram qualidade do sono', 'Estudos clínicos', 4),

-- ESTADOS DE MOTIVAÇÃO
('Falta de Motivação', 'Ausência de vontade para agir', ARRAY['Ômega 3', 'Vitamina B12', 'Ginseng', 'Probióticos'], ARRAY['Açúcares', 'Alimentos processados'], 'Vitamina B12 melhora energia e motivação', 'Estudos clínicos', 4),

('Procrastinação', 'Adiar tarefas importantes', ARRAY['Ômega 3', 'Ginseng', 'Bacopa', 'Probióticos'], ARRAY['Açúcares', 'Cafeína'], 'Ômega 3 melhora função executiva', 'Estudos clínicos', 4),

('Falta de Energia', 'Cansaço e falta de vitalidade', ARRAY['Vitamina B12', 'Ferro', 'Ômega 3', 'Ginseng'], ARRAY['Açúcares', 'Alimentos processados'], 'Vitamina B12 é essencial para produção de energia', 'Estudos clínicos', 4),

('Lentidão Mental', 'Processamento mental lento', ARRAY['Ômega 3', 'Ginkgo', 'Bacopa', 'Probióticos'], ARRAY['Açúcares', 'Alimentos processados'], 'Ômega 3 melhora velocidade de processamento', 'Estudos clínicos', 4),

-- ESTADOS DE HUMOR POSITIVO
('Euforia', 'Estado de alegria excessiva', ARRAY['Magnésio', 'Ômega 3', 'Probióticos'], ARRAY['Açúcares', 'Cafeína'], 'Magnésio estabiliza humor', 'Estudos clínicos', 4),

('Humor Elevado', 'Estado de alegria e bem-estar', ARRAY['Ômega 3', 'Probióticos', 'Triptofano'], ARRAY['Açúcares', 'Álcool'], 'Ômega 3 mantém humor estável', 'Estudos clínicos', 4),

('Bem-estar', 'Estado de satisfação e paz', ARRAY['Ômega 3', 'Probióticos', 'Magnésio'], ARRAY['Açúcares', 'Alimentos processados'], 'Probióticos melhoram bem-estar geral', 'Estudos clínicos', 4),

('Gratidão', 'Sentimento de agradecimento', ARRAY['Ômega 3', 'Probióticos', 'Triptofano'], ARRAY['Açúcares', 'Álcool'], 'Ômega 3 melhora perspectiva positiva', 'Estudos clínicos', 4),

-- ESTADOS DE SOCIALIZAÇÃO
('Timidez', 'Dificuldade em socializar', ARRAY['Ômega 3', 'Magnésio', 'Probióticos'], ARRAY['Cafeína', 'Álcool'], 'Magnésio reduz ansiedade social', 'Estudos clínicos', 4),

('Ansiedade Social', 'Medo de situações sociais', ARRAY['Magnésio', 'Ômega 3', 'Probióticos', 'Ashwagandha'], ARRAY['Cafeína', 'Álcool'], 'Ashwagandha reduz ansiedade social', 'Estudos clínicos', 4),

('Solidão', 'Sentimento de isolamento', ARRAY['Ômega 3', 'Probióticos', 'Triptofano'], ARRAY['Açúcares', 'Álcool'], 'Ômega 3 melhora humor e conexão social', 'Estudos clínicos', 4),

('Isolamento', 'Estado de separação social', ARRAY['Ômega 3', 'Vitamina D', 'Probióticos'], ARRAY['Açúcares', 'Álcool'], 'Vitamina D melhora humor e socialização', 'Estudos clínicos', 4),

-- ESTADOS DE CONTROLE
('Impulsividade', 'Ações sem pensar', ARRAY['Ômega 3', 'Magnésio', 'Probióticos'], ARRAY['Açúcares', 'Cafeína'], 'Ômega 3 melhora controle executivo', 'Estudos clínicos', 4),

('Compulsão', 'Comportamento repetitivo', ARRAY['Ômega 3', 'Magnésio', 'Probióticos'], ARRAY['Açúcares', 'Alimentos processados'], 'Magnésio estabiliza sistema nervoso', 'Estudos clínicos', 4),

('Vício', 'Dependência de substâncias', ARRAY['Ômega 3', 'Magnésio', 'Probióticos'], ARRAY['Álcool', 'Açúcares'], 'Ômega 3 melhora controle de impulsos', 'Estudos clínicos', 4),

('Falta de Controle', 'Dificuldade de autocontrole', ARRAY['Ômega 3', 'Magnésio', 'Probióticos'], ARRAY['Açúcares', 'Cafeína'], 'Magnésio melhora controle executivo', 'Estudos clínicos', 4),

-- ESTADOS DE MEMÓRIA
('Esquecimento', 'Dificuldade de lembrar', ARRAY['Ômega 3', 'Ginkgo', 'Bacopa', 'Probióticos'], ARRAY['Açúcares', 'Álcool'], 'Ômega 3 melhora memória e cognição', 'Estudos clínicos', 4),

('Perda de Memória', 'Dificuldade de reter informações', ARRAY['Ômega 3', 'Ginkgo', 'Bacopa', 'Vitamina B12'], ARRAY['Açúcares', 'Álcool'], 'Ginkgo melhora fluxo sanguíneo cerebral', 'Estudos clínicos', 4),

('Memória Fraca', 'Dificuldade de recordar', ARRAY['Ômega 3', 'Bacopa', 'Ginkgo', 'Probióticos'], ARRAY['Açúcares', 'Alimentos processados'], 'Bacopa melhora memória e cognição', 'Estudos clínicos', 4),

('Confusão de Memória', 'Dificuldade de organizar lembranças', ARRAY['Ômega 3', 'Ginkgo', 'Bacopa', 'Probióticos'], ARRAY['Álcool', 'Açúcares'], 'Ômega 3 melhora organização mental', 'Estudos clínicos', 4); 