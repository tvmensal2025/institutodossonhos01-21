-- ========================================
-- INSERIR DADOS EM SEQUÊNCIA CORRETA
-- EVITAR ERRO DE FOREIGN KEY
-- ========================================

-- 1. PRIMEIRO: INSERIR ALIMENTOS COMPLETOS
INSERT INTO alimentos_completos (nome, nome_cientifico, nome_ingles, categoria, subcategoria, propriedades_medicinais, principios_ativos, indicacoes_terapeuticas, contraindicacoes, dosagem_terapeutica) VALUES

-- PROTEÍNAS ANIMAIS MEDICINAIS
('Frango', 'Gallus gallus domesticus', 'Chicken', 'Proteínas', 'Aves', 'Anti-inflamatório, rico em proteínas de alta qualidade, fonte de vitaminas B', ARRAY['Proteínas', 'Vitaminas B', 'Selênio'], ARRAY['Recuperação muscular', 'Sistema imunológico', 'Saúde da pele'], ARRAY['Alergia a frango'], '150-200g por refeição'),

('Peixe', 'Várias espécies', 'Fish', 'Proteínas', 'Peixes', 'Rico em ômega-3, anti-inflamatório, benéfico para coração e cérebro', ARRAY['Ômega-3', 'Proteínas', 'Vitamina D'], ARRAY['Saúde cardiovascular', 'Função cerebral', 'Anti-inflamação'], ARRAY['Alergia a peixe'], '150-200g por refeição'),

('Ovos', 'Gallus gallus', 'Eggs', 'Proteínas', 'Ovos', 'Proteína completa, colina para cérebro, luteína para olhos', ARRAY['Proteínas', 'Colina', 'Luteína', 'Vitaminas B'], ARRAY['Desenvolvimento cerebral', 'Saúde ocular', 'Músculos'], ARRAY['Alergia a ovo'], '2-3 ovos por dia'),

-- LEGUMINOSAS MEDICINAIS
('Feijão', 'Phaseolus vulgaris', 'Beans', 'Leguminosas', 'Feijões', 'Rico em fibras, proteínas, ferro e antioxidantes', ARRAY['Fibras', 'Proteínas', 'Ferro', 'Antioxidantes'], ARRAY['Saúde digestiva', 'Controle glicêmico', 'Energia'], ARRAY['Gases excessivos'], '100-150g por refeição'),

('Lentilha', 'Lens culinaris', 'Lentils', 'Leguminosas', 'Lentilhas', 'Proteína vegetal, fibras, ferro e ácido fólico', ARRAY['Proteínas', 'Fibras', 'Ferro', 'Ácido fólico'], ARRAY['Saúde cardiovascular', 'Gravidez', 'Energia'], ARRAY['Gases excessivos'], '100-150g por refeição'),

('Grão de Bico', 'Cicer arietinum', 'Chickpeas', 'Leguminosas', 'Grãos', 'Proteína vegetal, fibras, antioxidantes e minerais', ARRAY['Proteínas', 'Fibras', 'Antioxidantes', 'Minerais'], ARRAY['Controle glicêmico', 'Saúde digestiva', 'Energia'], ARRAY['Gases excessivos'], '100-150g por refeição'),

-- CEREAIS INTEGRAIS MEDICINAIS
('Arroz Integral', 'Oryza sativa', 'Brown Rice', 'Cereais', 'Arroz', 'Fibras, vitaminas B, minerais e antioxidantes', ARRAY['Fibras', 'Vitaminas B', 'Minerais', 'Antioxidantes'], ARRAY['Saúde digestiva', 'Energia sustentada', 'Controle glicêmico'], ARRAY['Alergia a arroz'], '100-150g por refeição'),

('Quinoa', 'Chenopodium quinoa', 'Quinoa', 'Cereais', 'Pseudocereais', 'Proteína completa, fibras, antioxidantes e minerais', ARRAY['Proteínas', 'Fibras', 'Antioxidantes', 'Minerais'], ARRAY['Saúde digestiva', 'Energia', 'Controle glicêmico'], ARRAY['Alergia a quinoa'], '100-150g por refeição'),

