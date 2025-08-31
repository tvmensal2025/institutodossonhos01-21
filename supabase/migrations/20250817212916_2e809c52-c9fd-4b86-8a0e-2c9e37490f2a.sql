-- ========================================
-- MIGRAÇÃO CORRIGIDA - TABELAS ESSENCIAIS
-- ========================================

-- ========================================
-- TABELAS DE COMPONENTES E RECEITAS
-- ========================================

-- Componentes de receitas
CREATE TABLE IF NOT EXISTS receita_componentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID,
  ingrediente_id UUID,
  quantidade DECIMAL(10,3),
  unidade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itens de receitas
CREATE TABLE IF NOT EXISTS recipe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL(10,3),
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receitas modelo
CREATE TABLE IF NOT EXISTS receitas_modelo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  ingredientes JSONB DEFAULT '[]',
  instrucoes TEXT,
  tempo_preparo INTEGER,
  porcoes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receitas base
CREATE TABLE IF NOT EXISTS receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alimentos base
CREATE TABLE IF NOT EXISTS alimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  subcategoria TEXT,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELAS DE USUÁRIO E TRACKING (CORRIGIDAS)
-- ========================================

-- Pesagem dos usuários (COLUNA CORRIGIDA)
CREATE TABLE IF NOT EXISTS weighings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  peso_kg DECIMAL(5,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE, -- CORRIGIDO: usar 'date' ao invés de 'data_pesagem'
  massa_muscular_kg DECIMAL(5,2),
  massa_gorda_kg DECIMAL(5,2),
  massa_ossea_kg DECIMAL(5,2),
  agua_corporal_percent DECIMAL(4,2),
  taxa_metabolica_basal INTEGER,
  circunferencia_abdominal_cm DECIMAL(5,2),
  idade_metabolica INTEGER,
  imc DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  responses JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'started',
  session_type TEXT,
  duration_minutes INTEGER,
  notes TEXT,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dados físicos do usuário
CREATE TABLE IF NOT EXISTS user_physical_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  altura_cm DECIMAL(5,2),
  peso_kg DECIMAL(5,2),
  idade INTEGER,
  sexo VARCHAR(10),
  nivel_atividade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progresso do usuário
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  current_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pontos do usuário
CREATE TABLE IF NOT EXISTS user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  source TEXT,
  reason TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conquistas do usuário
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_name TEXT NOT NULL,
  achievement_type TEXT,
  points_earned INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  badge_icon TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELAS DE ASSESSMENTS
-- ========================================

-- Assessments do usuário (DA VERSÃO 76)
CREATE TABLE IF NOT EXISTS user_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('abundance', 'competency', 'health', 'life')),
  scores JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  areas JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELAS SOFIA
-- ========================================

-- Conversas da Sofia
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  messages JSONB DEFAULT '[]',
  conversation_type TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mensagens das conversas
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CRIAR ÍNDICES BÁSICOS
-- ========================================

CREATE INDEX IF NOT EXISTS idx_weighings_user_date ON weighings(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_type ON user_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id);

SELECT 'MIGRAÇÃO CORRIGIDA CONCLUÍDA - TABELAS ESSENCIAIS CRIADAS!' as status;