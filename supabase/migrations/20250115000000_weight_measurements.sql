-- Tabela para armazenar medições de peso e circunferência
-- Unificar schema de weight_measurements (idempotente; garantir colunas superset)
CREATE TABLE IF NOT EXISTS weight_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    peso_kg DECIMAL(5,2) NOT NULL,
    circunferencia_abdominal_cm DECIMAL(5,2) NOT NULL,
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    measurement_time TIME DEFAULT CURRENT_TIME,
    measurement_type TEXT CHECK (measurement_type IN ('balanca', 'manual')) DEFAULT 'manual',
    
    -- Dados calculados automaticamente
    imc DECIMAL(4,2),
    rce DECIMAL(4,3), -- Relação Cintura-Estatura
    
    -- Dados de bioimpedância (opcionais, só quando usar balança)
    gordura_corporal_percent DECIMAL(4,1),
    massa_muscular_kg DECIMAL(5,2),
    massa_magra_kg DECIMAL(5,2),
    agua_corporal_percent DECIMAL(4,2),
    agua_corporal_litros DECIMAL(4,1),
    massa_ossea_kg DECIMAL(4,2),
    metabolismo_basal_kcal INTEGER,
    idade_metabolica INTEGER,
    
    -- Dados de análise de risco
    risco_cardiometabolico TEXT CHECK (risco_cardiometabolico IN ('BAIXO', 'MODERADO', 'ALTO')),
    classificacao_imc TEXT,
    
    -- Observações
    observacoes TEXT,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para perfis de usuários com dados físicos
CREATE TABLE IF NOT EXISTS user_physical_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    height_cm INTEGER NOT NULL,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('M', 'F')) NOT NULL,
    activity_level TEXT CHECK (activity_level IN ('sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso')) DEFAULT 'sedentario',
    
    -- Objetivos
    objetivo TEXT CHECK (objetivo IN ('perder_peso', 'ganhar_massa', 'manter_peso', 'melhorar_saude')),
    peso_objetivo_kg DECIMAL(5,2),
    
    -- Dados médicos relevantes
    historico_medico TEXT[],
    medicamentos TEXT[],
    alergias TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para calcular IMC automaticamente
CREATE OR REPLACE FUNCTION calculate_imc()
RETURNS TRIGGER AS $$
DECLARE
    user_height INTEGER;
BEGIN
    -- Busca a altura do usuário
    SELECT height_cm INTO user_height 
    FROM user_physical_profiles 
    WHERE user_id = NEW.user_id;
    
    IF user_height IS NOT NULL THEN
        -- Calcula IMC
        NEW.imc := NEW.peso_kg / POWER(user_height / 100.0, 2);
        
        -- Calcula RCE (Relação Cintura-Estatura)
        NEW.rce := NEW.circunferencia_abdominal_cm / user_height::DECIMAL;
        
        -- Determina risco cardiometabólico baseado no RCE
        IF NEW.rce >= 0.6 THEN
            NEW.risco_cardiometabolico := 'ALTO';
        ELSIF NEW.rce >= 0.5 THEN
            NEW.risco_cardiometabolico := 'MODERADO';
        ELSE
            NEW.risco_cardiometabolico := 'BAIXO';
        END IF;
        
        -- Classifica IMC
        IF NEW.imc < 18.5 THEN
            NEW.classificacao_imc := 'Abaixo do peso';
        ELSIF NEW.imc < 25 THEN
            NEW.classificacao_imc := 'Peso normal';
        ELSIF NEW.imc < 30 THEN
            NEW.classificacao_imc := 'Sobrepeso';
        ELSIF NEW.imc < 35 THEN
            NEW.classificacao_imc := 'Obesidade grau I';
        ELSIF NEW.imc < 40 THEN
            NEW.classificacao_imc := 'Obesidade grau II';
        ELSE
            NEW.classificacao_imc := 'Obesidade grau III';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automaticamente
CREATE TRIGGER calculate_imc_trigger
    BEFORE INSERT OR UPDATE ON weight_measurements
    FOR EACH ROW
    EXECUTE FUNCTION calculate_imc();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_weight_measurements_updated_at
    BEFORE UPDATE ON weight_measurements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_physical_profiles_updated_at
    BEFORE UPDATE ON user_physical_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_weight_measurements_user_id ON weight_measurements(user_id);
CREATE INDEX idx_weight_measurements_date ON weight_measurements(measurement_date DESC);
CREATE INDEX idx_user_physical_profiles_user_id ON user_physical_profiles(user_id);

-- RLS (Row Level Security)
ALTER TABLE weight_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_physical_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view own measurements" ON weight_measurements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements" ON weight_measurements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements" ON weight_measurements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements" ON weight_measurements
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON user_physical_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_physical_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_physical_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Inserir dados de exemplo (remover em produção)
-- DESABILITADO para evitar FK inválida em ambientes sem usuários
-- INSERT INTO user_physical_profiles (user_id, height_cm, birth_date, gender, objetivo) VALUES
-- (gen_random_uuid(), 179, '1973-09-20', 'M', 'perder_peso'),
-- (gen_random_uuid(), 165, '1985-03-15', 'F', 'manter_peso'),
-- (gen_random_uuid(), 175, '1978-11-08', 'M', 'ganhar_massa');