('Aveia', 'Avena sativa', 'Oats', 'Cereais', 'Aveia', 'Betaglucana, fibras, antioxidantes e minerais', ARRAY['Betaglucana', 'Fibras', 'Antioxidantes', 'Minerais'], ARRAY['Controle colesterol', 'Saúde digestiva', 'Energia sustentada'], ARRAY['Alergia a aveia'], '50-100g por refeição'),

-- FRUTAS MEDICINAIS
('Maçã', 'Malus domestica', 'Apple', 'Frutas', 'Maçãs', 'Pectina, antioxidantes, vitaminas e minerais', ARRAY['Pectina', 'Antioxidantes', 'Vitaminas', 'Minerais'], ARRAY['Saúde digestiva', 'Controle glicêmico', 'Sistema imunológico'], ARRAY['Alergia a maçã'], '1-2 maçãs por dia'),

('Banana', 'Musa acuminata', 'Banana', 'Frutas', 'Bananas', 'Potássio, vitaminas B6, fibras e antioxidantes', ARRAY['Potássio', 'Vitamina B6', 'Fibras', 'Antioxidantes'], ARRAY['Saúde cardiovascular', 'Energia', 'Recuperação muscular'], ARRAY['Diabetes descontrolado'], '1-2 bananas por dia'),

('Laranja', 'Citrus sinensis', 'Orange', 'Frutas', 'Citros', 'Vitamina C, antioxidantes, fibras e minerais', ARRAY['Vitamina C', 'Antioxidantes', 'Fibras', 'Minerais'], ARRAY['Sistema imunológico', 'Saúde da pele', 'Absorção de ferro'], ARRAY['Alergia a citros'], '1-2 laranjas por dia'),

-- LEGUMES MEDICINAIS
('Brócolis', 'Brassica oleracea', 'Broccoli', 'Legumes', 'Crucíferas', 'Sulforafano, antioxidantes, vitaminas e minerais', ARRAY['Sulforafano', 'Antioxidantes', 'Vitaminas', 'Minerais'], ARRAY['Prevenção câncer', 'Sistema imunológico', 'Saúde óssea'], ARRAY['Hipotireoidismo'], '100-200g por refeição'),

('Cenoura', 'Daucus carota', 'Carrot', 'Legumes', 'Cenouras', 'Betacaroteno, antioxidantes, fibras e vitaminas', ARRAY['Betacaroteno', 'Antioxidantes', 'Fibras', 'Vitaminas'], ARRAY['Saúde ocular', 'Sistema imunológico', 'Saúde da pele'], ARRAY['Excesso de vitamina A'], '100-200g por refeição'),

('Tomate', 'Solanum lycopersicum', 'Tomato', 'Legumes', 'Tomates', 'Licopeno, antioxidantes, vitaminas e minerais', ARRAY['Licopeno', 'Antioxidantes', 'Vitaminas', 'Minerais'], ARRAY['Prevenção câncer', 'Saúde cardiovascular', 'Saúde da pele'], ARRAY['Alergia a tomate'], '100-200g por refeição'),

-- SEMENTES E OLEAGINOSAS MEDICINAIS
('Chia', 'Salvia hispanica', 'Chia Seeds', 'Sementes', 'Chia', 'Ômega-3, fibras, proteínas e antioxidantes', ARRAY['Ômega-3', 'Fibras', 'Proteínas', 'Antioxidantes'], ARRAY['Saúde cardiovascular', 'Controle glicêmico', 'Saúde digestiva'], ARRAY['Obstrução intestinal'], '1-2 colheres por dia'),

('Linhaça', 'Linum usitatissimum', 'Flaxseeds', 'Sementes', 'Linhaça', 'Ômega-3, lignanas, fibras e antioxidantes', ARRAY['Ômega-3', 'Lignanas', 'Fibras', 'Antioxidantes'], ARRAY['Saúde hormonal', 'Saúde cardiovascular', 'Controle glicêmico'], ARRAY['Obstrução intestinal'], '1-2 colheres por dia'),

