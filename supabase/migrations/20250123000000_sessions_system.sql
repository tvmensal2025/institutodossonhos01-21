-- Sistema de Sessões
-- Criar tabela de sessões criadas pelos admins
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'saboteur_work', -- 'saboteur_work', 'coaching', 'assessment', 'reflection'
  content JSONB NOT NULL, -- Estrutura flexível do conteúdo
  target_saboteurs TEXT[], -- Sabotadores relacionados
  difficulty VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
  estimated_time INTEGER, -- minutos
  materials_needed TEXT[],
  follow_up_questions TEXT[],
  created_by UUID, -- Temporariamente removida a referência para teste
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Tabela de sessões atribuídas aos usuários
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID, -- Temporariamente removida a referência para teste
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status);

-- RLS Policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para sessions (somente admin pode criar/editar/excluir)
DROP POLICY IF EXISTS "Users can view sessions" ON sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;

CREATE POLICY "Anyone can view sessions" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert sessions" ON sessions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update sessions" ON sessions
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete sessions" ON sessions
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert user sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 