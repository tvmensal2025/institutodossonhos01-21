-- ========================================
-- SOFIA - SUBSTITUIÇÕES INTELIGENTES
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- SUBSTITUIÇÕES ALIMENTARES PARA CONDIÇÕES ESPECÍFICAS
-- ========================================

-- INSERIR SUBSTITUIÇÕES INTELIGENTES
INSERT INTO substituicoes_inteligentes (alimento_original_id, alimento_substituto_id, motivo_substituicao, doenca_condicao_id, beneficio_esperado, similaridade_nutricional, vantagens, desvantagens, forma_preparo, dosagem_equivalente, tempo_adaptacao, contraindicacoes) VALUES

-- SUBSTITUIÇÕES PARA DIABETES
(1, 2, 'Controle glicêmico', 2, 'Melhor controle da glicemia', 8, 'Menor índice glicêmico, mais fibras', 'Sabor diferente', 'Cozinhar com temperos', '1:1 por peso', '2-4 semanas', 'Alergia a peixe'),

(5, 7, 'Controle glicêmico', 2, 'Liberação mais lenta de glicose', 7, 'Mais fibras, menor índice glicêmico', 'Tempo de cozimento maior', 'Deixar de molho, cozinhar bem', '1:1 por volume', '1-2 semanas', 'Intolerância ao glúten'),

-- SUBSTITUIÇÕES PARA HIPERTENSÃO
(3, 18, 'Redução de sódio', 1, 'Menor pressão arterial', 6, 'Menos sódio, mais potássio', 'Menos proteína', 'Consumir cru ou cozido', '2 ovos = 30g amêndoas', '1-2 semanas', 'Alergia a oleaginosas'),

(15, 16, 'Redução de sódio', 1, 'Menor pressão arterial', 7, 'Menos sódio, mais potássio', 'Sabor diferente', 'Consumir fresco', '1:1 por peso', 'Imediato', 'Alergia a frutas'),

-- SUBSTITUIÇÕES PARA COLESTEROL ALTO
(2, 17, 'Redução de colesterol', 3, 'Menor colesterol LDL', 8, 'Mais ômega 3, menos colesterol', 'Preço mais alto', 'Consumir fresco ou suco', '100g salmão = 100g açaí', '2-4 semanas', 'Alergia a frutas'),

(18, 19, 'Redução de colesterol', 3, 'Menor colesterol LDL', 9, 'Mais fibras, menos gordura', 'Sabor diferente', 'Consumir cru ou tostado', '1:1 por peso', '1-2 semanas', 'Alergia a sementes'),

-- SUBSTITUIÇÕES PARA INFLAMAÇÃO
(1, 20, 'Anti-inflamatório', 4, 'Redução da inflamação', 7, 'Mais ômega 3, menos gordura saturada', 'Preço mais alto', 'Consumir fresco', '100g frango = 100g chia', '2-4 semanas', 'Alergia a sementes'),

(5, 21, 'Anti-inflamatório', 4, 'Redução da inflamação', 8, 'Mais fibras, menos glúten', 'Sabor diferente', 'Germinar antes de consumir', '1:1 por volume', '1-2 semanas', 'Obstrução intestinal'),

-- SUBSTITUIÇÕES PARA DIGESTÃO
(3, 22, 'Melhora digestiva', 5, 'Melhor digestão', 6, 'Mais fibras, menos gordura', 'Menos proteína', 'Consumir cru ou cozido', '2 ovos = 1 xícara de camomila', 'Imediato', 'Alergia a ervas'),

(7, 23, 'Melhora digestiva', 5, 'Melhor digestão', 7, 'Mais fibras, menos glúten', 'Sabor diferente', 'Consumir cru ou germinado', '1:1 por volume', '1-2 semanas', 'Alergia a sementes'),

-- SUBSTITUIÇÕES PARA IMUNIDADE
(1, 24, 'Imunomodulador', 6, 'Melhor imunidade', 6, 'Mais antioxidantes, menos gordura', 'Menos proteína', 'Consumir fresco ou seco', '100g frango = 50g shiitake', '2-4 semanas', 'Alergia a cogumelos'),

(2, 25, 'Imunomodulador', 6, 'Melhor imunidade', 8, 'Mais antioxidantes, menos mercúrio', 'Preço mais alto', 'Consumir fresco ou seco', '100g salmão = 50g maitake', '2-4 semanas', 'Alergia a cogumelos'),

