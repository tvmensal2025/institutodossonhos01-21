-- Criar tabela para armazenar avaliações das rodas
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_type ON user_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_user_assessments_completed_at ON user_assessments(completed_at);

-- Política RLS para permitir que usuários vejam apenas suas próprias avaliações
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessments" ON user_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments" ON user_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" ON user_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_assessments_updated_at
  BEFORE UPDATE ON user_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 