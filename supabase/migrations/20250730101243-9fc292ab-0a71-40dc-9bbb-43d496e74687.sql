-- Adicionar colunas faltantes na tabela user_goals
ALTER TABLE user_goals 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category_id UUID,
ADD COLUMN IF NOT EXISTS challenge_id UUID,
ADD COLUMN IF NOT EXISTS target_value NUMERIC,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medio',
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estimated_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_points INTEGER;

-- Atualizar status padrão
ALTER TABLE user_goals ALTER COLUMN status SET DEFAULT 'pendente';

-- Adicionar coluna faltante na tabela course_modules
ALTER TABLE course_modules 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Criar tabela goal_categories se não existir
CREATE TABLE IF NOT EXISTS goal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO goal_categories (name, icon, color) VALUES
('Saúde', '🏥', '#10b981'),
('Exercício', '💪', '#3b82f6'),
('Alimentação', '🥗', '#f59e0b'),
('Bem-estar', '🧘', '#8b5cf6')
ON CONFLICT DO NOTHING;

-- Criar tabela challenges se não existir
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela goal_updates se não existir
CREATE TABLE IF NOT EXISTS goal_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES user_goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_value NUMERIC,
  new_value NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE goal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_updates ENABLE ROW LEVEL SECURITY;

-- Políticas para goal_categories
CREATE POLICY "Everyone can view goal categories" ON goal_categories
  FOR SELECT USING (true);

-- Políticas para challenges  
CREATE POLICY "Everyone can view challenges" ON challenges
  FOR SELECT USING (true);

-- Políticas para goal_updates
CREATE POLICY "Users can view their own goal updates" ON goal_updates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal updates" ON goal_updates
  FOR INSERT WITH CHECK (auth.uid() = user_id);