-- SUBSTITUIÇÕES PARA PROTEÇÃO HEPÁTICA
(1, 26, 'Hepatoprotetor', 7, 'Proteção hepática', 5, 'Mais antioxidantes, menos gordura', 'Menos proteína', 'Chá ou extrato', '100g frango = 1g cardo mariano', '2-4 semanas', 'Gravidez'),

(2, 27, 'Hepatoprotetor', 7, 'Proteção hepática', 6, 'Mais antioxidantes, menos gordura', 'Menos proteína', 'Chá ou extrato', '100g salmão = 1g boldo', '2-4 semanas', 'Gravidez'),

-- SUBSTITUIÇÕES PARA CARDIOVASCULAR
(1, 28, 'Cardioprotetor', 1, 'Proteção cardiovascular', 7, 'Mais antioxidantes, menos gordura', 'Menos proteína', 'Chá ou extrato', '100g frango = 1g hawthorn', '2-4 semanas', 'Bradicardia'),

(2, 29, 'Cardioprotetor', 1, 'Proteção cardiovascular', 8, 'Mais ômega 3, menos gordura saturada', 'Preço mais alto', 'Consumir fresco ou óleo', '100g salmão = 15ml óleo de oliva', '2-4 semanas', 'Alergia a azeitonas'),

-- SUBSTITUIÇÕES PARA DIGESTÃO
(3, 30, 'Digestivo', 5, 'Melhor digestão', 5, 'Mais fibras, menos gordura', 'Menos proteína', 'Chá ou óleo essencial', '2 ovos = 1-3 cápsulas de hortelã', 'Imediato', 'Refluxo'),

(7, 31, 'Digestivo', 5, 'Melhor digestão', 6, 'Mais fibras, menos glúten', 'Sabor diferente', 'Chá ou extrato', '1 xícara aveia = 1g espinheira santa', '1-2 semanas', 'Gravidez'),

-- SUBSTITUIÇÕES PARA ADAPTOGÊNICOS
(1, 32, 'Adaptógeno', 8, 'Melhor resposta ao stress', 5, 'Mais antioxidantes, menos gordura', 'Menos proteína', 'Extrato padronizado', '100g frango = 300mg ashwagandha', '2-4 semanas', 'Gravidez'),

(2, 33, 'Adaptógeno', 8, 'Melhor resposta ao stress', 6, 'Mais antioxidantes, menos gordura', 'Menos proteína', 'Chá ou extrato', '100g salmão = 1-3g jatobá', '2-4 semanas', 'Gravidez'),

-- SUBSTITUIÇÕES PARA ANTIOXIDANTES
(15, 34, 'Antioxidante', 9, 'Proteção antioxidante', 8, 'Mais antioxidantes, menos açúcar', 'Sabor diferente', 'Consumir fresco', '1 banana = 50g mirtilo', 'Imediato', 'Alergia a frutas'),

(18, 35, 'Antioxidante', 9, 'Proteção antioxidante', 7, 'Mais antioxidantes, menos gordura', 'Sabor diferente', 'Consumir cru ou tostado', '30g amêndoas = 30g linhaça', '1-2 semanas', 'Alergia a sementes'),

-- SUBSTITUIÇÕES PARA PROTEÍNAS FUNCIONAIS
(1, 36, 'Proteína funcional', 10, 'Melhor recuperação muscular', 9, 'Mais BCAAs, menos gordura', 'Preço mais alto', 'Shake pós-treino', '100g frango = 30g whey protein', 'Imediato', 'Intolerância à lactose'),

(2, 37, 'Proteína funcional', 10, 'Melhor recuperação muscular', 8, 'Mais ômega 3, menos gordura', 'Preço mais alto', 'Consumir fresco', '100g salmão = 30g whey protein', 'Imediato', 'Intolerância à lactose'),

-- SUBSTITUIÇÕES PARA PROBIÓTICOS
(3, 38, 'Probiótico', 5, 'Melhor saúde intestinal', 5, 'Mais probióticos, menos proteína', 'Menos proteína', 'Consumir fresco', '2 ovos = 200ml kefir', 'Imediato', 'Intolerância à lactose'),