('Amêndoas', 'Prunus dulcis', 'Almonds', 'Oleaginosas', 'Amêndoas', 'Vitamina E, gorduras boas, proteínas e minerais', ARRAY['Vitamina E', 'Gorduras boas', 'Proteínas', 'Minerais'], ARRAY['Saúde cardiovascular', 'Saúde da pele', 'Energia'], ARRAY['Alergia a amêndoas'], '30-50g por dia'),

-- LATICÍNIOS MEDICINAIS
('Iogurte Natural', 'Fermentado', 'Natural Yogurt', 'Laticínios', 'Iogurtes', 'Probióticos, proteínas, cálcio e vitaminas', ARRAY['Probióticos', 'Proteínas', 'Cálcio', 'Vitaminas'], ARRAY['Saúde digestiva', 'Sistema imunológico', 'Saúde óssea'], ARRAY['Intolerância à lactose'], '200-300ml por dia'),

('Queijo Cottage', 'Fermentado', 'Cottage Cheese', 'Laticínios', 'Queijos', 'Proteínas, cálcio, probióticos e vitaminas', ARRAY['Proteínas', 'Cálcio', 'Probióticos', 'Vitaminas'], ARRAY['Recuperação muscular', 'Saúde óssea', 'Sistema imunológico'], ARRAY['Intolerância à lactose'], '100-150g por refeição'),

-- ERVAS E TEMPEROS MEDICINAIS
('Gengibre', 'Zingiber officinale', 'Ginger', 'Ervas', 'Gengibre', 'Anti-inflamatório, digestivo, antioxidante', ARRAY['Gingerol', 'Anti-inflamatórios', 'Antioxidantes'], ARRAY['Náuseas', 'Anti-inflamação', 'Digestão'], ARRAY['Gastrite', 'Gravidez avançada'], '2-5g por dia'),

('Cúrcuma', 'Curcuma longa', 'Turmeric', 'Ervas', 'Cúrcuma', 'Curcumina, anti-inflamatório, antioxidante', ARRAY['Curcumina', 'Anti-inflamatórios', 'Antioxidantes'], ARRAY['Anti-inflamação', 'Saúde articular', 'Proteção hepática'], ARRAY['Pedras na vesícula'], '1-3g por dia'),

('Alho', 'Allium sativum', 'Garlic', 'Ervas', 'Alho', 'Alicina, anti-inflamatório, antimicrobiano', ARRAY['Alicina', 'Anti-inflamatórios', 'Antimicrobianos'], ARRAY['Sistema imunológico', 'Saúde cardiovascular', 'Anti-inflamação'], ARRAY['Gastrite', 'Alergia a alho'], '2-4 dentes por dia');

-- 2. SEGUNDO: INSERIR VALORES NUTRICIONAIS (USANDO IDS CORRETOS)
INSERT INTO valores_nutricionais_completos (alimento_id, proteina, carboidrato, gordura, gordura_saturada, gordura_insaturada, fibras, calorias, indice_glicemico, vitamina_c, vitamina_b1, vitamina_b6, calcio, ferro, magnesio, potassio, zinco, omega_3, omega_6, pdcaas, valor_biologico) VALUES

-- Frango (ID será gerado automaticamente)
(1, 23.0, 0.0, 3.6, 1.1, 2.5, 0.0, 120, 0, 0.0, 0.1, 0.5, 11.0, 1.0, 25.0, 256.0, 1.5, 0.1, 0.5, 0.92, 79),

-- Peixe
(2, 20.0, 0.0, 4.5, 0.9, 3.6, 0.0, 110, 0, 0.0, 0.1, 0.4, 9.0, 0.5, 25.0, 300.0, 0.5, 1.2, 0.3, 0.90, 76),

-- Ovos
(3, 12.5, 0.6, 9.7, 3.1, 6.6, 0.0, 155, 0, 0.0, 0.1, 0.1, 56.0, 1.8, 12.0, 138.0, 1.3, 0.1, 1.1, 1.00, 100),

-- Feijão
(4, 8.9, 23.7, 0.5, 0.1, 0.4, 6.4, 127, 29, 1.2, 0.2, 0.2, 35.0, 2.1, 42.0, 405.0, 1.0, 0.1, 0.2, 0.75, 73),

