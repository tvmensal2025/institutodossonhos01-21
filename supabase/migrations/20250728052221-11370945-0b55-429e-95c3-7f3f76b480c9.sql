-- =====================================================
-- SISTEMA COMPLETO DE GERENCIAMENTO DE SESSÕES
-- =====================================================

-- 1. Atualizar tabela user_sessions com novos campos
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS auto_save_data JSONB DEFAULT '{}';
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS cycle_number INTEGER DEFAULT 1;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS next_available_date DATE;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 2. Criar tabela para tracking de ciclos
CREATE TABLE IF NOT EXISTS session_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  cycle_number INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  next_cycle_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, session_id, cycle_number)
);

-- RLS para session_cycles
ALTER TABLE session_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cycles" ON session_cycles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Criar tabela para requisições de liberação antecipada
CREATE TABLE IF NOT EXISTS early_release_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  cycle_number INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para early_release_requests
ALTER TABLE early_release_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own requests" ON early_release_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own requests" ON early_release_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all requests" ON early_release_requests
  FOR ALL
  TO authenticated
  USING (is_admin_user());

-- 4. Função para salvar progresso automaticamente
CREATE OR REPLACE FUNCTION auto_save_session_progress(
  p_user_id UUID,
  p_session_id TEXT,
  p_progress_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions 
  SET 
    auto_save_data = p_progress_data,
    last_activity = NOW()
  WHERE user_id = p_user_id 
    AND session_id = p_session_id;
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para completar sessão e iniciar próximo ciclo
CREATE OR REPLACE FUNCTION complete_session_cycle(
  p_user_id UUID,
  p_session_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_current_cycle INTEGER;
  v_next_date DATE;
  v_result JSONB;
BEGIN
  -- Buscar ciclo atual
  SELECT cycle_number INTO v_current_cycle
  FROM user_sessions
  WHERE user_id = p_user_id AND session_id = p_session_id;
  
  -- Calcular próxima data (30 dias)
  v_next_date := CURRENT_DATE + INTERVAL '30 days';
  
  -- Atualizar sessão atual como completa e bloqueada
  UPDATE user_sessions 
  SET 
    status = 'completed',
    progress = 100,
    completed_at = NOW(),
    is_locked = TRUE,
    next_available_date = v_next_date
  WHERE user_id = p_user_id AND session_id = p_session_id;
  
  -- Registrar ciclo completado
  INSERT INTO session_cycles (
    user_id, session_id, cycle_number, 
    completed_at, next_cycle_date, is_active
  ) VALUES (
    p_user_id, p_session_id, v_current_cycle,
    NOW(), v_next_date, FALSE
  ) ON CONFLICT (user_id, session_id, cycle_number) 
  DO UPDATE SET 
    completed_at = NOW(),
    next_cycle_date = v_next_date,
    is_active = FALSE;
  
  -- Criar próximo ciclo (mas bloqueado até a data)
  INSERT INTO user_sessions (
    user_id, session_id, status, assigned_at,
    progress, due_date, cycle_number, 
    next_available_date, is_locked
  ) VALUES (
    p_user_id, p_session_id, 'locked', NOW(),
    0, v_next_date, v_current_cycle + 1,
    v_next_date, TRUE
  ) ON CONFLICT (user_id, session_id) DO NOTHING;
  
  v_result := jsonb_build_object(
    'cycle_completed', v_current_cycle,
    'next_cycle', v_current_cycle + 1,
    'next_available_date', v_next_date,
    'status', 'success'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para liberar sessão antecipadamente (admin)
CREATE OR REPLACE FUNCTION release_session_early(
  p_user_id UUID,
  p_session_id TEXT,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se é admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Apenas administradores podem liberar sessões antecipadamente';
  END IF;
  
  -- Liberar sessão
  UPDATE user_sessions 
  SET 
    status = 'pending',
    is_locked = FALSE,
    next_available_date = CURRENT_DATE
  WHERE user_id = p_user_id 
    AND session_id = p_session_id
    AND is_locked = TRUE;
  
  -- Atualizar requisição se existir
  UPDATE early_release_requests
  SET 
    status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    admin_notes = p_notes
  WHERE user_id = p_user_id 
    AND session_id = p_session_id 
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para verificar e liberar sessões por data
CREATE OR REPLACE FUNCTION check_and_release_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_released_count INTEGER := 0;
BEGIN
  -- Liberar sessões que chegaram na data
  UPDATE user_sessions 
  SET 
    status = 'pending',
    is_locked = FALSE
  WHERE is_locked = TRUE 
    AND next_available_date <= CURRENT_DATE;
    
  GET DIAGNOSTICS v_released_count = ROW_COUNT;
  
  RETURN v_released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar trigger para auto-save
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_session_activity ON user_sessions;
CREATE TRIGGER trigger_session_activity
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- 9. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_activity ON user_sessions(user_id, last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_cycles ON user_sessions(user_id, cycle_number);
CREATE INDEX IF NOT EXISTS idx_user_sessions_locked ON user_sessions(is_locked, next_available_date);
CREATE INDEX IF NOT EXISTS idx_session_cycles_active ON session_cycles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_early_requests_status ON early_release_requests(status, requested_at);

-- 10. Comentários das funções
COMMENT ON FUNCTION auto_save_session_progress(UUID, TEXT, JSONB) IS 'Salva progresso da sessão automaticamente';
COMMENT ON FUNCTION complete_session_cycle(UUID, TEXT) IS 'Completa ciclo atual e programa próximo em 30 dias';
COMMENT ON FUNCTION release_session_early(UUID, TEXT, UUID, TEXT) IS 'Libera sessão antecipadamente (apenas admin)';
COMMENT ON FUNCTION check_and_release_sessions() IS 'Verifica e libera sessões que chegaram na data programada';

-- =====================================================
-- FIM DA MIGRAÇÃO DO SISTEMA DE SESSÕES
-- =====================================================