(7, 39, 'Probiótico', 5, 'Melhor saúde intestinal', 6, 'Mais probióticos, menos glúten', 'Menos fibras', 'Consumir fresco', '1 xícara aveia = 200ml kefir', 'Imediato', 'Intolerância à lactose'),

-- SUBSTITUIÇÕES PARA ÔMEGA 3
(2, 40, 'Ômega 3', 1, 'Melhor saúde cardiovascular', 9, 'Mais ômega 3, menos mercúrio', 'Preço mais alto', 'Cápsula com refeição', '100g salmão = 1000mg óleo de peixe', '2-4 semanas', 'Alergia a peixes'),

(18, 41, 'Ômega 3', 1, 'Melhor saúde cardiovascular', 8, 'Mais ômega 3, menos gordura saturada', 'Sabor diferente', 'Consumir cru ou germinado', '30g amêndoas = 15g chia', '1-2 semanas', 'Alergia a sementes'),

-- SUBSTITUIÇÕES PARA VITAMINAS
(3, 42, 'Vitamina D', 11, 'Melhor saúde óssea', 4, 'Mais vitamina D, menos colesterol', 'Menos proteína', 'Cápsula com gordura', '2 ovos = 1000 UI vitamina D3', '2-4 semanas', 'Hipercalcemia'),

(15, 43, 'Vitamina D', 11, 'Melhor saúde óssea', 5, 'Mais vitamina D, menos açúcar', 'Sabor diferente', 'Consumir fresco', '1 banana = 1000 UI vitamina D3', '2-4 semanas', 'Hipercalcemia'),

-- SUBSTITUIÇÕES PARA MINERAIS
(1, 44, 'Magnésio', 12, 'Melhor relaxamento muscular', 6, 'Mais magnésio, menos gordura', 'Menos proteína', 'Citrato ou quelato', '100g frango = 200mg magnésio', '2-4 semanas', 'Insuficiência renal'),

(7, 45, 'Magnésio', 12, 'Melhor relaxamento muscular', 7, 'Mais magnésio, menos glúten', 'Sabor diferente', 'Citrato ou quelato', '1 xícara aveia = 200mg magnésio', '2-4 semanas', 'Insuficiência renal'),

-- SUBSTITUIÇÕES PARA FIBRAS FUNCIONAIS
(5, 46, 'Fibra funcional', 13, 'Melhor saúde intestinal', 8, 'Mais fibras, menos glúten', 'Sabor diferente', 'Misturado em água', '1 xícara arroz = 5g psyllium', 'Imediato', 'Obstrução intestinal'),

(7, 47, 'Fibra funcional', 13, 'Melhor saúde intestinal', 9, 'Mais fibras, menos glúten', 'Sabor diferente', 'Misturado em água', '1 xícara aveia = 5g psyllium', 'Imediato', 'Obstrução intestinal'),

-- SUBSTITUIÇÕES PARA ENZIMAS
(2, 48, 'Enzima digestiva', 5, 'Melhor digestão', 6, 'Mais enzimas, menos gordura', 'Menos proteína', 'Cápsula entre refeições', '100g salmão = 500mg bromelina', 'Imediato', 'Úlcera'),

(15, 49, 'Enzima digestiva', 5, 'Melhor digestão', 7, 'Mais enzimas, menos açúcar', 'Sabor diferente', 'Cápsula entre refeições', '1 banana = 500mg bromelina', 'Imediato', 'Úlcera'),

-- SUBSTITUIÇÕES PARA ADAPTOGÊNICOS BRASILEIROS
(1, 50, 'Adaptógeno brasileiro', 8, 'Melhor resposta ao stress', 5, 'Mais adaptógenos, menos gordura', 'Menos proteína', 'Chá ou extrato', '100g frango = 1-3g jatobá', '2-4 semanas', 'Gravidez'),

(2, 51, 'Adaptógeno brasileiro', 8, 'Melhor resposta ao stress', 6, 'Mais adaptógenos, menos gordura', 'Menos proteína', 'Pó ou cápsula', '100g salmão = 200mg guaraná', '2-4 semanas', 'Hipertensão'),

-- SUBSTITUIÇÕES PARA PLANTAS MEDICINAIS BRASILEIRAS
(1, 52, 'Planta medicinal brasileira', 7, 'Proteção hepática', 5, 'Mais hepatoprotetores, menos gordura', 'Menos proteína', 'Chá ou extrato', '100g frango = 1-3g boldo', '2-4 semanas', 'Gravidez'),

