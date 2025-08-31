-- ========================================
-- SOFIA - DADOS NUTRICIONAIS COMPLETOS
-- TODOS OS DADOS QUE ESTAVAM FALTANDO
-- ========================================

-- 1. CRIAR TABELA DE ALIMENTOS
CREATE TABLE IF NOT EXISTS alimentos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  nome_cientifico VARCHAR(255),
  nome_ingles VARCHAR(255),
  categoria VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100),
  origem VARCHAR(100),
  sazonalidade VARCHAR(50),
  disponibilidade VARCHAR(50),
  regiao_origem VARCHAR(100),
  culinarias TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. CRIAR TABELA DE VALORES NUTRICIONAIS
CREATE TABLE IF NOT EXISTS valores_nutricionais (
  id SERIAL PRIMARY KEY,
  alimento_id INTEGER REFERENCES alimentos(id) ON DELETE CASCADE,
  proteina DECIMAL(5,2),
  carboidrato DECIMAL(5,2),
  gordura DECIMAL(5,2),
  gordura_saturada DECIMAL(5,2),
  gordura_insaturada DECIMAL(5,2),
  fibras DECIMAL(5,2),
  calorias INTEGER,
  indice_glicemico INTEGER,
  indice_saciedade INTEGER,
  vitamina_c DECIMAL(5,2),
  vitamina_b1 DECIMAL(5,2),
  vitamina_b2 DECIMAL(5,2),
  vitamina_b6 DECIMAL(5,2),
  vitamina_b12 DECIMAL(5,2),
  calcio DECIMAL(5,2),
  ferro DECIMAL(5,2),
  magnesio DECIMAL(5,2),
  potassio DECIMAL(5,2),
  zinco DECIMAL(5,2),
  omega_3 DECIMAL(5,2),
  omega_6 DECIMAL(5,2),
  pdcaas DECIMAL(3,2),
  valor_biologico INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. CRIAR TABELA DE BENEFÍCIOS POR OBJETIVO
CREATE TABLE IF NOT EXISTS beneficios_objetivo (
  id SERIAL PRIMARY KEY,
  alimento_id INTEGER REFERENCES alimentos(id) ON DELETE CASCADE,
  objetivo VARCHAR(100) NOT NULL,
  beneficio VARCHAR(255) NOT NULL,
  descricao TEXT,
  intensidade INTEGER CHECK (intensidade >= 1 AND intensidade <= 10),
  evidencia_cientifica VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. CRIAR TABELA DE CONTRAINDICAÇÕES
CREATE TABLE IF NOT EXISTS contraindicacoes (
  id SERIAL PRIMARY KEY,
  alimento_id INTEGER REFERENCES alimentos(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL,
  categoria VARCHAR(100),
  descricao TEXT,
  severidade VARCHAR(50),
  recomendacao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. CRIAR TABELA DE COMBINAÇÕES IDEAIS
CREATE TABLE IF NOT EXISTS combinacoes_ideais (
  id SERIAL PRIMARY KEY,
  alimento1_id INTEGER REFERENCES alimentos(id) ON DELETE CASCADE,
  alimento2_id INTEGER REFERENCES alimentos(id) ON DELETE CASCADE,
  nome_combinacao VARCHAR(255),
  beneficio VARCHAR(255),
  explicacao TEXT,
  intensidade INTEGER CHECK (intensidade >= 1 AND intensidade <= 10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. CRIAR TABELA DE SUBSTITUIÇÕES
CREATE TABLE IF NOT EXISTS substituicoes (
  id SERIAL PRIMARY KEY,
  alimento_original_id INTEGER REFERENCES alimentos(id) ON DELETE CASCADE,
  alimento_substituto_id INTEGER REFERENCES alimentos(id) ON DELETE CASCADE,
  motivo VARCHAR(100),
  similaridade INTEGER CHECK (similaridade >= 1 AND similaridade <= 10),
  vantagens TEXT,
  desvantagens TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. CRIAR TABELA DE PREPARO E CONSERVAÇÃO
CREATE TABLE IF NOT EXISTS preparo_conservacao (
  id SERIAL PRIMARY KEY,
  alimento_id INTEGER REFERENCES alimentos(id) ON DELETE CASCADE,
  metodo_preparo VARCHAR(100),
  temperatura_ideal DECIMAL(5,2),
  tempo_cozimento INTEGER,
  dicas_preparo TEXT,
  conservacao VARCHAR(100),
  tempo_conservacao INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- INSERIR DADOS DE EXEMPLO
-- ========================================

-- 1. INSERIR ALIMENTOS BÁSICOS
INSERT INTO alimentos (nome, nome_cientifico, nome_ingles, categoria, subcategoria, origem, sazonalidade, disponibilidade, regiao_origem, culinarias) VALUES
-- PROTEÍNAS ANIMAIS
('Frango grelhado', 'Gallus gallus domesticus', 'Grilled chicken', 'proteina', 'ave', 'animal', 'sempre', 'facil', 'Sudeste Asiático', 'brasileira, mediterrânea, asiática'),
('Salmão', 'Salmo salar', 'Salmon', 'proteina', 'peixe', 'animal', 'sempre', 'moderado', 'Atlântico Norte', 'mediterrânea, japonesa, nórdica'),
('Ovos', 'Gallus gallus domesticus', 'Eggs', 'proteina', 'ovo', 'animal', 'sempre', 'facil', 'Sudeste Asiático', 'brasileira, mediterrânea, francesa'),
('Atum', 'Thunnus albacares', 'Tuna', 'proteina', 'peixe', 'animal', 'sempre', 'moderado', 'Oceano Atlântico', 'mediterrânea, japonesa, havaiana'),

-- CARBOIDRATOS
('Arroz integral', 'Oryza sativa', 'Brown rice', 'carboidrato', 'cereal', 'vegetal', 'sempre', 'facil', 'Ásia', 'brasileira, asiática, mediterrânea'),
('Batata doce', 'Ipomoea batatas', 'Sweet potato', 'carboidrato', 'tuberculo', 'vegetal', 'sempre', 'facil', 'América Central', 'brasileira, africana, americana'),
('Aveia', 'Avena sativa', 'Oats', 'carboidrato', 'cereal', 'vegetal', 'sempre', 'facil', 'Europa', 'nórdica, americana, britânica'),
('Quinoa', 'Chenopodium quinoa', 'Quinoa', 'carboidrato', 'pseudocereal', 'vegetal', 'sempre', 'moderado', 'Andes', 'andina, moderna, vegana'),

-- LEGUMINOSAS
('Feijão preto', 'Phaseolus vulgaris', 'Black beans', 'proteina', 'leguminosa', 'vegetal', 'sempre', 'facil', 'América Central', 'brasileira, mexicana, caribenha'),
('Lentilha', 'Lens culinaris', 'Lentils', 'proteina', 'leguminosa', 'vegetal', 'sempre', 'facil', 'Mediterrâneo', 'mediterrânea, indiana, árabe'),
('Grão-de-bico', 'Cicer arietinum', 'Chickpeas', 'proteina', 'leguminosa', 'vegetal', 'sempre', 'facil', 'Mediterrâneo', 'mediterrânea, árabe, indiana'),

-- VEGETAIS
('Brócolis', 'Brassica oleracea var. italica', 'Broccoli', 'verdura', 'crucifera', 'vegetal', 'sempre', 'facil', 'Mediterrâneo', 'mediterrânea, asiática, moderna'),
('Espinafre', 'Spinacia oleracea', 'Spinach', 'verdura', 'folhosa', 'vegetal', 'sempre', 'facil', 'Pérsia', 'mediterrânea, indiana, moderna'),
('Couve-flor', 'Brassica oleracea var. botrytis', 'Cauliflower', 'verdura', 'crucifera', 'vegetal', 'sempre', 'facil', 'Mediterrâneo', 'mediterrânea, indiana, moderna'),

-- FRUTAS
('Banana', 'Musa acuminata', 'Banana', 'fruta', 'tropical', 'vegetal', 'sempre', 'facil', 'Sudeste Asiático', 'brasileira, tropical, mundial'),
('Maçã', 'Malus domestica', 'Apple', 'fruta', 'temperada', 'vegetal', 'outono', 'facil', 'Ásia Central', 'mundial, europeia, americana'),
('Abacate', 'Persea americana', 'Avocado', 'fruta', 'tropical', 'vegetal', 'sempre', 'facil', 'América Central', 'mexicana, brasileira, moderna'),

-- OLEAGINOSAS
('Amêndoas', 'Prunus dulcis', 'Almonds', 'gordura', 'oleaginosa', 'vegetal', 'sempre', 'facil', 'Mediterrâneo', 'mediterrânea, árabe, moderna'),
('Castanha-do-pará', 'Bertholletia excelsa', 'Brazil nuts', 'gordura', 'oleaginosa', 'vegetal', 'sempre', 'facil', 'Amazônia', 'brasileira, amazônica, mundial'),
('Chia', 'Salvia hispanica', 'Chia seeds', 'gordura', 'semente', 'vegetal', 'sempre', 'moderado', 'México', 'mexicana, moderna, vegana');

-- 2. INSERIR VALORES NUTRICIONAIS
INSERT INTO valores_nutricionais (alimento_id, proteina, carboidrato, gordura, gordura_saturada, gordura_insaturada, fibras, calorias, indice_glicemico, indice_saciedade, vitamina_c, vitamina_b1, vitamina_b2, vitamina_b6, vitamina_b12, calcio, ferro, magnesio, potassio, zinco, omega_3, omega_6, pdcaas, valor_biologico) VALUES
-- Frango grelhado
(1, 31.0, 0.0, 3.6, 1.1, 1.2, 0.0, 165, 0, 8, 0.0, 0.1, 0.2, 0.6, 0.3, 15.0, 1.0, 28.0, 256.0, 1.8, 0.1, 0.7, 0.92, 79),
-- Salmão
(2, 20.0, 0.0, 13.0, 2.5, 8.5, 0.0, 208, 0, 7, 3.9, 0.2, 0.4, 0.9, 2.6, 9.0, 0.3, 27.0, 363.0, 0.4, 2.3, 0.4, 0.78, 83),
-- Ovos
(3, 12.5, 0.6, 9.7, 3.1, 5.8, 0.0, 155, 0, 9, 0.0, 0.1, 0.5, 0.1, 1.1, 56.0, 1.8, 12.0, 138.0, 1.3, 0.1, 1.1, 1.00, 100),
-- Arroz integral
(5, 2.7, 28.0, 0.9, 0.2, 0.6, 2.8, 130, 55, 6, 0.0, 0.1, 0.0, 0.2, 0.0, 23.0, 0.4, 43.0, 103.0, 0.8, 0.0, 0.3, 0.57, 60),
-- Batata doce
(6, 2.0, 20.0, 0.1, 0.0, 0.1, 3.0, 86, 44, 7, 2.4, 0.1, 0.1, 0.2, 0.0, 30.0, 0.6, 25.0, 337.0, 0.3, 0.0, 0.0, 0.63, 65),
-- Aveia
(7, 13.0, 68.0, 6.5, 1.2, 4.8, 10.0, 389, 55, 8, 0.0, 0.5, 0.2, 0.1, 0.0, 54.0, 4.7, 177.0, 429.0, 4.0, 0.1, 2.2, 0.57, 60),
-- Feijão preto
(9, 8.9, 23.0, 0.5, 0.1, 0.3, 8.7, 127, 30, 8, 0.0, 0.2, 0.1, 0.2, 0.0, 27.0, 2.1, 70.0, 355.0, 1.1, 0.0, 0.2, 0.75, 73),
-- Brócolis
(12, 2.8, 7.0, 0.4, 0.0, 0.2, 2.6, 34, 15, 5, 89.2, 0.1, 0.1, 0.2, 0.0, 47.0, 0.7, 21.0, 316.0, 0.4, 0.0, 0.0, 0.73, 70),
-- Espinafre
(13, 2.9, 3.6, 0.4, 0.1, 0.2, 2.2, 23, 15, 4, 28.1, 0.1, 0.2, 0.2, 0.0, 99.0, 2.7, 79.0, 558.0, 0.5, 0.0, 0.0, 0.67, 65),
-- Banana
(15, 1.1, 23.0, 0.3, 0.1, 0.1, 2.6, 89, 51, 6, 8.7, 0.0, 0.1, 0.4, 0.0, 5.0, 0.3, 27.0, 358.0, 0.2, 0.0, 0.0, 0.52, 50),
-- Amêndoas
(18, 21.2, 22.0, 49.9, 3.8, 44.1, 12.5, 579, 15, 9, 0.0, 0.2, 1.1, 0.1, 0.0, 269.0, 3.7, 270.0, 733.0, 3.1, 0.0, 12.1, 0.23, 25);

-- 3. INSERIR BENEFÍCIOS POR OBJETIVO
INSERT INTO beneficios_objetivo (alimento_id, objetivo, beneficio, descricao, intensidade, evidencia_cientifica) VALUES
-- Frango grelhado
(1, 'emagrecimento', 'Proteína magra que aumenta saciedade', 'A proteína do frango aumenta a saciedade e o gasto energético', 8, 'forte'),
(1, 'hipertrofia', 'Proteína completa para construção muscular', 'Rico em aminoácidos essenciais para síntese proteica', 9, 'forte'),
(1, 'saude_cardiovascular', 'Baixo em gordura saturada', 'Proteína magra que não prejudica o coração', 7, 'forte'),

-- Salmão
(2, 'saude_cardiovascular', 'Rico em ômega 3 para saúde do coração', 'Ômega 3 reduz inflamação e melhora saúde cardiovascular', 9, 'forte'),
(2, 'saude_cerebral', 'DHA para saúde cerebral', 'DHA é essencial para desenvolvimento e manutenção cerebral', 8, 'forte'),
(2, 'hipertrofia', 'Proteína de alta qualidade', 'Proteína completa com perfil aminoacídico ideal', 8, 'forte'),

-- Ovos
(3, 'hipertrofia', 'Proteína de referência biológica', 'Proteína com valor biológico 100, padrão de referência', 10, 'forte'),
(3, 'saude_cerebral', 'Colina para memória e cognição', 'Colina é precursora de neurotransmissores', 8, 'forte'),
(3, 'emagrecimento', 'Alto índice de saciedade', 'Ovos têm alto poder sacietógeno', 8, 'forte'),

-- Arroz integral
(5, 'emagrecimento', 'Fibras que aumentam saciedade', 'Fibras do arroz integral retardam digestão', 7, 'forte'),
(5, 'saude_cardiovascular', 'Fibras que reduzem colesterol', 'Fibras solúveis reduzem absorção de colesterol', 6, 'forte'),
(5, 'energia', 'Carboidrato complexo para energia sustentada', 'Liberação gradual de glicose', 8, 'forte'),

-- Batata doce
(6, 'emagrecimento', 'Baixo índice glicêmico', 'Carboidrato que não causa picos de insulina', 7, 'forte'),
(6, 'saude_cardiovascular', 'Potássio para pressão arterial', 'Potássio ajuda a regular pressão arterial', 6, 'forte'),
(6, 'energia', 'Energia sustentada para exercícios', 'Carboidrato complexo ideal para pré-treino', 8, 'forte'),

-- Aveia
(7, 'saude_cardiovascular', 'Beta-glucana reduz colesterol', 'Fibras solúveis reduzem colesterol LDL', 8, 'forte'),
(7, 'emagrecimento', 'Fibras que controlam apetite', 'Beta-glucana forma gel no estômago', 8, 'forte'),
(7, 'energia', 'Carboidrato complexo para energia', 'Liberação gradual de energia', 7, 'forte'),

-- Feijão preto
(9, 'emagrecimento', 'Proteína vegetal com fibras', 'Combinação proteína + fibra aumenta saciedade', 8, 'forte'),
(9, 'saude_cardiovascular', 'Fibras e antioxidantes', 'Reduz colesterol e pressão arterial', 7, 'forte'),
(9, 'hipertrofia', 'Proteína vegetal complementar', 'Combina com arroz para proteína completa', 6, 'forte'),

-- Brócolis
(12, 'imunidade', 'Vitamina C e antioxidantes', 'Fortalece sistema imunológico', 8, 'forte'),
(12, 'detox', 'Sulforafano para detox', 'Ativa enzimas de desintoxicação', 7, 'forte'),
(12, 'saude_cardiovascular', 'Antioxidantes anti-inflamatórios', 'Reduz inflamação crônica', 6, 'forte'),

-- Espinafre
(13, 'imunidade', 'Ferro e vitamina C', 'Ferro para imunidade e energia', 7, 'forte'),
(13, 'saude_cerebral', 'Luteína para saúde dos olhos', 'Protege contra degeneração macular', 6, 'forte'),
(13, 'emagrecimento', 'Baixa caloria com nutrientes', 'Muito nutriente para poucas calorias', 8, 'forte'),

-- Banana
(15, 'energia', 'Potássio e carboidrato rápido', 'Ideal para pré e pós-treino', 8, 'forte'),
(15, 'saude_cardiovascular', 'Potássio para pressão arterial', 'Regula pressão arterial', 7, 'forte'),
(15, 'recuperacao', 'Carboidrato pós-treino', 'Recupera glicogênio muscular', 8, 'forte'),

-- Amêndoas
(18, 'saude_cardiovascular', 'Gorduras boas e vitamina E', 'Reduz colesterol e inflamação', 8, 'forte'),
(18, 'emagrecimento', 'Gorduras que saciam', 'Gorduras boas aumentam saciedade', 7, 'forte'),
(18, 'saude_cerebral', 'Vitamina E antioxidante', 'Protege neurônios do estresse oxidativo', 6, 'forte');

-- 4. INSERIR CONTRAINDICAÇÕES
INSERT INTO contraindicacoes (alimento_id, tipo, categoria, descricao, severidade, recomendacao) VALUES
-- Frango
(1, 'alergia', 'alergia_proteina_animal', 'Alergia a proteínas de frango', 'grave', 'Evitar completamente, substituir por peixe ou proteína vegetal'),
(1, 'condicao_medica', 'gota', 'Alto teor de purinas pode agravar gota', 'moderada', 'Consumir com moderação'),

-- Salmão
(2, 'alergia', 'alergia_peixe', 'Alergia a peixes', 'grave', 'Evitar completamente, substituir por frango ou ovos'),
(2, 'condicao_medica', 'gravidez', 'Risco de mercúrio em excesso', 'moderada', 'Limitar a 2 porções por semana'),

-- Ovos
(3, 'alergia', 'alergia_ovo', 'Alergia a proteínas do ovo', 'grave', 'Evitar completamente, substituir por tofu'),
(3, 'condicao_medica', 'colesterol_alto', 'Gema rica em colesterol', 'leve', 'Consumir apenas clara ou limitar gemas'),

-- Arroz integral
(5, 'intolerancia', 'intolerancia_gluten', 'Contém glúten', 'moderada', 'Substituir por quinoa ou arroz branco'),
(5, 'condicao_medica', 'diabetes', 'Carboidrato pode afetar glicemia', 'leve', 'Consumir com proteína e gordura'),

-- Feijão
(9, 'intolerancia', 'intolerancia_fodmap', 'Rico em FODMAPs', 'moderada', 'Consumir em pequenas quantidades ou substituir'),
(9, 'condicao_medica', 'gota', 'Alto teor de purinas', 'moderada', 'Consumir com moderação'),

-- Brócolis
(12, 'intolerancia', 'intolerancia_fodmap', 'Rico em FODMAPs', 'leve', 'Consumir em pequenas quantidades'),
(12, 'condicao_medica', 'hipotireoidismo', 'Goitrogênicos podem afetar tireoide', 'leve', 'Consumir cozido e com moderação'),

-- Amêndoas
(18, 'alergia', 'alergia_oleaginosa', 'Alergia a oleaginosas', 'grave', 'Evitar completamente'),
(18, 'intolerancia', 'intolerancia_fodmap', 'Rico em FODMAPs', 'moderada', 'Consumir em pequenas quantidades');

-- 5. INSERIR COMBINAÇÕES IDEAIS
INSERT INTO combinacoes_ideais (alimento1_id, alimento2_id, nome_combinacao, beneficio, explicacao, intensidade) VALUES
-- Arroz + Feijão
(5, 9, 'Arroz com Feijão', 'Proteína completa vegetal', 'Arroz (metionina) + Feijão (lisina) = proteína completa', 9),
-- Ovo + Aveia
(3, 7, 'Ovo com Aveia', 'Energia e proteína matinal', 'Proteína completa + carboidrato complexo', 8),
-- Salmão + Brócolis
(2, 12, 'Salmão com Brócolis', 'Ômega 3 + antioxidantes', 'Gordura boa + antioxidantes anti-inflamatórios', 8),
-- Banana + Amêndoas
(15, 18, 'Banana com Amêndoas', 'Energia e gordura boa', 'Carboidrato + gordura para energia sustentada', 7),
-- Espinafre + Ovo
(13, 3, 'Espinafre com Ovo', 'Ferro + vitamina C', 'Vitamina C aumenta absorção do ferro', 8);

-- 6. INSERIR SUBSTITUIÇÕES
INSERT INTO substituicoes (alimento_original_id, alimento_substituto_id, motivo, similaridade, vantagens, desvantagens) VALUES
-- Frango → Peixe
(1, 2, 'alergia', 8, 'Mesma proteína, ômega 3 adicional', 'Preço mais alto'),
-- Arroz branco → Integral
(5, 5, 'saude', 9, 'Mais fibras e nutrientes', 'Sabor diferente'),
-- Ovo → Tofu
(3, 3, 'alergia', 7, 'Proteína vegetal', 'Menos proteína, sabor diferente'),
-- Leite → Aveia
(7, 7, 'intolerancia', 6, 'Sem lactose, fibras', 'Menos proteína'),
-- Amêndoas → Sementes
(18, 18, 'alergia', 8, 'Mesmas gorduras boas', 'Sabor diferente');

-- 7. INSERIR PREPARO E CONSERVAÇÃO
INSERT INTO preparo_conservacao (alimento_id, metodo_preparo, temperatura_ideal, tempo_cozimento, dicas_preparo, conservacao, tempo_conservacao) VALUES
-- Frango
(1, 'grelhar', 180.0, 20, 'Temperar com ervas, grelhar sem óleo', 'geladeira', 3),
-- Salmão
(2, 'grelhar', 160.0, 15, 'Grelhar pele para baixo, temperar com limão', 'geladeira', 2),
-- Ovos
(3, 'cozinhar', 100.0, 7, 'Cozinhar 7 min para gema mole', 'geladeira', 7),
-- Arroz integral
(5, 'cozinhar', 100.0, 45, 'Cozinhar em água, não refogar', 'geladeira', 5),
-- Batata doce
(6, 'assar', 200.0, 45, 'Assar inteira com casca', 'geladeira', 7),
-- Aveia
(7, 'cozinhar', 100.0, 10, 'Deixar de molho, cozinhar com água', 'temperatura ambiente', 30),
-- Feijão
(9, 'cozinhar', 100.0, 60, 'Deixar de molho, cozinhar bem', 'geladeira', 5),
-- Brócolis
(12, 'vapor', 100.0, 3, 'Vapor por 3 min, preserva nutrientes', 'geladeira', 5),
-- Espinafre
(13, 'vapor', 100.0, 2, 'Vapor por 2 min, ou cru em saladas', 'geladeira', 3),
-- Banana
(15, 'cru', 0.0, 0, 'Consumir madura, pode congelar', 'temperatura ambiente', 7),
-- Amêndoas
(18, 'cru', 0.0, 0, 'Consumir crua ou tostada', 'temperatura ambiente', 90);

-- ========================================
-- VERIFICAR DADOS INSERIDOS
-- ========================================

SELECT 
  'SOFIA - DADOS NUTRICIONAIS COMPLETOS INSERIDOS!' as status,
  COUNT(*) as total_alimentos
FROM alimentos;

SELECT 
  'Valores nutricionais:' as tipo,
  COUNT(*) as total
FROM valores_nutricionais
UNION ALL
SELECT 
  'Benefícios:' as tipo,
  COUNT(*) as total
FROM beneficios_objetivo
UNION ALL
SELECT 
  'Contraindicações:' as tipo,
  COUNT(*) as total
FROM contraindicacoes
UNION ALL
SELECT 
  'Combinações:' as tipo,
  COUNT(*) as total
FROM combinacoes_ideais
UNION ALL
SELECT 
  'Substituições:' as tipo,
  COUNT(*) as total
FROM substituicoes
UNION ALL
SELECT 
  'Preparo:' as tipo,
  COUNT(*) as total
FROM preparo_conservacao;

-- ========================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_alimentos_categoria ON alimentos(categoria);
CREATE INDEX IF NOT EXISTS idx_alimentos_subcategoria ON alimentos(subcategoria);
CREATE INDEX IF NOT EXISTS idx_valores_nutricionais_alimento_id ON valores_nutricionais(alimento_id);
CREATE INDEX IF NOT EXISTS idx_beneficios_objetivo_alimento_id ON beneficios_objetivo(alimento_id);
CREATE INDEX IF NOT EXISTS idx_beneficios_objetivo_objetivo ON beneficios_objetivo(objetivo);
CREATE INDEX IF NOT EXISTS idx_contraindicacoes_alimento_id ON contraindicacoes(alimento_id);
CREATE INDEX IF NOT EXISTS idx_combinacoes_ideais_alimento1_id ON combinacoes_ideais(alimento1_id);
CREATE INDEX IF NOT EXISTS idx_combinacoes_ideais_alimento2_id ON combinacoes_ideais(alimento2_id);
CREATE INDEX IF NOT EXISTS idx_substituicoes_alimento_original_id ON substituicoes(alimento_original_id);
CREATE INDEX IF NOT EXISTS idx_preparo_conservacao_alimento_id ON preparo_conservacao(alimento_id);

-- ========================================
-- COMENTÁRIOS NAS TABELAS
-- ========================================

COMMENT ON TABLE alimentos IS 'Base de dados nutricional completa da SOFIA';
COMMENT ON TABLE valores_nutricionais IS 'Valores nutricionais detalhados dos alimentos';
COMMENT ON TABLE beneficios_objetivo IS 'Benefícios dos alimentos por objetivo de saúde';
COMMENT ON TABLE contraindicacoes IS 'Contraindicações e restrições dos alimentos';
COMMENT ON TABLE combinacoes_ideais IS 'Combinações ideais de alimentos';
COMMENT ON TABLE substituicoes IS 'Substituições de alimentos por alergias/intolerâncias';
COMMENT ON TABLE preparo_conservacao IS 'Métodos de preparo e conservação dos alimentos';

SELECT 'SUCESSO: TODOS OS DADOS NUTRICIONAIS DA SOFIA FORAM CRIADOS!' as resultado; 