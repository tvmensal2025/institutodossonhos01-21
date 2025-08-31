-- ========================================
-- SOFIA - EXPANSÃO COMPLETA DA BASE DE DADOS
-- "FAÇA DE SEU ALIMENTO SEU REMÉDIO"
-- FUNCIONALIDADES AVANÇADAS ADICIONAIS
-- ========================================

-- 1. TABELA DE SINTOMAS E ALIMENTOS RELACIONADOS
CREATE TABLE IF NOT EXISTS sintomas_alimentos (
  id SERIAL PRIMARY KEY,
  sintoma VARCHAR(255) NOT NULL,
  categoria_sintoma VARCHAR(100),
  descricao_sintoma TEXT,
  alimentos_beneficos TEXT[],
  alimentos_evitar TEXT[],
  mecanismo_acao TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABELA DE ESTADOS EMOCIONAIS E ALIMENTOS
CREATE TABLE IF NOT EXISTS estados_emocionais_alimentos (
  id SERIAL PRIMARY KEY,
  estado_emocional VARCHAR(255) NOT NULL,
  descricao_estado TEXT,
  alimentos_beneficos TEXT[],
  alimentos_evitar TEXT[],
  mecanismo_acao TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABELA DE ATIVIDADE FÍSICA E ALIMENTOS
CREATE TABLE IF NOT EXISTS atividade_fisica_alimentos (
  id SERIAL PRIMARY KEY,
  tipo_atividade VARCHAR(255) NOT NULL,
  intensidade VARCHAR(50),
  duracao VARCHAR(100),
  alimentos_pre_treino TEXT[],
  alimentos_pos_treino TEXT[],
  alimentos_evitar TEXT[],
  hidratacao_recomendada VARCHAR(100),
  suplementos_recomendados TEXT[],
  mecanismo_acao TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. TABELA DE IDADE E ALIMENTOS
CREATE TABLE IF NOT EXISTS idade_alimentos (
  id SERIAL PRIMARY KEY,
  faixa_etaria VARCHAR(100) NOT NULL,
  descricao_faixa TEXT,
  necessidades_nutricionais TEXT[],
  alimentos_essenciais TEXT[],
  alimentos_evitar TEXT[],
  suplementos_recomendados TEXT[],
  consideracoes_especiais TEXT[],
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. TABELA DE GÊNERO E ALIMENTOS
CREATE TABLE IF NOT EXISTS genero_alimentos (
  id SERIAL PRIMARY KEY,
  genero VARCHAR(50) NOT NULL,
  necessidades_especificas TEXT[],
  alimentos_beneficos TEXT[],
  alimentos_evitar TEXT[],
  suplementos_recomendados TEXT[],
  consideracoes_hormonais TEXT[],
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. TABELA DE SAZONALIDADE E ALIMENTOS
CREATE TABLE IF NOT EXISTS sazonalidade_alimentos (
  id SERIAL PRIMARY KEY,
  estacao VARCHAR(50) NOT NULL,
  mes_inicio INTEGER,
  mes_fim INTEGER,
  alimentos_sazonais TEXT[],
  beneficios_sazonais TEXT[],
  preparacoes_recomendadas TEXT[],
  consideracoes_climaticas TEXT[],
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. TABELA DE ALERGIAS E INTOLERÂNCIAS
CREATE TABLE IF NOT EXISTS alergias_intolerancias (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(100) NOT NULL,
  descricao TEXT,
  sintomas TEXT[],
  alimentos_proibidos TEXT[],
  alimentos_substitutos TEXT[],
  exames_diagnostico TEXT[],
  tratamento_nutricional TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. TABELA DE MEDICAMENTOS E INTERAÇÕES
CREATE TABLE IF NOT EXISTS medicamentos_interacoes (
  id SERIAL PRIMARY KEY,
  medicamento VARCHAR(255) NOT NULL,
  categoria_medicamento VARCHAR(100),
  principio_ativo VARCHAR(255),
  alimentos_evitar TEXT[],
  alimentos_beneficos TEXT[],
  suplementos_contraindicados TEXT[],
  suplementos_recomendados TEXT[],
  mecanismo_interacao TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. TABELA DE OBJETIVOS FITNESS
CREATE TABLE IF NOT EXISTS objetivos_fitness_alimentos (
  id SERIAL PRIMARY KEY,
  objetivo VARCHAR(255) NOT NULL,
  descricao_objetivo TEXT,
  alimentos_essenciais TEXT[],
  alimentos_evitar TEXT[],
  suplementos_recomendados TEXT[],
  protocolo_nutricional TEXT,
  consideracoes_especiais TEXT[],
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. TABELA DE MICROBIOMA E ALIMENTOS
CREATE TABLE IF NOT EXISTS microbioma_alimentos (
  id SERIAL PRIMARY KEY,
  tipo_bacteria VARCHAR(255) NOT NULL,
  funcao_bacteria TEXT,
  alimentos_prebioticos TEXT[],
  alimentos_probioticos TEXT[],
  alimentos_evitar TEXT[],
  beneficios_esperados TEXT[],
  tempo_adaptacao VARCHAR(100),
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. TABELA DE DETOX E ALIMENTOS
CREATE TABLE IF NOT EXISTS detox_alimentos (
  id SERIAL PRIMARY KEY,
  tipo_detox VARCHAR(255) NOT NULL,
  descricao_detox TEXT,
  alimentos_detox TEXT[],
  alimentos_evitar TEXT[],
  suplementos_detox TEXT[],
  protocolo_detox TEXT,
  duracao_recomendada VARCHAR(100),
  contraindicacoes TEXT[],
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. TABELA DE JEJUM E ALIMENTOS
CREATE TABLE IF NOT EXISTS jejum_alimentos (
  id SERIAL PRIMARY KEY,
  tipo_jejum VARCHAR(255) NOT NULL,
  descricao_jejum TEXT,
  duracao_jejum VARCHAR(100),
  alimentos_permitidos TEXT[],
  alimentos_proibidos TEXT[],
  protocolo_quebra_jejum TEXT,
  beneficios_esperados TEXT[],
  contraindicacoes TEXT[],
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 13. TABELA DE ALIMENTOS FUNCIONAIS
CREATE TABLE IF NOT EXISTS alimentos_funcionais (
  id SERIAL PRIMARY KEY,
  alimento VARCHAR(255) NOT NULL,
  categoria_funcional VARCHAR(100),
  principio_ativo VARCHAR(255),
  beneficio_funcional TEXT,
  dosagem_recomendada VARCHAR(100),
  forma_consumo TEXT,
  contraindicacoes TEXT[],
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 14. TABELA DE SUPERALIMENTOS
CREATE TABLE IF NOT EXISTS superalimentos (
  id SERIAL PRIMARY KEY,
  alimento VARCHAR(255) NOT NULL,
  categoria_superalimento VARCHAR(100),
  nutrientes_principais TEXT[],
  beneficios_unicos TEXT[],
  dosagem_recomendada VARCHAR(100),
  forma_consumo TEXT,
  contraindicacoes TEXT[],
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 15. TABELA DE ALIMENTOS FERMENTADOS
CREATE TABLE IF NOT EXISTS alimentos_fermentados (
  id SERIAL PRIMARY KEY,
  alimento VARCHAR(255) NOT NULL,
  tipo_fermentacao VARCHAR(100),
  bacterias_envolvidas TEXT[],
  beneficios_fermentacao TEXT[],
  forma_consumo TEXT,
  contraindicacoes TEXT[],
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 16. TABELA DE ALIMENTOS ORGÂNICOS
CREATE TABLE IF NOT EXISTS alimentos_organicos (
  id SERIAL PRIMARY KEY,
  alimento VARCHAR(255) NOT NULL,
  certificacao_organica VARCHAR(100),
  beneficios_organicos TEXT[],
  diferencas_nutricionais TEXT[],
  impacto_ambiental TEXT,
  custo_beneficio TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 17. TABELA DE ALIMENTOS LOCAIS
CREATE TABLE IF NOT EXISTS alimentos_locais (
  id SERIAL PRIMARY KEY,
  alimento VARCHAR(255) NOT NULL,
  regiao_origem VARCHAR(100),
  epoca_colheita VARCHAR(100),
  beneficios_locais TEXT[],
  impacto_sustentabilidade TEXT,
  disponibilidade_local TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 18. TABELA DE ALIMENTOS TRADICIONAIS
CREATE TABLE IF NOT EXISTS alimentos_tradicionais (
  id SERIAL PRIMARY KEY,
  alimento VARCHAR(255) NOT NULL,
  cultura_origem VARCHAR(100),
  historia_tradicional TEXT,
  beneficios_tradicionais TEXT[],
  preparacao_tradicional TEXT,
  significado_cultural TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 19. TABELA DE ALIMENTOS MODERNOS
CREATE TABLE IF NOT EXISTS alimentos_modernos (
  id SERIAL PRIMARY KEY,
  alimento VARCHAR(255) NOT NULL,
  categoria_moderna VARCHAR(100),
  tecnologia_producao TEXT,
  beneficios_modernos TEXT[],
  diferencas_tradicionais TEXT[],
  sustentabilidade_moderna TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 20. TABELA DE ALIMENTOS SUSTENTÁVEIS
CREATE TABLE IF NOT EXISTS alimentos_sustentaveis (
  id SERIAL PRIMARY KEY,
  alimento VARCHAR(255) NOT NULL,
  categoria_sustentavel VARCHAR(100),
  impacto_ambiental TEXT,
  beneficios_sustentabilidade TEXT[],
  certificacoes_sustentaveis TEXT[],
  custo_beneficio_ambiental TEXT,
  evidencia_cientifica VARCHAR(50),
  nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_sintomas_alimentos_sintoma ON sintomas_alimentos(sintoma);
CREATE INDEX IF NOT EXISTS idx_estados_emocionais_estado ON estados_emocionais_alimentos(estado_emocional);
CREATE INDEX IF NOT EXISTS idx_atividade_fisica_tipo ON atividade_fisica_alimentos(tipo_atividade);
CREATE INDEX IF NOT EXISTS idx_idade_alimentos_faixa ON idade_alimentos(faixa_etaria);
CREATE INDEX IF NOT EXISTS idx_genero_alimentos_genero ON genero_alimentos(genero);
CREATE INDEX IF NOT EXISTS idx_sazonalidade_estacao ON sazonalidade_alimentos(estacao);
CREATE INDEX IF NOT EXISTS idx_alergias_tipo ON alergias_intolerancias(tipo);
CREATE INDEX IF NOT EXISTS idx_medicamentos_nome ON medicamentos_interacoes(medicamento);
CREATE INDEX IF NOT EXISTS idx_objetivos_fitness_objetivo ON objetivos_fitness_alimentos(objetivo);
CREATE INDEX IF NOT EXISTS idx_microbioma_bacteria ON microbioma_alimentos(tipo_bacteria);
CREATE INDEX IF NOT EXISTS idx_detox_tipo ON detox_alimentos(tipo_detox);
CREATE INDEX IF NOT EXISTS idx_jejum_tipo ON jejum_alimentos(tipo_jejum);
CREATE INDEX IF NOT EXISTS idx_alimentos_funcionais_alimento ON alimentos_funcionais(alimento);
CREATE INDEX IF NOT EXISTS idx_superalimentos_alimento ON superalimentos(alimento);
CREATE INDEX IF NOT EXISTS idx_alimentos_fermentados_alimento ON alimentos_fermentados(alimento);
CREATE INDEX IF NOT EXISTS idx_alimentos_organicos_alimento ON alimentos_organicos(alimento);
CREATE INDEX IF NOT EXISTS idx_alimentos_locais_alimento ON alimentos_locais(alimento);
CREATE INDEX IF NOT EXISTS idx_alimentos_tradicionais_alimento ON alimentos_tradicionais(alimento);
CREATE INDEX IF NOT EXISTS idx_alimentos_modernos_alimento ON alimentos_modernos(alimento);
CREATE INDEX IF NOT EXISTS idx_alimentos_sustentaveis_alimento ON alimentos_sustentaveis(alimento);

-- ========================================
-- HABILITAR RLS E CRIAR POLÍTICAS
-- ========================================

ALTER TABLE sintomas_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estados_emocionais_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividade_fisica_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE idade_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE genero_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sazonalidade_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alergias_intolerancias ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicamentos_interacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos_fitness_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE microbioma_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detox_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jejum_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_funcionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE superalimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_fermentados ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_organicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_tradicionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_modernos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_sustentaveis ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público
CREATE POLICY "Public read access" ON sintomas_alimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON estados_emocionais_alimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON atividade_fisica_alimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON idade_alimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON genero_alimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sazonalidade_alimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON alergias_intolerancias FOR SELECT USING (true);
CREATE POLICY "Public read access" ON medicamentos_interacoes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON objetivos_fitness_alimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON microbioma_alimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON detox_alimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON jejum_alimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON alimentos_funcionais FOR SELECT USING (true);
CREATE POLICY "Public read access" ON superalimentos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON alimentos_fermentados FOR SELECT USING (true);
CREATE POLICY "Public read access" ON alimentos_organicos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON alimentos_locais FOR SELECT USING (true);
CREATE POLICY "Public read access" ON alimentos_tradicionais FOR SELECT USING (true);
CREATE POLICY "Public read access" ON alimentos_modernos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON alimentos_sustentaveis FOR SELECT USING (true);

-- ========================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE sintomas_alimentos IS 'Relação entre sintomas e alimentos benéficos/prejudiciais';
COMMENT ON TABLE estados_emocionais_alimentos IS 'Relação entre estados emocionais e alimentos';
COMMENT ON TABLE atividade_fisica_alimentos IS 'Relação entre atividade física e alimentação';
COMMENT ON TABLE idade_alimentos IS 'Relação entre faixa etária e necessidades nutricionais';
COMMENT ON TABLE genero_alimentos IS 'Relação entre gênero e necessidades nutricionais específicas';
COMMENT ON TABLE sazonalidade_alimentos IS 'Relação entre sazonalidade e alimentos';
COMMENT ON TABLE alergias_intolerancias IS 'Alergias e intolerâncias alimentares';
COMMENT ON TABLE medicamentos_interacoes IS 'Interações entre medicamentos e alimentos';
COMMENT ON TABLE objetivos_fitness_alimentos IS 'Relação entre objetivos fitness e alimentação';
COMMENT ON TABLE microbioma_alimentos IS 'Relação entre microbioma e alimentos';
COMMENT ON TABLE detox_alimentos IS 'Protocolos de detox e alimentos relacionados';
COMMENT ON TABLE jejum_alimentos IS 'Protocolos de jejum e alimentos relacionados';
COMMENT ON TABLE alimentos_funcionais IS 'Alimentos com propriedades funcionais específicas';
COMMENT ON TABLE superalimentos IS 'Superalimentos e suas propriedades únicas';
COMMENT ON TABLE alimentos_fermentados IS 'Alimentos fermentados e seus benefícios';
COMMENT ON TABLE alimentos_organicos IS 'Alimentos orgânicos e suas características';
COMMENT ON TABLE alimentos_locais IS 'Alimentos locais e sustentabilidade';
COMMENT ON TABLE alimentos_tradicionais IS 'Alimentos tradicionais e cultura';
COMMENT ON TABLE alimentos_modernos IS 'Alimentos modernos e tecnologia';
COMMENT ON TABLE alimentos_sustentaveis IS 'Alimentos sustentáveis e impacto ambiental'; 