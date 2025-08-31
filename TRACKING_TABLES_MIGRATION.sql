-- =====================================================
-- MIGRAÇÃO: TABELAS DE TRACKING DE ÁGUA E SONO
-- =====================================================

-- Tabela para tracking de água
CREATE TABLE IF NOT EXISTS water_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Tabela para tracking de sono
CREATE TABLE IF NOT EXISTS sleep_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(3,1),
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Tabela para tracking de humor/energia
CREATE TABLE IF NOT EXISTS mood_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  day_rating INTEGER CHECK (day_rating >= 1 AND day_rating <= 5),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Políticas para water_tracking
ALTER TABLE water_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own water tracking" ON water_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water tracking" ON water_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water tracking" ON water_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water tracking" ON water_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para sleep_tracking
ALTER TABLE sleep_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sleep tracking" ON sleep_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep tracking" ON sleep_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep tracking" ON sleep_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep tracking" ON sleep_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para mood_tracking
ALTER TABLE mood_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mood tracking" ON mood_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood tracking" ON mood_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood tracking" ON mood_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood tracking" ON mood_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_water_tracking_user_date ON water_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_tracking_user_date ON sleep_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_date ON mood_tracking(user_id, date);

-- =====================================================
-- FUNÇÕES PARA ATUALIZAR TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_water_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_sleep_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_mood_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA ATUALIZAR TIMESTAMP
-- =====================================================

CREATE TRIGGER trigger_update_water_tracking_updated_at
  BEFORE UPDATE ON water_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_water_tracking_updated_at();

CREATE TRIGGER trigger_update_sleep_tracking_updated_at
  BEFORE UPDATE ON sleep_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_sleep_tracking_updated_at();

CREATE TRIGGER trigger_update_mood_tracking_updated_at
  BEFORE UPDATE ON mood_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_mood_tracking_updated_at();

-- =====================================================
-- FUNÇÃO PARA CALCULAR ESTATÍSTICAS SEMANAIS
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_weekly_tracking_stats(user_uuid UUID, week_start DATE)
RETURNS TABLE (
  avg_water_ml DECIMAL(10,2),
  avg_sleep_hours DECIMAL(3,1),
  avg_sleep_quality DECIMAL(3,1),
  avg_energy DECIMAL(3,1),
  avg_stress DECIMAL(3,1),
  avg_day_rating DECIMAL(3,1)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    AVG(wt.amount_ml)::DECIMAL(10,2) as avg_water_ml,
    AVG(st.hours)::DECIMAL(3,1) as avg_sleep_hours,
    AVG(st.quality)::DECIMAL(3,1) as avg_sleep_quality,
    AVG(mt.energy_level)::DECIMAL(3,1) as avg_energy,
    AVG(mt.stress_level)::DECIMAL(3,1) as avg_stress,
    AVG(mt.day_rating)::DECIMAL(3,1) as avg_day_rating
  FROM generate_series(week_start, week_start + 6, '1 day'::interval)::date as day_date
  LEFT JOIN water_tracking wt ON wt.user_id = user_uuid AND wt.date = day_date
  LEFT JOIN sleep_tracking st ON st.user_id = user_uuid AND st.date = day_date
  LEFT JOIN mood_tracking mt ON mt.user_id = user_uuid AND mt.date = day_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE water_tracking IS 'Tabela para rastreamento de consumo de água diário';
COMMENT ON TABLE sleep_tracking IS 'Tabela para rastreamento de sono diário';
COMMENT ON TABLE mood_tracking IS 'Tabela para rastreamento de humor e energia diário';

COMMENT ON COLUMN water_tracking.amount_ml IS 'Quantidade de água em mililitros';
COMMENT ON COLUMN sleep_tracking.hours IS 'Horas de sono';
COMMENT ON COLUMN sleep_tracking.quality IS 'Qualidade do sono (1-5)';
COMMENT ON COLUMN mood_tracking.energy_level IS 'Nível de energia (1-5)';
COMMENT ON COLUMN mood_tracking.stress_level IS 'Nível de estresse (1-5)';
COMMENT ON COLUMN mood_tracking.day_rating IS 'Avaliação do dia (1-5)';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- ===================================================== 