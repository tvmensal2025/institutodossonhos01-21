-- AUDITORIA PARTE 2 - CORRIGIR TABELAS E POLÍTICAS EXISTENTES
-- Criar apenas as tabelas que ainda não existem

-- 1. TABELA DE DADOS FÍSICOS (ESSENCIAL PARA IMC)
CREATE TABLE IF NOT EXISTS user_physical_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  altura_cm DECIMAL(5,2),
  idade INTEGER,
  sexo TEXT CHECK (sexo IN ('Masculino', 'Feminino')),
  nivel_atividade TEXT CHECK (nivel_atividade IN ('Sedentário', 'Leve', 'Moderado', 'Intenso')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. TABELA DE MEDIÇÕES DE PESO (ESSENCIAL PARA IMC)
CREATE TABLE IF NOT EXISTS weight_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  peso_kg DECIMAL(5,2) NOT NULL,
  imc DECIMAL(4,2),
  gordura_corporal_percent DECIMAL(4,2),
  massa_muscular_kg DECIMAL(5,2),
  agua_corporal_percent DECIMAL(4,2),
  risco_metabolico TEXT,
  measurement_date DATE DEFAULT CURRENT_DATE,
  measurement_time TIME DEFAULT CURRENT_TIME,
  device_used TEXT DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE WATER TRACKING
CREATE TABLE IF NOT EXISTS water_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE DOCUMENTOS DO USUÁRIO
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf TEXT,
  rg TEXT,
  cnh TEXT,
  passport TEXT,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE ENDEREÇOS
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT DEFAULT 'residencial' CHECK (tipo IN ('residencial', 'comercial', 'entrega')),
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE ANÁLISES SEMANAIS
CREATE TABLE IF NOT EXISTS weekly_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  semana_inicio DATE NOT NULL,
  semana_fim DATE NOT NULL,
  peso_inicial DECIMAL(5,2),
  peso_final DECIMAL(5,2),
  variacao_peso DECIMAL(5,2),
  tendencia TEXT CHECK (tendencia IN ('aumentando', 'diminuindo', 'estavel')),
  imc_medio DECIMAL(4,2),
  meta_atingida BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, semana_inicio)
);

-- HABILITAR RLS APENAS NAS NOVAS TABELAS
ALTER TABLE user_physical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_analyses ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS APENAS PARA NOVAS TABELAS
-- user_physical_data
CREATE POLICY "Users can view their own physical data" ON user_physical_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own physical data" ON user_physical_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own physical data" ON user_physical_data
  FOR UPDATE USING (auth.uid() = user_id);

-- weight_measurements
CREATE POLICY "Users can view their own weight data" ON weight_measurements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own weight data" ON weight_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weight data" ON weight_measurements
  FOR UPDATE USING (auth.uid() = user_id);

-- water_tracking
CREATE POLICY "Users can view their own water data" ON water_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own water data" ON water_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_documents
CREATE POLICY "Users can view their own documents" ON user_documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON user_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON user_documents
  FOR UPDATE USING (auth.uid() = user_id);

-- user_addresses
CREATE POLICY "Users can view their own addresses" ON user_addresses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own addresses" ON user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- weekly_analyses
CREATE POLICY "Users can view their own analyses" ON weekly_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own analyses" ON weekly_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analyses" ON weekly_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_date ON weight_measurements(user_id, measurement_date);
CREATE INDEX IF NOT EXISTS idx_user_physical_data_user ON user_physical_data(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_analyses_user_week ON weekly_analyses(user_id, semana_inicio);
CREATE INDEX IF NOT EXISTS idx_water_tracking_user_date ON water_tracking(user_id, DATE(recorded_at));

-- TRIGGERS PARA updated_at (apenas se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_physical_data_updated_at') THEN
    CREATE TRIGGER update_user_physical_data_updated_at
      BEFORE UPDATE ON user_physical_data
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_documents_updated_at') THEN
    CREATE TRIGGER update_user_documents_updated_at
      BEFORE UPDATE ON user_documents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_addresses_updated_at') THEN
    CREATE TRIGGER update_user_addresses_updated_at
      BEFORE UPDATE ON user_addresses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- TRIGGERS ESPECÍFICOS PARA PESO (apenas se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_calculate_imc') THEN
    CREATE TRIGGER trigger_calculate_imc
      BEFORE INSERT OR UPDATE ON weight_measurements
      FOR EACH ROW EXECUTE FUNCTION calculate_imc();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_generate_weekly_analysis') THEN
    CREATE TRIGGER trigger_generate_weekly_analysis
      AFTER INSERT ON weight_measurements
      FOR EACH ROW EXECUTE FUNCTION generate_weekly_analysis();
  END IF;
END $$;

SELECT 'Tabelas essenciais criadas com sucesso para o mercado!' as status;