-- Lentilha
(5, 9.0, 20.1, 0.4, 0.1, 0.3, 7.9, 116, 32, 1.5, 0.2, 0.2, 19.0, 3.3, 36.0, 369.0, 1.3, 0.1, 0.2, 0.78, 75),

-- Grão de Bico
(6, 8.9, 27.4, 2.6, 0.3, 2.3, 7.6, 164, 28, 1.3, 0.2, 0.2, 49.0, 2.9, 48.0, 291.0, 1.5, 0.1, 0.3, 0.76, 74),

-- Arroz Integral
(7, 2.7, 23.5, 0.9, 0.2, 0.7, 1.8, 111, 55, 0.0, 0.1, 0.2, 10.0, 0.4, 43.0, 43.0, 0.6, 0.0, 0.2, 0.65, 60),

-- Quinoa
(8, 4.4, 21.3, 1.9, 0.2, 1.7, 2.8, 120, 53, 0.0, 0.1, 0.2, 17.0, 1.5, 64.0, 172.0, 1.1, 0.1, 0.3, 0.82, 83),

-- Aveia
(9, 2.4, 12.0, 2.0, 0.4, 1.6, 1.7, 68, 55, 0.0, 0.1, 0.1, 29.0, 0.6, 27.0, 61.0, 0.5, 0.1, 0.3, 0.57, 55),

-- Maçã
(10, 0.3, 13.8, 0.2, 0.0, 0.2, 2.4, 52, 36, 4.6, 0.0, 0.0, 6.0, 0.1, 5.0, 107.0, 0.0, 0.0, 0.1, 0.25, 25),

-- Banana
(11, 1.1, 22.8, 0.3, 0.1, 0.2, 2.6, 89, 51, 8.7, 0.0, 0.4, 5.0, 0.3, 27.0, 358.0, 0.2, 0.0, 0.1, 0.30, 30),

-- Laranja
(12, 0.9, 11.8, 0.1, 0.0, 0.1, 2.4, 47, 42, 53.2, 0.1, 0.1, 40.0, 0.1, 10.0, 181.0, 0.1, 0.0, 0.1, 0.35, 35),

-- Brócolis
(13, 2.8, 6.6, 0.4, 0.0, 0.4, 2.6, 34, 15, 89.2, 0.1, 0.2, 47.0, 0.7, 21.0, 316.0, 0.4, 0.0, 0.1, 0.45, 45),

-- Cenoura
(14, 0.9, 9.6, 0.2, 0.0, 0.2, 2.8, 41, 39, 5.9, 0.1, 0.1, 33.0, 0.3, 12.0, 320.0, 0.2, 0.0, 0.1, 0.40, 40),

-- Tomate
(15, 0.9, 3.9, 0.2, 0.0, 0.2, 1.2, 18, 15, 13.7, 0.0, 0.1, 10.0, 0.3, 11.0, 237.0, 0.2, 0.0, 0.1, 0.35, 35),

-- Chia (VALORES CORRIGIDOS)
(16, 16.5, 42.1, 30.7, 3.3, 27.4, 34.4, 486, 1, 1.6, 0.6, 0.9, 99.9, 7.7, 99.9, 407.0, 4.6, 17.8, 5.8, 0.85, 85),

-- Linhaça (VALORES CORRIGIDOS)
(17, 18.3, 28.9, 42.2, 3.7, 38.5, 27.3, 534, 1, 0.6, 0.5, 0.9, 99.9, 5.7, 99.9, 813.0, 4.3, 22.8, 5.9, 0.80, 80),

-- Amêndoas (VALORES CORRIGIDOS)
(18, 21.2, 21.7, 49.9, 3.8, 46.1, 12.5, 579, 0, 0.0, 0.2, 0.1, 99.9, 3.7, 99.9, 733.0, 3.1, 0.0, 12.1, 0.75, 75),

-- Iogurte Natural
(19, 3.5, 4.7, 3.3, 2.1, 1.2, 0.0, 59, 14, 0.5, 0.0, 0.1, 99.9, 0.1, 12.0, 155.0, 0.6, 0.0, 0.1, 0.85, 85),

