-- Migração para Sistema de Sabotadores Customizados e Sessões
-- Data: 2025-01-25

-- Tabela para sabotadores customizados
CREATE TABLE IF NOT EXISTS custom_saboteurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  characteristics TEXT[],
  impact TEXT,
  strategies TEXT[],
  questions TEXT[], -- Campo para perguntas do teste
  color VARCHAR(20) DEFAULT 'text-gray-600',
  icon VARCHAR(50) DEFAULT 'Settings',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Tabela para relacionar usuários com sabotadores customizados
CREATE TABLE IF NOT EXISTS user_custom_saboteurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  saboteur_id UUID REFERENCES custom_saboteurs(id),
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões criadas pelos admins
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'saboteur_work', 'coaching', 'assessment', 'reflection'
  content JSONB NOT NULL, -- Estrutura flexível do conteúdo
  target_saboteurs TEXT[], -- Sabotadores relacionados
  questions TEXT[], -- Campo para perguntas da sessão
  difficulty VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
  estimated_time INTEGER, -- minutos
  materials_needed TEXT[],
  follow_up_questions TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Tabela de sessões atribuídas aos usuários
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'assigned', -- assigned, in_progress, completed, skipped
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0, -- 0-100
  feedback JSONB, -- Respostas do usuário
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS para custom_saboteurs
ALTER TABLE custom_saboteurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage custom saboteurs" ON custom_saboteurs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can view active custom saboteurs" ON custom_saboteurs
  FOR SELECT USING (is_active = true);

-- Políticas RLS para user_custom_saboteurs
ALTER TABLE user_custom_saboteurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom saboteur scores" ON user_custom_saboteurs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom saboteur scores" ON user_custom_saboteurs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom saboteur scores" ON user_custom_saboteurs
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sessions" ON sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can view active sessions" ON sessions
  FOR SELECT USING (is_active = true);

-- Políticas RLS para user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user sessions" ON user_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_custom_saboteurs_created_by ON custom_saboteurs(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_saboteurs_active ON custom_saboteurs(is_active);
CREATE INDEX IF NOT EXISTS idx_user_custom_saboteurs_user_id ON user_custom_saboteurs(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_custom_saboteurs_updated_at 
  BEFORE UPDATE ON custom_saboteurs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at 
  BEFORE UPDATE ON sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at 
  BEFORE UPDATE ON user_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE custom_saboteurs IS 'Sabotadores customizados criados pelos administradores';
COMMENT ON TABLE user_custom_saboteurs IS 'Relacionamento entre usuários e sabotadores customizados';
COMMENT ON TABLE sessions IS 'Sessões personalizadas criadas pelos administradores';
COMMENT ON TABLE user_sessions IS 'Sessões atribuídas aos usuários';

COMMENT ON COLUMN custom_saboteurs.characteristics IS 'Array de características do sabotador';
COMMENT ON COLUMN custom_saboteurs.strategies IS 'Array de estratégias para superar o sabotador';
COMMENT ON COLUMN custom_saboteurs.color IS 'Classe CSS para cor do sabotador';
COMMENT ON COLUMN custom_saboteurs.icon IS 'Nome do ícone do sabotador';

COMMENT ON COLUMN sessions.content IS 'Estrutura JSON com seções e atividades da sessão';
COMMENT ON COLUMN sessions.target_saboteurs IS 'Array de IDs dos sabotadores relacionados';
COMMENT ON COLUMN sessions.materials_needed IS 'Array de materiais necessários para a sessão';
COMMENT ON COLUMN sessions.follow_up_questions IS 'Array de perguntas de acompanhamento';

COMMENT ON COLUMN user_sessions.status IS 'Status da sessão: assigned, in_progress, completed, skipped';
COMMENT ON COLUMN user_sessions.progress IS 'Progresso da sessão (0-100)';
COMMENT ON COLUMN user_sessions.feedback IS 'JSON com feedback do usuário sobre a sessão'; 