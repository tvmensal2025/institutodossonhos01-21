-- ========================================
-- APLICAÇÃO SEGURA DA BASE ROBUSTA
-- SEM MEXER NA IA ATUAL
-- ========================================

-- 1. TABELA PRINCIPAL DE ALIMENTOS (EXPANDIDA) - NOVA
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
  contraindicacoes TEXT,
  interacoes_medicamentosas TEXT[],
  dosagem_terapeutica VARCHAR(100),
  forma_preparo_medicinal TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABELA DE VALORES NUTRICIONAIS COMPLETOS - NOVA
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

-- 3. TABELA DE DOENÇAS E CONDIÇÕES - NOVA
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

-- 4. TABELA DE ALIMENTOS PARA DOENÇAS - NOVA
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

-- 5. TABELA DE SUBSTITUIÇÕES INTELIGENTES - NOVA
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

-- 6. TABELA DE COMBINAÇÕES TERAPÊUTICAS - NOVA
CREATE TABLE IF NOT EXISTS combinacoes_terapeuticas (
  id SERIAL PRIMARY KEY,
  alimento1_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
  alimento2_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
  nome_combinacao VARCHAR(255),
  beneficio_sinergia TEXT,
  mecanismo_sinergia TEXT,
  evidencia_cientifica VARCHAR(50),
  dosagem_recomendada VARCHAR(100),
  forma_preparo TEXT,
  contraindicacoes TEXT,
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. TABELA DE PRINCÍPIOS ATIVOS - NOVA
CREATE TABLE IF NOT EXISTS principios_ativos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  descricao TEXT,
  mecanismo_acao TEXT,
  beneficios_terapeuticos TEXT[],
  efeitos_colaterais TEXT[],
  dosagem_segura VARCHAR(100),
  interacoes_medicamentosas TEXT[],
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. TABELA DE ALIMENTOS E PRINCÍPIOS ATIVOS - NOVA
CREATE TABLE IF NOT EXISTS alimentos_principios_ativos (
  id SERIAL PRIMARY KEY,
  alimento_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
  principio_ativo_id INTEGER REFERENCES principios_ativos(id) ON DELETE CASCADE,
  concentracao DECIMAL(5,2),
  biodisponibilidade VARCHAR(100),
  forma_quimica VARCHAR(100),
  estabilidade VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. TABELA DE RECEITAS TERAPÊUTICAS - NOVA
CREATE TABLE IF NOT EXISTS receitas_terapeuticas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  objetivo_terapeutico VARCHAR(255),
  ingredientes JSONB,
  instrucoes_preparo TEXT,
  tempo_preparo INTEGER,
  dificuldade VARCHAR(50),
  beneficios_terapeuticos TEXT[],
  contraindicacoes TEXT,
  dosagem_recomendada VARCHAR(100),
  frequencia_consumo VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. TABELA DE PROTOCOLOS NUTRICIONAIS - NOVA
CREATE TABLE IF NOT EXISTS protocolos_nutricionais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  objetivo VARCHAR(255),
  descricao TEXT,
  duracao VARCHAR(100),
  fase1_alimentos TEXT[],
  fase2_alimentos TEXT[],
  fase3_alimentos TEXT[],
  alimentos_evitar TEXT[],
  suplementos_recomendados TEXT[],
  estilo_vida TEXT[],
  contraindicacoes TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_alimentos_completos_categoria ON alimentos_completos(categoria);
CREATE INDEX IF NOT EXISTS idx_alimentos_completos_subcategoria ON alimentos_completos(subcategoria);
CREATE INDEX IF NOT EXISTS idx_doencas_condicoes_categoria ON doencas_condicoes(categoria);
CREATE INDEX IF NOT EXISTS idx_alimentos_doencas_alimento ON alimentos_doencas(alimento_id);
CREATE INDEX IF NOT EXISTS idx_alimentos_doencas_doenca ON alimentos_doencas(doenca_id);
CREATE INDEX IF NOT EXISTS idx_substituicoes_original ON substituicoes_inteligentes(alimento_original_id);
CREATE INDEX IF NOT EXISTS idx_substituicoes_substituto ON substituicoes_inteligentes(alimento_substituto_id);
CREATE INDEX IF NOT EXISTS idx_combinacoes_alimento1 ON combinacoes_terapeuticas(alimento1_id);
CREATE INDEX IF NOT EXISTS idx_combinacoes_alimento2 ON combinacoes_terapeuticas(alimento2_id);
CREATE INDEX IF NOT EXISTS idx_principios_ativos_categoria ON principios_ativos(categoria);
CREATE INDEX IF NOT EXISTS idx_alimentos_principios_alimento ON alimentos_principios_ativos(alimento_id);
CREATE INDEX IF NOT EXISTS idx_alimentos_principios_principio ON alimentos_principios_ativos(principio_ativo_id);

-- ========================================
-- COMENTÁRIOS NAS TABELAS
-- ========================================

COMMENT ON TABLE alimentos_completos IS 'Base de dados nutricional completa da SOFIA - Alimentos medicinais';
COMMENT ON TABLE valores_nutricionais_completos IS 'Valores nutricionais detalhados para alimentos medicinais';
COMMENT ON TABLE doencas_condicoes IS 'Doenças e condições com abordagem nutricional';
COMMENT ON TABLE alimentos_doencas IS 'Relação entre alimentos e doenças/condições';
COMMENT ON TABLE substituicoes_inteligentes IS 'Substituições inteligentes para condições específicas';
COMMENT ON TABLE combinacoes_terapeuticas IS 'Combinações sinérgicas de alimentos com efeito terapêutico';
COMMENT ON TABLE principios_ativos IS 'Princípios ativos dos alimentos medicinais';
COMMENT ON TABLE alimentos_principios_ativos IS 'Relação entre alimentos e seus princípios ativos';
COMMENT ON TABLE receitas_terapeuticas IS 'Receitas com finalidade terapêutica';
COMMENT ON TABLE protocolos_nutricionais IS 'Protocolos nutricionais especializados';

-- ========================================
-- MENSAGEM DE CONFIRMAÇÃO
-- ========================================

SELECT '✅ BASE ROBUSTA APLICADA COM SUCESSO!' as status;
SELECT '🛡️ IA ATUAL NÃO FOI AFETADA' as seguranca;
SELECT '🎯 PRÓXIMO PASSO: INSERIR DADOS' as proximo_passo;
