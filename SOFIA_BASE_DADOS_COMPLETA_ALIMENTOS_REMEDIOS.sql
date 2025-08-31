-- ========================================
-- SOFIA - BASE DE DADOS COMPLETA
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- MÁXIMO DE INFORMAÇÕES E COMBINAÇÕES
-- ========================================

-- 1. TABELA PRINCIPAL DE ALIMENTOS (EXPANDIDA)
CREATE TABLE IF NOT EXISTS alimentos_completos (
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
  propriedades_medicinais TEXT,
  principios_ativos TEXT[],
  indicacoes_terapeuticas TEXT[],
  contraindicacoes TEXT[],
  interacoes_medicamentosas TEXT[],
  dosagem_terapeutica VARCHAR(100),
  forma_preparo_medicinal TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABELA DE VALORES NUTRICIONAIS COMPLETOS
CREATE TABLE IF NOT EXISTS valores_nutricionais_completos (
  id SERIAL PRIMARY KEY,
  alimento_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
  
  -- Macronutrientes
  proteina DECIMAL(5,2),
  carboidrato DECIMAL(5,2),
  gordura DECIMAL(5,2),
  gordura_saturada DECIMAL(5,2),
  gordura_insaturada DECIMAL(5,2),
  gordura_trans DECIMAL(5,2),
  fibras DECIMAL(5,2),
  fibras_soluveis DECIMAL(5,2),
  fibras_insoluveis DECIMAL(5,2),
  calorias INTEGER,
  
  -- Índices
  indice_glicemico INTEGER,
  indice_saciedade INTEGER,
  carga_glicemica DECIMAL(5,2),
  
  -- Vitaminas (mg/100g)
  vitamina_a DECIMAL(5,2),
  vitamina_c DECIMAL(5,2),
  vitamina_d DECIMAL(5,2),
  vitamina_e DECIMAL(5,2),
  vitamina_k DECIMAL(5,2),
  vitamina_b1 DECIMAL(5,2),
  vitamina_b2 DECIMAL(5,2),
  vitamina_b3 DECIMAL(5,2),
  vitamina_b5 DECIMAL(5,2),
  vitamina_b6 DECIMAL(5,2),
  vitamina_b7 DECIMAL(5,2),
  vitamina_b9 DECIMAL(5,2),
  vitamina_b12 DECIMAL(5,2),
  
  -- Minerais (mg/100g)
  calcio DECIMAL(5,2),
  ferro DECIMAL(5,2),
  magnesio DECIMAL(5,2),
  potassio DECIMAL(5,2),
  zinco DECIMAL(5,2),
  selenio DECIMAL(5,2),
  cobre DECIMAL(5,2),
  manganes DECIMAL(5,2),
  fosforo DECIMAL(5,2),
  sodio DECIMAL(5,2),
  
  -- Ácidos Graxos
  omega_3 DECIMAL(5,2),
  omega_6 DECIMAL(5,2),
  omega_9 DECIMAL(5,2),
  ala DECIMAL(5,2),
  epa DECIMAL(5,2),
  dha DECIMAL(5,2),
  
  -- Qualidade Proteica
  pdcaas DECIMAL(3,2),
  valor_biologico INTEGER,
  aminoacidos_essenciais JSONB,
  
  -- Antioxidantes
  polifenois DECIMAL(5,2),
  flavonoides DECIMAL(5,2),
  carotenoides DECIMAL(5,2),
  resveratrol DECIMAL(5,2),
  quercetina DECIMAL(5,2),
  
  -- Outros Nutrientes
  colina DECIMAL(5,2),
  inositol DECIMAL(5,2),
  betaina DECIMAL(5,2),
  taurina DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABELA DE DOENÇAS E CONDIÇÕES
CREATE TABLE IF NOT EXISTS doencas_condicoes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  descricao TEXT,
  sintomas TEXT[],
  causas TEXT[],
  fatores_risco TEXT[],
  complicacoes TEXT[],
  exames_diagnostico TEXT[],
  tratamentos_convencionais TEXT[],
  abordagem_nutricional TEXT,
  alimentos_beneficos TEXT[],
  alimentos_evitar TEXT[],
  suplementos_recomendados TEXT[],
  estilo_vida TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. TABELA DE ALIMENTOS PARA DOENÇAS
CREATE TABLE IF NOT EXISTS alimentos_doencas (
  id SERIAL PRIMARY KEY,
  alimento_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
  doenca_id INTEGER REFERENCES doencas_condicoes(id) ON DELETE CASCADE,
  tipo_relacao VARCHAR(50) CHECK (tipo_relacao IN ('benefico', 'prejudicial', 'neutro')),
  mecanismo_acao TEXT,
  evidencia_cientifica VARCHAR(50),
  dosagem_recomendada VARCHAR(100),
  frequencia_consumo VARCHAR(100),
  forma_preparo_otima TEXT,
  contraindicacoes TEXT,
  interacoes TEXT,
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. TABELA DE SUBSTITUIÇÕES INTELIGENTES
CREATE TABLE IF NOT EXISTS substituicoes_inteligentes (
  id SERIAL PRIMARY KEY,
  alimento_original_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
  alimento_substituto_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
  motivo_substituicao VARCHAR(100),
  doenca_condicao_id INTEGER REFERENCES doencas_condicoes(id),
  beneficio_esperado TEXT,
  similaridade_nutricional INTEGER CHECK (similaridade_nutricional >= 1 AND similaridade_nutricional <= 10),
  vantagens TEXT,
  desvantagens TEXT,
  forma_preparo TEXT,
  dosagem_equivalente VARCHAR(100),
  tempo_adaptacao VARCHAR(100),
  contraindicacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. TABELA DE COMBINAÇÕES TERAPÊUTICAS
CREATE TABLE IF NOT EXISTS combinacoes_terapeuticas (
  id SERIAL PRIMARY KEY,
  alimento1_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
  alimento2_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
  nome_combinacao VARCHAR(255),
  doenca_condicao_id INTEGER REFERENCES doencas_condicoes(id),
  beneficio_terapeutico TEXT,
  mecanismo_sinergia TEXT,
  evidencia_cientifica VARCHAR(50),
  dosagem_recomendada VARCHAR(100),
  forma_preparo TEXT,
  frequencia_consumo VARCHAR(100),
  contraindicacoes TEXT,
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. TABELA DE PRINCÍPIOS ATIVOS
CREATE TABLE IF NOT EXISTS principios_ativos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  descricao TEXT,
  mecanismo_acao TEXT,
  beneficios_terapeuticos TEXT[],
  efeitos_colaterais TEXT[],
  contraindicacoes TEXT[],
  interacoes_medicamentosas TEXT[],
  dosagem_segura VARCHAR(100),
  fontes_naturais TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. TABELA DE ALIMENTOS-PRINCÍPIOS ATIVOS
CREATE TABLE IF NOT EXISTS alimentos_principios_ativos (
  id SERIAL PRIMARY KEY,
  alimento_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
  principio_ativo_id INTEGER REFERENCES principios_ativos(id) ON DELETE CASCADE,
  concentracao DECIMAL(5,2),
  biodisponibilidade DECIMAL(5,2),
  forma_quimica VARCHAR(100),
  estabilidade VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. TABELA DE RECEITAS TERAPÊUTICAS
CREATE TABLE IF NOT EXISTS receitas_terapeuticas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  doenca_condicao_id INTEGER REFERENCES doencas_condicoes(id),
  descricao TEXT,
  ingredientes JSONB,
  instrucoes_preparo TEXT,
  tempo_preparo INTEGER,
  rendimento VARCHAR(100),
  beneficios_terapeuticos TEXT[],
  contraindicacoes TEXT,
  dosagem_recomendada VARCHAR(100),
  frequencia_consumo VARCHAR(100),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. TABELA DE PROTOCOLOS NUTRICIONAIS
CREATE TABLE IF NOT EXISTS protocolos_nutricionais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  doenca_condicao_id INTEGER REFERENCES doencas_condicoes(id),
  descricao TEXT,
  objetivos TEXT[],
  duracao VARCHAR(100),
  fases JSONB,
  alimentos_obrigatorios TEXT[],
  alimentos_opcionais TEXT[],
  alimentos_proibidos TEXT[],
  suplementos_recomendados TEXT[],
  estilo_vida TEXT[],
  monitoramento TEXT[],
  contraindicacoes TEXT,
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- INSERIR DADOS DE EXEMPLO EXPANDIDOS
-- ========================================

-- 1. INSERIR ALIMENTOS COM PROPRIEDADES MEDICINAIS
INSERT INTO alimentos_completos (nome, nome_cientifico, nome_ingles, categoria, subcategoria, propriedades_medicinais, principios_ativos, indicacoes_terapeuticas, contraindicacoes, interacoes_medicamentosas, dosagem_terapeutica, forma_preparo_medicinal) VALUES

-- ANTI-INFLAMATÓRIOS
('Cúrcuma', 'Curcuma longa', 'Turmeric', 'condimento', 'especiaria', 'Anti-inflamatório, antioxidante, hepatoprotetor', ARRAY['Curcumina', 'Turmerona', 'Zingibereno'], ARRAY['Artrite', 'Inflamação', 'Proteção hepática', 'Câncer'], ARRAY['Gravidez', 'Pedras na vesícula'], ARRAY['Anticoagulantes', 'Antiácidos'], '500-2000mg/dia', 'Misturar com pimenta preta para absorção'),

('Gengibre', 'Zingiber officinale', 'Ginger', 'condimento', 'raiz', 'Anti-náusea, anti-inflamatório, digestivo', ARRAY['Gingerol', 'Shogaol', 'Zingibereno'], ARRAY['Náusea', 'Enjoo', 'Digestão', 'Artrite'], ARRAY['Gravidez avançada', 'Sangramento'], ARRAY['Anticoagulantes', 'Medicamentos para diabetes'], '1-4g/dia', 'Chá ou suco fresco'),

('Alho', 'Allium sativum', 'Garlic', 'condimento', 'bulbo', 'Antibacteriano, antiviral, cardioprotetor', ARRAY['Alicina', 'Ajoeno', 'Sulfetos'], ARRAY['Hipertensão', 'Colesterol alto', 'Infecções'], ARRAY['Gravidez', 'Úlcera'], ARRAY['Anticoagulantes', 'Medicamentos para HIV'], '2-4 dentes/dia', 'Cru ou cozido'),

-- IMUNOMODULADORES
('Própolis', 'Propolis', 'Propolis', 'suplemento', 'apicultura', 'Antibacteriano, antiviral, imunomodulador', ARRAY['Flavonoides', 'Ácidos fenólicos', 'Terpenos'], ARRAY['Infecções', 'Imunidade', 'Feridas'], ARRAY['Alergia a abelhas'], ARRAY['Anticoagulantes'], '500-1000mg/dia', 'Extrato ou mel'),

('Cogumelo Reishi', 'Ganoderma lucidum', 'Reishi mushroom', 'suplemento', 'fungo', 'Imunomodulador, adaptógeno, antitumoral', ARRAY['Beta-glucanos', 'Triterpenos', 'Polissacarídeos'], ARRAY['Imunidade', 'Stress', 'Câncer'], ARRAY['Gravidez', 'Doenças autoimunes'], ARRAY['Imunossupressores'], '1-3g/dia', 'Chá ou cápsula'),

-- HEPATOPROTETORES
('Cardo Mariano', 'Silybum marianum', 'Milk thistle', 'suplemento', 'planta', 'Hepatoprotetor, antioxidante, regenerador hepático', ARRAY['Silimarina', 'Silibina', 'Flavonoides'], ARRAY['Proteção hepática', 'Cirrose', 'Hepatite'], ARRAY['Gravidez', 'Alergia'], ARRAY['Medicamentos metabolizados pelo fígado'], '200-600mg/dia', 'Extrato padronizado'),

-- CARDIOVASCULARES
('Hawthorn', 'Crataegus monogyna', 'Hawthorn', 'suplemento', 'planta', 'Cardioprotetor, vasodilatador, antiarrítmico', ARRAY['Proantocianidinas', 'Flavonoides', 'Oligômeros'], ARRAY['Insuficiência cardíaca', 'Hipertensão', 'Arritmia'], ARRAY['Gravidez', 'Bradicardia'], ARRAY['Digoxina', 'Beta-bloqueadores'], '300-600mg/dia', 'Extrato padronizado'),

-- DIGESTIVOS
('Hortelã', 'Mentha piperita', 'Peppermint', 'condimento', 'erva', 'Digestivo, antiespasmódico, carminativo', ARRAY['Mentol', 'Mentona', 'Óleos essenciais'], ARRAY['Síndrome do intestino irritável', 'Náusea', 'Digestão'], ARRAY['Refluxo', 'Gravidez'], ARRAY['Medicamentos para azia'], '1-3 cápsulas/dia', 'Chá ou óleo essencial'),

-- ADAPTOGÊNICOS
('Ashwagandha', 'Withania somnifera', 'Ashwagandha', 'suplemento', 'planta', 'Adaptógeno, anti-stress, imunomodulador', ARRAY['Withanolides', 'Alcaloides', 'Saponinas'], ARRAY['Stress', 'Ansiedade', 'Imunidade'], ARRAY['Gravidez', 'Tireoide'], ARRAY['Imunossupressores', 'Sedativos'], '300-600mg/dia', 'Extrato padronizado'),

-- ANTIOXIDANTES
('Açaí', 'Euterpe oleracea', 'Acai berry', 'fruta', 'tropical', 'Antioxidante, anti-inflamatório, energético', ARRAY['Antocianinas', 'Polifenois', 'Ácidos graxos'], ARRAY['Envelhecimento', 'Inflamação', 'Energia'], ARRAY['Alergia'], ARRAY['Anticoagulantes'], '100-200g/dia', 'Polpa ou suco'),

('Mirtilo', 'Vaccinium myrtillus', 'Blueberry', 'fruta', 'temperada', 'Antioxidante, neuroprotetor, antidiabético', ARRAY['Antocianinas', 'Resveratrol', 'Vitamina C'], ARRAY['Memória', 'Diabetes', 'Visão'], ARRAY['Alergia'], ARRAY['Anticoagulantes'], '50-100g/dia', 'Fresco ou congelado'),

-- PROTEÍNAS FUNCIONAIS
('Whey Protein', 'Proteína do soro', 'Whey protein', 'suplemento', 'proteina', 'Anabólico, imunomodulador, antioxidante', ARRAY['BCAAs', 'Glutamina', 'Lactoferrina'], ARRAY['Hipertrofia', 'Recuperação', 'Imunidade'], ARRAY['Intolerância à lactose'], ARRAY['Medicamentos para diabetes'], '20-30g/dose', 'Shake pós-treino'),

-- PROBIÓTICOS
('Kefir', 'Kefir', 'Kefir', 'laticinio', 'fermentado', 'Probiótico, imunomodulador, digestivo', ARRAY['Lactobacilos', 'Bifidobactérias', 'Enzimas'], ARRAY['Microbioma', 'Digestão', 'Imunidade'], ARRAY['Intolerância à lactose'], ARRAY['Antibióticos'], '200-500ml/dia', 'Fresco ou fermentado'),

-- ÔMEGA 3
('Óleo de Peixe', 'Óleo de peixe', 'Fish oil', 'suplemento', 'gordura', 'Anti-inflamatório, cardioprotetor, neuroprotetor', ARRAY['EPA', 'DHA', 'Vitamina D'], ARRAY['Inflamação', 'Coração', 'Cérebro'], ARRAY['Alergia a peixes'], ARRAY['Anticoagulantes'], '1000-3000mg/dia', 'Cápsula com refeição'),

-- VITAMINAS
('Vitamina D3', 'Colecalciferol', 'Vitamin D3', 'suplemento', 'vitamina', 'Imunomodulador, osteoprotetor, cardioprotetor', ARRAY['Vitamina D3', 'Colecalciferol'], ARRAY['Imunidade', 'Ossos', 'Coração'], ARRAY['Hipercalcemia'], ARRAY['Corticoides'], '1000-4000 UI/dia', 'Cápsula com gordura'),

-- MINERAIS
('Magnésio', 'Magnésio', 'Magnesium', 'suplemento', 'mineral', 'Relaxante muscular, cardioprotetor, antistress', ARRAY['Magnésio', 'Citrato'], ARRAY['Cãibras', 'Stress', 'Coração'], ARRAY['Insuficiência renal'], ARRAY['Antibióticos'], '200-400mg/dia', 'Citrato ou quelato'),

-- FIBRAS FUNCIONAIS
('Psyllium', 'Plantago ovata', 'Psyllium', 'suplemento', 'fibra', 'Laxante, prebiótico, cardioprotetor', ARRAY['Fibras solúveis', 'Mucilagem'], ARRAY['Constipação', 'Colesterol', 'Diabetes'], ARRAY['Obstrução intestinal'], ARRAY['Medicamentos'], '5-10g/dia', 'Misturado em água'),

-- ENZIMAS
('Bromelina', 'Ananas comosus', 'Bromelain', 'suplemento', 'enzima', 'Anti-inflamatório, digestivo, cicatrizante', ARRAY['Bromelina', 'Proteases'], ARRAY['Inflamação', 'Digestão', 'Feridas'], ARRAY['Úlcera', 'Alergia'], ARRAY['Anticoagulantes'], '500-1000mg/dia', 'Cápsula entre refeições'),

-- ADAPTOGÊNICOS BRASILEIROS
('Jatobá', 'Hymenaea courbaril', 'Jatoba', 'suplemento', 'planta', 'Energético, tônico, digestivo', ARRAY['Taninos', 'Flavonoides', 'Óleos essenciais'], ARRAY['Energia', 'Digestão', 'Tônico'], ARRAY['Gravidez'], ARRAY['Medicamentos'], '1-3g/dia', 'Chá ou extrato'),

('Guaraná', 'Paullinia cupana', 'Guarana', 'suplemento', 'planta', 'Estimulante, termogênico, cognitivo', ARRAY['Cafeína', 'Teobromina', 'Taninos'], ARRAY['Energia', 'Foco', 'Termogênese'], ARRAY['Hipertensão', 'Insônia'], ARRAY['Estimulantes'], '200-400mg/dia', 'Pó ou cápsula');

-- 2. INSERIR DOENÇAS E CONDIÇÕES
INSERT INTO doencas_condicoes (nome, categoria, descricao, sintomas, causas, fatores_risco, complicacoes, exames_diagnostico, tratamentos_convencionais, abordagem_nutricional, alimentos_beneficos, alimentos_evitar, suplementos_recomendados, estilo_vida) VALUES

-- DOENÇAS CARDIOVASCULARES
('Hipertensão Arterial', 'Cardiovascular', 'Pressão arterial elevada persistentemente', ARRAY['Dor de cabeça', 'Tontura', 'Fadiga', 'Dores no peito'], ARRAY['Genética', 'Obesidade', 'Sedentarismo', 'Estresse'], ARRAY['Idade', 'Histórico familiar', 'Tabagismo'], ARRAY['AVC', 'Infarto', 'Insuficiência cardíaca'], ARRAY['Medição da PA', 'Eletrocardiograma'], ARRAY['Anti-hipertensivos', 'Diuréticos'], 'Dieta DASH, redução de sódio, potássio', ARRAY['Alho', 'Hawthorn', 'Ômega 3', 'Potássio'], ARRAY['Sal', 'Alimentos processados', 'Cafeína'], ARRAY['Magnésio', 'Coenzima Q10', 'Vitamina D'], ARRAY['Exercício regular', 'Meditação', 'Sono adequado']),

('Diabetes Tipo 2', 'Metabólica', 'Resistência à insulina e hiperglicemia', ARRAY['Sede excessiva', 'Fome excessiva', 'Fadiga', 'Visão turva'], ARRAY['Obesidade', 'Sedentarismo', 'Dieta inadequada'], ARRAY['Histórico familiar', 'Idade', 'Obesidade'], ARRAY['Neuropatia', 'Nefropatia', 'Retinopatia'], ARRAY['Glicemia', 'Hemoglobina glicada'], ARRAY['Metformina', 'Insulina'], 'Controle glicêmico, baixo índice glicêmico', ARRAY['Canela', 'Cromo', 'Fibras', 'Proteínas magras'], ARRAY['Açúcares', 'Carboidratos refinados'], ARRAY['Cromo', 'Magnésio', 'Ômega 3'], ARRAY['Exercício', 'Controle de peso', 'Monitoramento glicêmico']),

-- DOENÇAS INFLAMATÓRIAS
('Artrite Reumatoide', 'Autoimune', 'Inflamação crônica das articulações', ARRAY['Dor articular', 'Rigidez', 'Inchaço', 'Fadiga'], ARRAY['Genética', 'Fatores ambientais', 'Disbiose intestinal'], ARRAY['Sexo feminino', 'Idade', 'Tabagismo'], ARRAY['Deformidades', 'Osteoporose', 'Doença cardiovascular'], ARRAY['Fator reumatoide', 'Proteína C reativa'], ARRAY['DMARDs', 'Corticoides'], 'Dieta anti-inflamatória, ômega 3', ARRAY['Ômega 3', 'Cúrcuma', 'Gengibre', 'Antioxidantes'], ARRAY['Glúten', 'Laticínios', 'Açúcares'], ARRAY['Ômega 3', 'Vitamina D', 'Probióticos'], ARRAY['Exercício suave', 'Repouso', 'Técnicas de relaxamento']),

('Síndrome do Intestino Irritável', 'Digestiva', 'Distúrbio funcional do intestino', ARRAY['Dor abdominal', 'Alteração do hábito intestinal', 'Inchaço'], ARRAY['Stress', 'Disbiose', 'Sensibilidade alimentar'], ARRAY['Sexo feminino', 'Stress', 'Histórico de infecções'], ARRAY['Ansiedade', 'Depressão'], ARRAY['Exame clínico', 'Exclusão de outras doenças'], ARRAY['Antiespasmódicos', 'Probióticos'], 'Dieta FODMAP, probióticos', ARRAY['Probióticos', 'Fibras solúveis', 'Hortelã'], ARRAY['FODMAPs', 'Cafeína', 'Álcool'], ARRAY['Probióticos', 'Glutamina', 'Magnésio'], ARRAY['Gerenciamento de stress', 'Exercício regular', 'Sono adequado']),

-- DOENÇAS NEURODEGENERATIVAS
('Doença de Alzheimer', 'Neurológica', 'Degeneração progressiva do cérebro', ARRAY['Perda de memória', 'Confusão', 'Mudanças de comportamento'], ARRAY['Genética', 'Inflamação', 'Acúmulo de beta-amiloide'], ARRAY['Idade', 'Histórico familiar', 'Trauma craniano'], ARRAY['Demência severa', 'Morte'], ARRAY['Testes cognitivos', 'Ressonância magnética'], ARRAY['Inibidores da colinesterase', 'Memantina'], 'Dieta MIND, antioxidantes', ARRAY['Ômega 3', 'Antioxidantes', 'Vitamina E', 'Curcumina'], ARRAY['Gorduras trans', 'Açúcares refinados'], ARRAY['Ômega 3', 'Vitamina E', 'Coenzima Q10'], ARRAY['Exercício mental', 'Socialização', 'Sono adequado']),

-- DOENÇAS HEPÁTICAS
('Esteatose Hepática', 'Hepática', 'Acúmulo de gordura no fígado', ARRAY['Fadiga', 'Dor abdominal', 'Perda de apetite'], ARRAY['Obesidade', 'Diabetes', 'Álcool'], ARRAY['Obesidade', 'Diabetes', 'Síndrome metabólica'], ARRAY['Cirrose', 'Câncer hepático'], ARRAY['Ultrassom', 'Enzimas hepáticas'], ARRAY['Mudança de estilo de vida'], 'Dieta mediterrânea, redução de carboidratos', ARRAY['Cardo mariano', 'Café', 'Ômega 3', 'Antioxidantes'], ARRAY['Álcool', 'Açúcares', 'Gorduras trans'], ARRAY['Cardo mariano', 'Vitamina E', 'Ômega 3'], ARRAY['Exercício regular', 'Controle de peso', 'Abstinência alcoólica']),

-- DOENÇAS RESPIRATÓRIAS
('Asma', 'Respiratória', 'Inflamação crônica das vias aéreas', ARRAY['Tosse', 'Sibilos', 'Falta de ar', 'Aperto no peito'], ARRAY['Genética', 'Alergias', 'Poluição'], ARRAY['Histórico familiar', 'Alergias', 'Obesidade'], ARRAY['Crises severas', 'Hospitalização'], ARRAY['Espirometria', 'Testes de alergia'], ARRAY['Broncodilatadores', 'Corticoides'], 'Dieta anti-inflamatória, ômega 3', ARRAY['Ômega 3', 'Vitamina D', 'Magnésio', 'Antioxidantes'], ARRAY['Sulfitos', 'Alimentos alergênicos'], ARRAY['Vitamina D', 'Ômega 3', 'Magnésio'], ARRAY['Evitar alérgenos', 'Exercício moderado', 'Técnicas respiratórias']),

-- DOENÇAS ÓSSEAS
('Osteoporose', 'Osteoarticular', 'Perda de densidade óssea', ARRAY['Fraturas', 'Dor óssea', 'Perda de altura'], ARRAY['Envelhecimento', 'Deficiência hormonal', 'Nutrição inadequada'], ARRAY['Sexo feminino', 'Idade', 'Histórico familiar'], ARRAY['Fraturas', 'Deformidades'], ARRAY['Densitometria óssea'], ARRAY['Bifosfonatos', 'Suplementação de cálcio'], 'Dieta rica em cálcio e vitamina D', ARRAY['Cálcio', 'Vitamina D', 'Vitamina K', 'Magnésio'], ARRAY['Cafeína', 'Álcool', 'Sódio excessivo'], ARRAY['Cálcio', 'Vitamina D', 'Vitamina K'], ARRAY['Exercício com peso', 'Exposição solar', 'Parar de fumar']),

-- DOENÇAS DA PELE
('Psoríase', 'Dermatológica', 'Doença inflamatória da pele', ARRAY['Placas vermelhas', 'Descamação', 'Coceira'], ARRAY['Genética', 'Stress', 'Disbiose intestinal'], ARRAY['Histórico familiar', 'Stress', 'Infecções'], ARRAY['Artrite psoriática', 'Doença cardiovascular'], ARRAY['Exame clínico', 'Biópsia'], ARRAY['Corticoides tópicos', 'Fototerapia'], 'Dieta anti-inflamatória, ômega 3', ARRAY['Ômega 3', 'Vitamina D', 'Probióticos', 'Antioxidantes'], ARRAY['Glúten', 'Laticínios', 'Álcool'], ARRAY['Vitamina D', 'Ômega 3', 'Probióticos'], ARRAY['Exposição solar moderada', 'Gerenciamento de stress', 'Hidratação']),

-- DOENÇAS MENTAIS
('Depressão', 'Mental', 'Transtorno do humor caracterizado por tristeza persistente', ARRAY['Tristeza', 'Perda de interesse', 'Fadiga', 'Alterações do sono'], ARRAY['Genética', 'Stress', 'Desequilíbrio químico'], ARRAY['Histórico familiar', 'Stress', 'Trauma'], ARRAY['Suicídio', 'Isolamento social'], ARRAY['Avaliação psiquiátrica'], ARRAY['Antidepressivos', 'Terapia'], 'Dieta mediterrânea, ômega 3, probióticos', ARRAY['Ômega 3', 'Triptofano', 'Vitamina D', 'Probióticos'], ARRAY['Açúcares', 'Álcool', 'Cafeína excessiva'], ARRAY['Ômega 3', 'Vitamina D', 'Magnésio'], ARRAY['Exercício regular', 'Terapia', 'Sono adequado']),

-- DOENÇAS METABÓLICAS
('Síndrome Metabólica', 'Metabólica', 'Conjunto de fatores de risco cardiovascular', ARRAY['Obesidade abdominal', 'Hipertensão', 'Resistência à insulina'], ARRAY['Obesidade', 'Sedentarismo', 'Dieta inadequada'], ARRAY['Idade', 'Histórico familiar', 'Sedentarismo'], ARRAY['Diabetes', 'Doença cardiovascular'], ARRAY['Medidas antropométricas', 'Exames laboratoriais'], ARRAY['Mudança de estilo de vida'], 'Dieta mediterrânea, exercício', ARRAY['Ômega 3', 'Fibras', 'Antioxidantes', 'Proteínas magras'], ARRAY['Açúcares', 'Gorduras trans', 'Carboidratos refinados'], ARRAY['Ômega 3', 'Magnésio', 'Vitamina D'], ARRAY['Exercício regular', 'Controle de peso', 'Dieta balanceada']);

-- 3. INSERIR PRINCÍPIOS ATIVOS
INSERT INTO principios_ativos (nome, categoria, descricao, mecanismo_acao, beneficios_terapeuticos, efeitos_colaterais, contraindicacoes, interacoes_medicamentosas, dosagem_segura, fontes_naturais) VALUES

-- ANTI-INFLAMATÓRIOS
('Curcumina', 'Anti-inflamatório', 'Princípio ativo da cúrcuma com potente ação anti-inflamatória', 'Inibe NF-kB, COX-2, LOX', ARRAY['Anti-inflamatório', 'Antioxidante', 'Anticancerígeno'], ARRAY['Náusea', 'Diarréia'], ARRAY['Gravidez', 'Pedras na vesícula'], ARRAY['Anticoagulantes', 'Antiácidos'], '500-2000mg/dia', ARRAY['Cúrcuma', 'Curry']),

('Ômega 3', 'Ácido graxo essencial', 'Ácidos graxos poli-insaturados com ação anti-inflamatória', 'Precursor de prostaglandinas anti-inflamatórias', ARRAY['Anti-inflamatório', 'Cardioprotetor', 'Neuroprotetor'], ARRAY['Sangramento', 'Náusea'], ARRAY['Alergia a peixes'], ARRAY['Anticoagulantes'], '1000-3000mg/dia', ARRAY['Peixes gordurosos', 'Sementes de chia', 'Nozes']),

-- ANTIOXIDANTES
('Resveratrol', 'Antioxidante', 'Polifenol com potente ação antioxidante', 'Ativa SIRT1, inibe radicais livres', ARRAY['Antioxidante', 'Anti-aging', 'Cardioprotetor'], ARRAY['Náusea', 'Diarréia'], ARRAY['Gravidez'], ARRAY['Anticoagulantes'], '100-500mg/dia', ARRAY['Uvas', 'Vinho tinto', 'Amendoim']),

('Quercetina', 'Flavonoide', 'Flavonoide com ação antioxidante e anti-inflamatória', 'Inibe histamina, inibe COX-2', ARRAY['Antioxidante', 'Anti-alérgico', 'Anti-inflamatório'], ARRAY['Náusea', 'Dor de cabeça'], ARRAY['Gravidez'], ARRAY['Anticoagulantes'], '500-1000mg/dia', ARRAY['Cebola', 'Maçã', 'Chá verde']),

-- IMUNOMODULADORES
('Beta-glucanos', 'Imunomodulador', 'Polissacarídeos que estimulam o sistema imunológico', 'Ativa macrófagos, células NK', ARRAY['Imunomodulador', 'Anticancerígeno', 'Antiviral'], ARRAY['Náusea', 'Fadiga'], ARRAY['Doenças autoimunes'], ARRAY['Imunossupressores'], '100-500mg/dia', ARRAY['Cogumelos', 'Aveia', 'Levedura']),

-- ADAPTOGÊNICOS
('Withanolides', 'Adaptógeno', 'Princípios ativos da ashwagandha com ação adaptogênica', 'Modula cortisol, melhora resposta ao stress', ARRAY['Adaptógeno', 'Anti-stress', 'Imunomodulador'], ARRAY['Náusea', 'Diarréia'], ARRAY['Gravidez', 'Tireoide'], ARRAY['Sedativos', 'Imunossupressores'], '300-600mg/dia', ARRAY['Ashwagandha']),

-- PROBIÓTICOS
('Lactobacilos', 'Probiótico', 'Bactérias benéficas que colonizam o intestino', 'Modula microbioma, produz ácidos graxos de cadeia curta', ARRAY['Digestivo', 'Imunomodulador', 'Antibiótico natural'], ARRAY['Inchaço', 'Gases'], ARRAY['Imunossupressão'], ARRAY['Antibióticos'], '1-10 bilhões UFC/dia', ARRAY['Iogurte', 'Kefir', 'Chucrute']),

-- ENZIMAS
('Bromelina', 'Enzima proteolítica', 'Enzima da abacaxi com ação anti-inflamatória', 'Degrada proteínas, inibe inflamação', ARRAY['Anti-inflamatório', 'Digestivo', 'Cicatrizante'], ARRAY['Náusea', 'Diarréia'], ARRAY['Úlcera', 'Alergia'], ARRAY['Anticoagulantes'], '500-1000mg/dia', ARRAY['Abacaxi']),

-- VITAMINAS
('Vitamina D3', 'Vitamina', 'Vitamina lipossolúvel essencial para múltiplas funções', 'Modula expressão gênica, regula cálcio', ARRAY['Imunomodulador', 'Osteoprotetor', 'Cardioprotetor'], ARRAY['Hipercalcemia'], ARRAY['Hipercalcemia'], ARRAY['Corticoides'], '1000-4000 UI/dia', ARRAY['Exposição solar', 'Peixes gordurosos', 'Gema de ovo']),

-- MINERAIS
('Magnésio', 'Mineral', 'Mineral essencial para mais de 300 reações enzimáticas', 'Cofator enzimático, relaxante muscular', ARRAY['Relaxante muscular', 'Cardioprotetor', 'Anti-stress'], ARRAY['Diarréia'], ARRAY['Insuficiência renal'], ARRAY['Antibióticos'], '200-400mg/dia', ARRAY['Sementes', 'Nozes', 'Vegetais verdes']);

-- ========================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_alimentos_categoria ON alimentos_completos(categoria);
CREATE INDEX IF NOT EXISTS idx_alimentos_subcategoria ON alimentos_completos(subcategoria);
CREATE INDEX IF NOT EXISTS idx_doencas_categoria ON doencas_condicoes(categoria);
CREATE INDEX IF NOT EXISTS idx_alimentos_doencas_alimento ON alimentos_doencas(alimento_id);
CREATE INDEX IF NOT EXISTS idx_alimentos_doencas_doenca ON alimentos_doencas(doenca_id);
CREATE INDEX IF NOT EXISTS idx_substituicoes_original ON substituicoes_inteligentes(alimento_original_id);
CREATE INDEX IF NOT EXISTS idx_substituicoes_substituto ON substituicoes_inteligentes(alimento_substituto_id);
CREATE INDEX IF NOT EXISTS idx_combinacoes_alimento1 ON combinacoes_terapeuticas(alimento1_id);
CREATE INDEX IF NOT EXISTS idx_combinacoes_alimento2 ON combinacoes_terapeuticas(alimento2_id);
CREATE INDEX IF NOT EXISTS idx_principios_ativos_categoria ON principios_ativos(categoria);

-- ========================================
-- HABILITAR RLS E CRIAR POLÍTICAS
-- ========================================

ALTER TABLE alimentos_completos ENABLE ROW LEVEL SECURITY;
ALTER TABLE valores_nutricionais_completos ENABLE ROW LEVEL SECURITY;
ALTER TABLE doencas_condicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_doencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE substituicoes_inteligentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE combinacoes_terapeuticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE principios_ativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_principios_ativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas_terapeuticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocolos_nutricionais ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público (dados de referência)
CREATE POLICY "Public read access" ON alimentos_completos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON valores_nutricionais_completos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON doencas_condicoes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON alimentos_doencas FOR SELECT USING (true);
CREATE POLICY "Public read access" ON substituicoes_inteligentes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON combinacoes_terapeuticas FOR SELECT USING (true);
CREATE POLICY "Public read access" ON principios_ativos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON alimentos_principios_ativos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON receitas_terapeuticas FOR SELECT USING (true);
CREATE POLICY "Public read access" ON protocolos_nutricionais FOR SELECT USING (true);

-- ========================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE alimentos_completos IS 'Base de dados completa de alimentos com propriedades medicinais - "Faça de seu alimento seu remédio"';
COMMENT ON TABLE valores_nutricionais_completos IS 'Valores nutricionais detalhados para análise completa';
COMMENT ON TABLE doencas_condicoes IS 'Doenças e condições com abordagem nutricional';
COMMENT ON TABLE alimentos_doencas IS 'Relação entre alimentos e doenças/condições';
COMMENT ON TABLE substituicoes_inteligentes IS 'Substituições alimentares inteligentes para condições específicas';
COMMENT ON TABLE combinacoes_terapeuticas IS 'Combinações de alimentos com efeito terapêutico';
COMMENT ON TABLE principios_ativos IS 'Princípios ativos dos alimentos com propriedades medicinais';
COMMENT ON TABLE alimentos_principios_ativos IS 'Relação entre alimentos e seus princípios ativos';
COMMENT ON TABLE receitas_terapeuticas IS 'Receitas com finalidade terapêutica';
COMMENT ON TABLE protocolos_nutricionais IS 'Protocolos nutricionais para condições específicas';

-- ========================================
-- VERIFICAR DADOS INSERIDOS
-- ========================================

SELECT 
  (SELECT COUNT(*) FROM alimentos_completos) as total_alimentos,
  (SELECT COUNT(*) FROM doencas_condicoes) as total_doencas,
  (SELECT COUNT(*) FROM principios_ativos) as total_principios_ativos,
  (SELECT COUNT(*) FROM valores_nutricionais_completos) as total_valores_nutricionais; 