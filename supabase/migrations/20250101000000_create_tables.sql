-- 1. TABELA DE DADOS FÍSICOS DO USUÁRIO (CADASTRO)
CREATE TABLE user_physical_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  altura_cm DECIMAL(5,2) NOT NULL,
  idade INTEGER NOT NULL,
  sexo VARCHAR(10) NOT NULL CHECK (sexo IN ('masculino', 'feminino')),
  nivel_atividade VARCHAR(20) DEFAULT 'moderado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE PESAGENS (HISTÓRICO COMPLETO)
CREATE TABLE weight_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  peso_kg DECIMAL(5,2) NOT NULL,
  gordura_corporal_percent DECIMAL(4,2),
  gordura_visceral INTEGER,
  massa_muscular_kg DECIMAL(5,2),
  agua_corporal_percent DECIMAL(4,2),
  osso_kg DECIMAL(4,2),
  metabolismo_basal_kcal INTEGER,
  idade_metabolica INTEGER,
  risco_metabolico VARCHAR(20),
  imc DECIMAL(4,2),
  circunferencia_abdominal_cm DECIMAL(5,2),
  circunferencia_braco_cm DECIMAL(4,2),
  circunferencia_perna_cm DECIMAL(4,2),
  device_type VARCHAR(50) DEFAULT 'manual',
  notes TEXT,
  measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE METAS E OBJETIVOS
CREATE TABLE user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  peso_meta_kg DECIMAL(5,2),
  gordura_corporal_meta_percent DECIMAL(4,2),
  imc_meta DECIMAL(4,2),
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE ANÁLISES SEMANAIS
CREATE TABLE weekly_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  semana_inicio DATE NOT NULL,
  semana_fim DATE NOT NULL,
  peso_inicial DECIMAL(5,2),
  peso_final DECIMAL(5,2),
  variacao_peso DECIMAL(5,2),
  variacao_gordura_corporal DECIMAL(4,2),
  variacao_massa_muscular DECIMAL(5,2),
  media_imc DECIMAL(4,2),
  tendencia VARCHAR(20),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, semana_inicio)
);

-- 5. FUNÇÃO PARA CALCULAR IMC AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION calculate_imc()
RETURNS TRIGGER AS $$
DECLARE
  user_altura DECIMAL(5,2);
BEGIN
  -- Buscar altura do usuário
  SELECT altura_cm INTO user_altura 
  FROM user_physical_data 
  WHERE user_id = NEW.user_id;
  
  -- Se não encontrou altura, não calcula IMC
  IF user_altura IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calcular IMC: peso / (altura/100)²
  NEW.imc = NEW.peso_kg / POWER(user_altura / 100, 2);
  
  -- Calcular risco metabólico baseado no IMC
  IF NEW.imc < 18.5 THEN
    NEW.risco_metabolico = 'baixo_peso';
  ELSIF NEW.imc >= 18.5 AND NEW.imc < 25 THEN
    NEW.risco_metabolico = 'normal';
  ELSIF NEW.imc >= 25 AND NEW.imc < 30 THEN
    NEW.risco_metabolico = 'sobrepeso';
  ELSIF NEW.imc >= 30 AND NEW.imc < 35 THEN
    NEW.risco_metabolico = 'obesidade_grau1';
  ELSIF NEW.imc >= 35 AND NEW.imc < 40 THEN
    NEW.risco_metabolico = 'obesidade_grau2';
  ELSE
    NEW.risco_metabolico = 'obesidade_grau3';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER PARA CALCULAR IMC AUTOMATICAMENTE
CREATE TRIGGER trigger_calculate_imc
  BEFORE INSERT OR UPDATE ON weight_measurements
  FOR EACH ROW
  EXECUTE FUNCTION calculate_imc();

-- 7. FUNÇÃO PARA GERAR ANÁLISES SEMANAIS
CREATE OR REPLACE FUNCTION generate_weekly_analysis()
RETURNS TRIGGER AS $$
DECLARE
  week_start DATE;
  week_end DATE;
  first_measurement RECORD;
  last_measurement RECORD;
  avg_measurement RECORD;