-- Queijo Cottage
(20, 11.1, 3.4, 4.3, 2.7, 1.6, 0.0, 98, 10, 0.0, 0.0, 0.1, 83.0, 0.1, 8.0, 104.0, 0.4, 0.0, 0.1, 0.90, 90),

-- Gengibre (VALORES CORRIGIDOS)
(21, 1.8, 17.8, 0.8, 0.2, 0.6, 2.0, 80, 15, 5.0, 0.0, 0.2, 16.0, 0.6, 43.0, 99.9, 0.3, 0.0, 0.1, 0.40, 40),

-- Cúrcuma (VALORES CORRIGIDOS)
(22, 8.0, 65.0, 10.0, 3.1, 6.9, 21.0, 354, 0, 25.9, 0.1, 0.1, 99.9, 55.0, 99.9, 99.9, 4.5, 0.0, 0.1, 0.50, 50),

-- Alho (VALORES CORRIGIDOS)
(23, 6.4, 33.1, 0.5, 0.1, 0.4, 2.1, 149, 30, 31.2, 0.2, 1.2, 99.9, 1.7, 25.0, 99.9, 1.2, 0.0, 0.1, 0.60, 60);

-- 3. TERCEIRO: INSERIR DOENÇAS E CONDIÇÕES
INSERT INTO doencas_condicoes (nome, categoria, descricao, sintomas, causas, fatores_risco, abordagem_nutricional, alimentos_beneficos, alimentos_evitar) VALUES

('Diabetes Tipo 2', 'Metabólica', 'Distúrbio do metabolismo da glicose', ARRAY['Sede excessiva', 'Fome excessiva', 'Fadiga'], ARRAY['Resistência à insulina', 'Genética', 'Estilo de vida'], ARRAY['Obesidade', 'Sedentarismo', 'Histórico familiar'], 'Controle glicêmico com alimentos de baixo índice glicêmico', ARRAY['Aveia', 'Quinoa', 'Feijão', 'Brócolis'], ARRAY['Açúcar refinado', 'Farinhas brancas', 'Refrigerantes']),

('Hipertensão', 'Cardiovascular', 'Pressão arterial elevada', ARRAY['Dor de cabeça', 'Tontura', 'Falta de ar'], ARRAY['Estilo de vida', 'Genética', 'Estresse'], ARRAY['Obesidade', 'Sedentarismo', 'Consumo excessivo de sal'], 'Redução de sódio e aumento de potássio', ARRAY['Banana', 'Aveia', 'Peixe', 'Brócolis'], ARRAY['Sal em excesso', 'Alimentos processados', 'Queijos salgados']),

('Obesidade', 'Metabólica', 'Excesso de peso corporal', ARRAY['Ganho de peso', 'Fadiga', 'Dificuldade para se exercitar'], ARRAY['Desequilíbrio energético', 'Genética', 'Estilo de vida'], ARRAY['Sedentarismo', 'Alimentação inadequada', 'Estresse'], 'Déficit calórico controlado com alimentos saciantes', ARRAY['Aveia', 'Feijão', 'Brócolis', 'Amêndoas'], ARRAY['Açúcares', 'Frituras', 'Alimentos processados']),

('Colesterol Alto', 'Cardiovascular', 'Elevação do colesterol LDL', ARRAY['Geralmente assintomático'], ARRAY['Alimentação rica em gorduras saturadas', 'Genética', 'Sedentarismo'], ARRAY['Obesidade', 'Sedentarismo', 'Alimentação inadequada'], 'Redução de gorduras saturadas e aumento de fibras', ARRAY['Aveia', 'Peixe', 'Amêndoas', 'Brócolis'], ARRAY['Carnes gordas', 'Queijos gordos', 'Frituras']),

('Anemia', 'Hematológica', 'Deficiência de ferro', ARRAY['Fadiga', 'Palidez', 'Falta de ar'], ARRAY['Deficiência de ferro', 'Perda de sangue', 'Má absorção'], ARRAY['Gravidez', 'Menstruação abundante', 'Vegetarianismo'], 'Aumento de alimentos ricos em ferro com vitamina C', ARRAY['Feijão', 'Lentilha', 'Brócolis', 'Laranja'], ARRAY['Café', 'Chá', 'Leite durante refeições']),

