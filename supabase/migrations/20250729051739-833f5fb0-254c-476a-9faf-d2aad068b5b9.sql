-- MIGRAÇÃO FINAL - Corrigir tabelas essenciais para mercado
-- Criar tabelas sem índices problemáticos

-- Tabela de dados físicos (completa)
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

-- Tabela de medições de peso (completa)
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

-- Tabela de water tracking
CREATE TABLE IF NOT EXISTS water_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de análises semanais
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

-- Habilitar RLS
ALTER TABLE user_physical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_analyses ENABLE ROW LEVEL SECURITY;

-- Políticas simples para user_physical_data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_physical_data' AND policyname = 'Users can view their own physical data') THEN
    EXECUTE 'CREATE POLICY "Users can view their own physical data" ON user_physical_data FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_physical_data' AND policyname = 'Users can create their own physical data') THEN
    EXECUTE 'CREATE POLICY "Users can create their own physical data" ON user_physical_data FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_physical_data' AND policyname = 'Users can update their own physical data') THEN
    EXECUTE 'CREATE POLICY "Users can update their own physical data" ON user_physical_data FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Políticas simples para weight_measurements
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weight_measurements' AND policyname = 'Users can view their own weight data') THEN
    EXECUTE 'CREATE POLICY "Users can view their own weight data" ON weight_measurements FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weight_measurements' AND policyname = 'Users can create their own weight data') THEN
    EXECUTE 'CREATE POLICY "Users can create their own weight data" ON weight_measurements FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weight_measurements' AND policyname = 'Users can update their own weight data') THEN
    EXECUTE 'CREATE POLICY "Users can update their own weight data" ON weight_measurements FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Políticas simples para water_tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'water_tracking' AND policyname = 'Users can view their own water data') THEN
    EXECUTE 'CREATE POLICY "Users can view their own water data" ON water_tracking FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'water_tracking' AND policyname = 'Users can create their own water data') THEN
    EXECUTE 'CREATE POLICY "Users can create their own water data" ON water_tracking FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- Políticas simples para weekly_analyses
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_analyses' AND policyname = 'Users can view their own analyses') THEN
    EXECUTE 'CREATE POLICY "Users can view their own analyses" ON weekly_analyses FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_analyses' AND policyname = 'Users can create their own analyses') THEN
    EXECUTE 'CREATE POLICY "Users can create their own analyses" ON weekly_analyses FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_analyses' AND policyname = 'Users can update their own analyses') THEN
    EXECUTE 'CREATE POLICY "Users can update their own analyses" ON weekly_analyses FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Índices simples para performance
CREATE INDEX IF NOT EXISTS idx_weight_user_date ON weight_measurements(user_id, measurement_date);
CREATE INDEX IF NOT EXISTS idx_physical_user ON user_physical_data(user_id);
CREATE INDEX IF NOT EXISTS idx_water_user ON water_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user ON weekly_analyses(user_id);

SELECT 'Tabelas essenciais para mercado criadas com sucesso!' as status;