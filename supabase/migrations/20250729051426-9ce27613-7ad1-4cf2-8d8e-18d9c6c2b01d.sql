-- AUDITORIA COMPLETA - TABELAS ESSENCIAIS PARA MERCADO
-- Migração para criar todas as tabelas faltantes críticas

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

-- 3. TABELA DE ASSINATURAS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'suspended')),
  current_period_start DATE,
  current_period_end DATE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start DATE,
  trial_end DATE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. TABELA DE MISSÕES DO USUÁRIO
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 100,
  points_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE ANÁLISES SEMANAIS
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

-- 6. TABELA DE WATER TRACKING
CREATE TABLE IF NOT EXISTS water_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE DOCUMENTOS DO USUÁRIO
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

-- 8. TABELA DE ENDEREÇOS
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

-- 9. TABELA DE COMENTÁRIOS NOS POSTS
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES health_feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES post_comments(id),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABELA DE CURTIDAS NOS POSTS
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES health_feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE user_physical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PARA user_physical_data
CREATE POLICY "Users can view their own physical data" ON user_physical_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own physical data" ON user_physical_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own physical data" ON user_physical_data
  FOR UPDATE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA weight_measurements
CREATE POLICY "Users can view their own weight data" ON weight_measurements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own weight data" ON weight_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weight data" ON weight_measurements
  FOR UPDATE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA user_missions
CREATE POLICY "Users can view their own missions" ON user_missions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own missions" ON user_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own missions" ON user_missions
  FOR UPDATE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA weekly_analyses
CREATE POLICY "Users can view their own analyses" ON weekly_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own analyses" ON weekly_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analyses" ON weekly_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA water_tracking
CREATE POLICY "Users can view their own water data" ON water_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own water data" ON water_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS RLS PARA user_documents
CREATE POLICY "Users can view their own documents" ON user_documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON user_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON user_documents
  FOR UPDATE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA user_addresses
CREATE POLICY "Users can view their own addresses" ON user_addresses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own addresses" ON user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA post_comments
CREATE POLICY "Users can view public comments" ON post_comments
  FOR SELECT USING (true);
CREATE POLICY "Users can create their own comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON post_comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA post_likes
CREATE POLICY "Users can view public likes" ON post_likes
  FOR SELECT USING (true);
CREATE POLICY "Users can create their own likes" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_date ON weight_measurements(user_id, measurement_date);
CREATE INDEX IF NOT EXISTS idx_user_physical_data_user ON user_physical_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_status ON user_missions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_weekly_analyses_user_week ON weekly_analyses(user_id, semana_inicio);
CREATE INDEX IF NOT EXISTS idx_water_tracking_user_date ON water_tracking(user_id, DATE(recorded_at));
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);

-- TRIGGERS PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_physical_data_updated_at
  BEFORE UPDATE ON user_physical_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_missions_updated_at
  BEFORE UPDATE ON user_missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_documents_updated_at
  BEFORE UPDATE ON user_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- TRIGGER PARA CALCULAR IMC AUTOMATICAMENTE
CREATE TRIGGER trigger_calculate_imc
  BEFORE INSERT OR UPDATE ON weight_measurements
  FOR EACH ROW EXECUTE FUNCTION calculate_imc();

-- TRIGGER PARA GERAR ANÁLISE SEMANAL AUTOMATICAMENTE
CREATE TRIGGER trigger_generate_weekly_analysis
  AFTER INSERT ON weight_measurements
  FOR EACH ROW EXECUTE FUNCTION generate_weekly_analysis();

SELECT 'Auditoria completa: Todas as tabelas essenciais para mercado foram criadas!' as status;