(2, 53, 'Planta medicinal brasileira', 5, 'Proteção gástrica', 6, 'Mais gastroprotetores, menos gordura', 'Menos proteína', 'Chá ou extrato', '100g salmão = 1-3g espinheira santa', '2-4 semanas', 'Gravidez'),

-- SUBSTITUIÇÕES PARA FRUTAS MEDICINAIS
(15, 54, 'Fruta medicinal', 9, 'Proteção antioxidante', 8, 'Mais antioxidantes, menos açúcar', 'Sabor diferente', 'Polpa ou suco', '1 banana = 100g graviola', 'Imediato', 'Gravidez'),

(15, 55, 'Fruta medicinal', 9, 'Proteção antioxidante', 7, 'Mais antioxidantes, menos açúcar', 'Sabor diferente', 'Suco ou cápsula', '1 banana = 30ml noni', 'Imediato', 'Gravidez'),

-- SUBSTITUIÇÕES PARA SEMENTES MEDICINAIS
(18, 56, 'Semente medicinal', 1, 'Melhor saúde cardiovascular', 9, 'Mais ômega 3, menos gordura saturada', 'Sabor diferente', 'Hidratada ou moída', '30g amêndoas = 15g chia', '1-2 semanas', 'Alergia a sementes'),

(18, 57, 'Semente medicinal', 1, 'Melhor saúde cardiovascular', 8, 'Mais ômega 3, menos gordura saturada', 'Sabor diferente', 'Moída ou germinada', '30g amêndoas = 15g linhaça', '1-2 semanas', 'Alergia a sementes'),

-- SUBSTITUIÇÕES PARA ERVAS MEDICINAIS
(3, 58, 'Erva medicinal', 8, 'Melhor relaxamento', 4, 'Mais calmantes, menos proteína', 'Menos proteína', 'Chá ou extrato', '2 ovos = 1-3 xícaras de camomila', 'Imediato', 'Alergia'),

(3, 59, 'Erva medicinal', 8, 'Melhor relaxamento', 4, 'Mais calmantes, menos proteína', 'Menos proteína', 'Extrato padronizado', '2 ovos = 300mg valeriana', '2-4 semanas', 'Gravidez'),

-- SUBSTITUIÇÕES PARA COGUMELOS MEDICINAIS
(1, 60, 'Cogumelo medicinal', 6, 'Melhor imunidade', 6, 'Mais imunomoduladores, menos gordura', 'Menos proteína', 'Fresco ou seco', '100g frango = 50g shiitake', '2-4 semanas', 'Alergia a cogumelos'),

(2, 61, 'Cogumelo medicinal', 6, 'Melhor imunidade', 7, 'Mais imunomoduladores, menos gordura', 'Menos proteína', 'Fresco ou seco', '100g salmão = 50g maitake', '2-4 semanas', 'Alergia a cogumelos'),

-- SUBSTITUIÇÕES PARA ÓLEOS ESSENCIAIS MEDICINAIS
(18, 62, 'Óleo essencial medicinal', 1, 'Melhor saúde cardiovascular', 7, 'Mais ácido láurico, menos gordura saturada', 'Sabor diferente', 'Cozinhar ou suplemento', '30g amêndoas = 15ml óleo de coco', '2-4 semanas', 'Alergia'),

(18, 63, 'Óleo essencial medicinal', 1, 'Melhor saúde cardiovascular', 8, 'Mais ácido oleico, menos gordura saturada', 'Sabor diferente', 'Temperatura ambiente', '30g amêndoas = 15ml óleo de oliva', '2-4 semanas', 'Alergia'),

-- SUBSTITUIÇÕES PARA MEL MEDICINAL
(15, 64, 'Mel medicinal', 6, 'Melhor imunidade', 6, 'Mais antibacterianos, menos açúcar', 'Sabor diferente', 'Puro ou diluído', '1 banana = 10g mel de manuka', 'Imediato', 'Diabetes'),

(15, 65, 'Mel medicinal', 6, 'Melhor imunidade', 6, 'Mais imunomoduladores, menos açúcar', 'Sabor diferente', 'Extrato ou mel', '1 banana = 500mg própolis verde', 'Imediato', 'Alergia a abelhas'); 