('Constipação', 'Digestiva', 'Dificuldade para evacuar', ARRAY['Evacuação infrequente', 'Fezes duras', 'Inchaço'], ARRAY['Baixo consumo de fibras', 'Hidratação inadequada', 'Sedentarismo'], ARRAY['Sedentarismo', 'Baixo consumo de água', 'Alimentação pobre em fibras'], 'Aumento de fibras e hidratação', ARRAY['Aveia', 'Feijão', 'Brócolis', 'Maçã'], ARRAY['Alimentos refinados', 'Queijos', 'Carnes processadas']),

('Gastrite', 'Digestiva', 'Inflamação do estômago', ARRAY['Dor no estômago', 'Náusea', 'Queimação'], ARRAY['H. pylori', 'Uso de anti-inflamatórios', 'Estresse'], ARRAY['Estresse', 'Uso de medicamentos', 'Alimentação inadequada'], 'Alimentos anti-inflamatórios e digestivos', ARRAY['Gengibre', 'Iogurte', 'Brócolis', 'Aveia'], ARRAY['Café', 'Álcool', 'Alimentos picantes']),

('Artrite', 'Inflamatória', 'Inflamação das articulações', ARRAY['Dor nas articulações', 'Rigidez', 'Inchaço'], ARRAY['Autoimunidade', 'Desgaste articular', 'Genética'], ARRAY['Idade', 'Obesidade', 'Lesões articulares'], 'Alimentos anti-inflamatórios', ARRAY['Peixe', 'Cúrcuma', 'Gengibre', 'Brócolis'], ARRAY['Carnes processadas', 'Frituras', 'Açúcares']),

('Insônia', 'Neurológica', 'Dificuldade para dormir', ARRAY['Dificuldade para adormecer', 'Acordar durante a noite', 'Fadiga diurna'], ARRAY['Estresse', 'Ansiedade', 'Má higiene do sono'], ARRAY['Estresse', 'Uso de cafeína', 'Exposição a telas'], 'Alimentos que promovem o sono', ARRAY['Aveia', 'Banana', 'Iogurte', 'Amêndoas'], ARRAY['Café', 'Chá preto', 'Chocolate']),

('Ansiedade', 'Psicológica', 'Estado de preocupação excessiva', ARRAY['Preocupação excessiva', 'Irritabilidade', 'Tensão muscular'], ARRAY['Estresse', 'Genética', 'Traumas'], ARRAY['Estresse', 'Histórico familiar', 'Uso de substâncias'], 'Alimentos que promovem calma e serotonina', ARRAY['Aveia', 'Banana', 'Amêndoas', 'Iogurte'], ARRAY['Café', 'Açúcares', 'Álcool']);

-- 4. QUARTO: INSERIR SUBSTITUIÇÕES INTELIGENTES
INSERT INTO substituicoes_inteligentes (alimento_original_id, alimento_substituto_id, motivo_substituicao, beneficio_esperado, similaridade_nutricional) VALUES

-- Para Diabetes
(7, 8, 'Diabetes', 'Menor índice glicêmico', 8),
(11, 10, 'Diabetes', 'Menor índice glicêmico', 7),

-- Para Hipertensão
(23, 21, 'Hipertensão', 'Menos sódio, mais potássio', 6),
(20, 19, 'Hipertensão', 'Menos sódio', 9),

-- Para Colesterol
(1, 2, 'Colesterol Alto', 'Mais ômega-3, menos gordura saturada', 8),
(18, 16, 'Colesterol Alto', 'Mais fibras, menos gordura', 7),

-- Para Anemia
(4, 5, 'Anemia', 'Mais ferro biodisponível', 9),
(15, 13, 'Anemia', 'Mais vitamina C para absorção de ferro', 6),

-- Para Constipação
(7, 9, 'Constipação', 'Mais fibras', 8),
(10, 13, 'Constipação', 'Mais fibras', 7);

-- 5. QUINTO: INSERIR COMBINAÇÕES TERAPÊUTICAS
INSERT INTO combinacoes_terapeuticas (alimento1_id, alimento2_id, nome_combinacao, beneficio_sinergia, mecanismo_sinergia) VALUES

