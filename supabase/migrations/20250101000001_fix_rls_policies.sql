-- Migration para corrigir RLS e políticas de segurança
-- Data: 2025-01-01

-- 1. VERIFICAR E CORRIGIR TABELA user_physical_data
DO $$ 
BEGIN
  -- Verificar se a tabela existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_physical_data') THEN
    -- Habilitar RLS se não estiver habilitado
    ALTER TABLE user_physical_data ENABLE ROW LEVEL SECURITY;
    
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Users can view own physical data" ON user_physical_data;
    DROP POLICY IF EXISTS "Users can insert own physical data" ON user_physical_data;
    DROP POLICY IF EXISTS "Users can update own physical data" ON user_physical_data;
    
    -- Criar novas políticas
    CREATE POLICY "Users can view own physical data" ON user_physical_data
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own physical data" ON user_physical_data
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own physical data" ON user_physical_data
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. VERIFICAR E CORRIGIR TABELA weight_measurements
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'weight_measurements') THEN
    ALTER TABLE weight_measurements ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own weight measurements" ON weight_measurements;
    DROP POLICY IF EXISTS "Users can insert own weight measurements" ON weight_measurements;
    DROP POLICY IF EXISTS "Users can update own weight measurements" ON weight_measurements;
    
    CREATE POLICY "Users can view own weight measurements" ON weight_measurements
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own weight measurements" ON weight_measurements
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own weight measurements" ON weight_measurements
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. VERIFICAR E CORRIGIR TABELA user_goals
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_goals') THEN
    ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
    DROP POLICY IF EXISTS "Users can insert own goals" ON user_goals;
    DROP POLICY IF EXISTS "Users can update own goals" ON user_goals;
    
    CREATE POLICY "Users can view own goals" ON user_goals
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own goals" ON user_goals
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own goals" ON user_goals
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. VERIFICAR E CORRIGIR TABELA weekly_analyses
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'weekly_analyses') THEN
    ALTER TABLE weekly_analyses ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own weekly analyses" ON weekly_analyses;
    DROP POLICY IF EXISTS "Users can insert own weekly analyses" ON weekly_analyses;
    DROP POLICY IF EXISTS "Users can update own weekly analyses" ON weekly_analyses;
    
    CREATE POLICY "Users can view own weekly analyses" ON weekly_analyses
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own weekly analyses" ON weekly_analyses
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own weekly analyses" ON weekly_analyses
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. VERIFICAR E CORRIGIR TABELA health_integrations (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'health_integrations') THEN
    ALTER TABLE health_integrations ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admins can manage integrations" ON health_integrations;
    
    CREATE POLICY "Admins can manage integrations" ON health_integrations
      FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' IS NULL);
  END IF;
END $$;

-- 6. VERIFICAR E CORRIGIR TABELA heart_rate_data (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'heart_rate_data') THEN
    ALTER TABLE heart_rate_data ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own heart rate data" ON heart_rate_data;
    DROP POLICY IF EXISTS "Users can insert own heart rate data" ON heart_rate_data;
    DROP POLICY IF EXISTS "Users can update own heart rate data" ON heart_rate_data;
    
    CREATE POLICY "Users can view own heart rate data" ON heart_rate_data
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own heart rate data" ON heart_rate_data
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own heart rate data" ON heart_rate_data
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. VERIFICAR E CORRIGIR TABELA exercise_sessions (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exercise_sessions') THEN
    ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own exercise sessions" ON exercise_sessions;
    DROP POLICY IF EXISTS "Users can insert own exercise sessions" ON exercise_sessions;
    DROP POLICY IF EXISTS "Users can update own exercise sessions" ON exercise_sessions;
    
    CREATE POLICY "Users can view own exercise sessions" ON exercise_sessions
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own exercise sessions" ON exercise_sessions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own exercise sessions" ON exercise_sessions
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 8. VERIFICAR E CORRIGIR TABELA device_sync_log (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_sync_log') THEN
    ALTER TABLE device_sync_log ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own sync logs" ON device_sync_log;
    DROP POLICY IF EXISTS "Users can insert own sync logs" ON device_sync_log;
    
    CREATE POLICY "Users can view own sync logs" ON device_sync_log
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own sync logs" ON device_sync_log
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 9. VERIFICAR E CORRIGIR TABELA profiles (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 10. CRIAR ÍNDICES SE NÃO EXISTIREM
CREATE INDEX IF NOT EXISTS idx_user_physical_data_user ON user_physical_data(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_date ON weight_measurements(user_id, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_analyses_user_week ON weekly_analyses(user_id, semana_inicio DESC);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_status ON user_goals(user_id, status);

-- 11. VERIFICAR SE A FUNÇÃO update_updated_at_column EXISTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. VERIFICAR SE OS TRIGGERS EXISTEM
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_physical_data') THEN
    DROP TRIGGER IF EXISTS update_user_physical_data_updated_at ON user_physical_data;
    CREATE TRIGGER update_user_physical_data_updated_at
      BEFORE UPDATE ON user_physical_data
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$; 