BEGIN
  -- Calcular início e fim da semana
  week_start = DATE_TRUNC('week', NEW.measurement_date::DATE);
  week_end = week_start + INTERVAL '6 days';
  
  -- Verificar se já existe análise para esta semana
  IF EXISTS (
    SELECT 1 FROM weekly_analyses 
    WHERE user_id = NEW.user_id 
    AND semana_inicio = week_start
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Buscar primeira medição da semana
  SELECT * INTO first_measurement
  FROM weight_measurements
  WHERE user_id = NEW.user_id
  AND measurement_date::DATE >= week_start
  AND measurement_date::DATE <= week_end
  ORDER BY measurement_date ASC
  LIMIT 1;
  
  -- Buscar última medição da semana
  SELECT * INTO last_measurement
  FROM weight_measurements
  WHERE user_id = NEW.user_id
  AND measurement_date::DATE >= week_start
  AND measurement_date::DATE <= week_end
  ORDER BY measurement_date DESC
  LIMIT 1;
  
  -- Calcular médias da semana
  SELECT 
    AVG(peso_kg) as peso_medio,
    AVG(gordura_corporal_percent) as gordura_media,
    AVG(massa_muscular_kg) as massa_media,
    AVG(imc) as imc_medio
  INTO avg_measurement
  FROM weight_measurements
  WHERE user_id = NEW.user_id
  AND measurement_date::DATE >= week_start
  AND measurement_date::DATE <= week_end;
  
  -- Inserir análise semanal
  INSERT INTO weekly_analyses (
    user_id,
    semana_inicio,
    semana_fim,
    peso_inicial,
    peso_final,
    variacao_peso,
    variacao_gordura_corporal,
    variacao_massa_muscular,
    media_imc,
    tendencia
  ) VALUES (
    NEW.user_id,
    week_start,
    week_end,
    first_measurement.peso_kg,
    last_measurement.peso_kg,
    last_measurement.peso_kg - first_measurement.peso_kg,
    last_measurement.gordura_corporal_percent - first_measurement.gordura_corporal_percent,
    last_measurement.massa_muscular_kg - first_measurement.massa_muscular_kg,
    avg_measurement.imc_medio,
    CASE 
      WHEN last_measurement.peso_kg > first_measurement.peso_kg THEN 'aumento'
      WHEN last_measurement.peso_kg < first_measurement.peso_kg THEN 'diminuicao'
      ELSE 'estavel'
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER PARA GERAR ANÁLISES SEMANAIS
CREATE TRIGGER trigger_weekly_analysis
  AFTER INSERT ON weight_measurements
  FOR EACH ROW
  EXECUTE FUNCTION generate_weekly_analysis();

-- 9. TRIGGER PARA UPDATED_AT
-- 8. FUNÇÃO PARA UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGER PARA UPDATED_AT
CREATE TRIGGER update_user_physical_data_updated_at
  BEFORE UPDATE ON user_physical_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE user_physical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_analyses ENABLE ROW LEVEL SECURITY;

-- 11. POLÍTICAS DE SEGURANÇA PARA user_physical_data
CREATE POLICY "Users can view own physical data" ON user_physical_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own physical data" ON user_physical_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own physical data" ON user_physical_data
  FOR UPDATE USING (auth.uid() = user_id);

-- 12. POLÍTICAS DE SEGURANÇA PARA weight_measurements
CREATE POLICY "Users can view own weight measurements" ON weight_measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight measurements" ON weight_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight measurements" ON weight_measurements
  FOR UPDATE USING (auth.uid() = user_id);

-- 13. POLÍTICAS DE SEGURANÇA PARA user_goals
CREATE POLICY "Users can view own goals" ON user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- 14. POLÍTICAS DE SEGURANÇA PARA weekly_analyses
CREATE POLICY "Users can view own weekly analyses" ON weekly_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly analyses" ON weekly_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly analyses" ON weekly_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- 15. ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_weight_measurements_user_date ON weight_measurements(user_id, measurement_date DESC);
CREATE INDEX idx_weekly_analyses_user_week ON weekly_analyses(user_id, semana_inicio DESC);
CREATE INDEX idx_user_goals_user_status ON user_goals(user_id, status);
CREATE INDEX idx_user_physical_data_user ON user_physical_data(user_id);