-- ========================================
-- INTEGRAÇÃO COMPLETA DA SOFIA
-- ========================================

-- 1. TABELA DE MENSAGENS DA SOFIA
CREATE TABLE IF NOT EXISTS sofia_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('chat', 'food_analysis', 'mission_update', 'goal_progress', 'challenge_update')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE RELATÓRIOS DO DR. VITAL
CREATE TABLE IF NOT EXISTS dr_vital_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  report_data JSONB NOT NULL,
  is_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE PROGRESSO DE METAS (se não existir)
CREATE TABLE IF NOT EXISTS goal_progress_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES user_goals(id) ON DELETE CASCADE,
  old_value DECIMAL(10,2),
  new_value DECIMAL(10,2),
  progress_percentage DECIMAL(5,2),
  points_earned INTEGER DEFAULT 0,
  sofia_message_id UUID REFERENCES sofia_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE ATUALIZAÇÕES DE DESAFIOS (se não existir)
CREATE TABLE IF NOT EXISTS challenge_update_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  old_progress DECIMAL(5,2),
  new_progress DECIMAL(5,2),
  daily_log JSONB,
  points_earned INTEGER DEFAULT 0,
  sofia_message_id UUID REFERENCES sofia_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE HISTÓRICO DE MISSÕES DO DIA (se não existir)
CREATE TABLE IF NOT EXISTS daily_mission_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES daily_mission_sessions(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  text_response TEXT,
  points_earned INTEGER DEFAULT 0,
  sofia_message_id UUID REFERENCES sofia_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE sofia_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dr_vital_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_update_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_mission_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para sofia_messages
CREATE POLICY "Users can view their own sofia messages" 
ON sofia_messages FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sofia messages" 
ON sofia_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas para dr_vital_reports
CREATE POLICY "Users can view their own reports" 
ON dr_vital_reports FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" 
ON dr_vital_reports FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas para goal_progress_logs
CREATE POLICY "Users can view their own goal progress" 
ON goal_progress_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal progress" 
ON goal_progress_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas para challenge_update_logs
CREATE POLICY "Users can view their own challenge updates" 
ON challenge_update_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenge updates" 
ON challenge_update_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas para daily_mission_logs
CREATE POLICY "Users can view their own mission logs" 
ON daily_mission_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mission logs" 
ON daily_mission_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para sofia_messages
CREATE INDEX IF NOT EXISTS idx_sofia_messages_user_id ON sofia_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_sofia_messages_type ON sofia_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_sofia_messages_created_at ON sofia_messages(created_at);

-- Índices para dr_vital_reports
CREATE INDEX IF NOT EXISTS idx_dr_vital_reports_user_id ON dr_vital_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_dr_vital_reports_type ON dr_vital_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_dr_vital_reports_reviewed ON dr_vital_reports(is_reviewed);

-- Índices para goal_progress_logs
CREATE INDEX IF NOT EXISTS idx_goal_progress_user_id ON goal_progress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress_logs(goal_id);

-- Índices para challenge_update_logs
CREATE INDEX IF NOT EXISTS idx_challenge_updates_user_id ON challenge_update_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_updates_challenge_id ON challenge_update_logs(challenge_id);

-- Índices para daily_mission_logs
CREATE INDEX IF NOT EXISTS idx_daily_mission_logs_user_id ON daily_mission_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_mission_logs_session_id ON daily_mission_logs(session_id);

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_sofia_messages_updated_at
  BEFORE UPDATE ON sofia_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dr_vital_reports_updated_at
  BEFORE UPDATE ON dr_vital_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- ========================================

-- Inserir algumas mensagens de exemplo da Sofia
INSERT INTO sofia_messages (user_id, message_type, content, metadata) VALUES
('00000000-0000-0000-0000-000000000000', 'chat', 'Oi! Como você está se sentindo hoje?', '{"context": "daily_check"}'),
('00000000-0000-0000-0000-000000000000', 'food_analysis', 'Analisei sua refeição e identifiquei alimentos nutritivos!', '{"foods": ["arroz", "frango"], "calories": 420}'),
('00000000-0000-0000-0000-000000000000', 'mission_update', 'Parabéns por completar a missão de hidratação!', '{"mission_id": "hidratacao", "points": 50}');

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

SELECT '✅ INTEGRAÇÃO SOFIA COMPLETA CRIADA!' as status;

-- Verificar tabelas criadas
SELECT 
  table_name,
  'Criada' as status
FROM information_schema.tables 
WHERE table_name IN (
  'sofia_messages',
  'dr_vital_reports', 
  'goal_progress_logs',
  'challenge_update_logs',
  'daily_mission_logs'
)
AND table_schema = 'public'; 