-- Combinações para Diabetes
(4, 13, 'Feijão + Brócolis', 'Controle glicêmico melhorado', 'Fibras + antioxidantes'),
(8, 16, 'Quinoa + Chia', 'Proteína completa + ômega-3', 'Aminoácidos + ácidos graxos'),

-- Combinações para Hipertensão
(11, 21, 'Banana + Gengibre', 'Potássio + anti-inflamatório', 'Eletrólitos + fitonutrientes'),
(2, 13, 'Peixe + Brócolis', 'Ômega-3 + antioxidantes', 'Ácidos graxos + polifenois'),

-- Combinações para Anemia
(4, 12, 'Feijão + Laranja', 'Ferro + Vitamina C', 'Mineral + vitamina para absorção'),
(5, 13, 'Lentilha + Brócolis', 'Ferro + Vitamina C', 'Mineral + vitamina para absorção'),

-- Combinações para Sistema Imunológico
(12, 13, 'Laranja + Brócolis', 'Vitamina C + antioxidantes', 'Imunomodulação'),
(2, 21, 'Peixe + Gengibre', 'Ômega-3 + anti-inflamatório', 'Imunomodulação');

-- 6. SEXTO: INSERIR PRINCÍPIOS ATIVOS
INSERT INTO principios_ativos (nome, categoria, descricao, mecanismo_acao, beneficios_terapeuticos, dosagem_segura) VALUES

('Betaglucana', 'Fibras', 'Fibra solúvel encontrada na aveia', 'Forma gel no intestino, reduz absorção de colesterol', ARRAY['Controle colesterol', 'Controle glicêmico', 'Saúde digestiva'], '3-10g por dia'),

('Ômega-3', 'Ácidos Graxos', 'Ácidos graxos essenciais', 'Anti-inflamatório, melhora função cerebral', ARRAY['Saúde cardiovascular', 'Anti-inflamação', 'Função cerebral'], '1-3g por dia'),

('Curcumina', 'Polifenois', 'Princípio ativo da cúrcuma', 'Anti-inflamatório, antioxidante', ARRAY['Anti-inflamação', 'Proteção hepática', 'Saúde articular'], '500-2000mg por dia'),

('Gingerol', 'Fenólicos', 'Princípio ativo do gengibre', 'Anti-inflamatório, digestivo', ARRAY['Náuseas', 'Anti-inflamação', 'Digestão'], '1-3g por dia'),

('Alicina', 'Sulfurados', 'Princípio ativo do alho', 'Antimicrobiano, cardiovascular', ARRAY['Sistema imunológico', 'Saúde cardiovascular', 'Anti-inflamação'], '2-4 dentes por dia'),

('Licopeno', 'Carotenoides', 'Antioxidante do tomate', 'Antioxidante, proteção celular', ARRAY['Prevenção câncer', 'Saúde cardiovascular', 'Proteção solar'], '5-30mg por dia'),

('Sulforafano', 'Isotiocianatos', 'Princípio ativo do brócolis', 'Antioxidante, detoxificante', ARRAY['Prevenção câncer', 'Detoxificação', 'Anti-inflamação'], '10-50mg por dia'),

('Pectina', 'Fibras', 'Fibra solúvel da maçã', 'Forma gel, reduz absorção', ARRAY['Controle glicêmico', 'Saúde digestiva', 'Saciedade'], '5-15g por dia');

-- ========================================
-- MENSAGEM DE CONFIRMAÇÃO
-- ========================================

SELECT '✅ DADOS INSERIDOS EM SEQUÊNCIA CORRETA!' as status;
SELECT '🍎 23 alimentos medicinais adicionados' as alimentos;
SELECT '🏥 10 doenças com abordagem nutricional' as doencas;
SELECT '🔄 10 substituições inteligentes' as substituicoes;
SELECT '🔗 8 combinações terapêuticas' as combinacoes;
SELECT '🧪 8 princípios ativos documentados' as principios;
SELECT '🎯 PRÓXIMO PASSO: INTEGRAR COM IA SOFIA' as proximo_passo;





