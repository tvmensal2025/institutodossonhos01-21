-- Migração para Sistema de Avaliações de Sabotadores
-- Data: 2025-07-25

-- Tabela para avaliações de sabotadores (sessões de teste)
CREATE TABLE IF NOT EXISTS saboteur_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title VARCHAR(100) DEFAULT 'Avaliação de Sabotadores',
  description TEXT,
  total_questions INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completion_time INTEGER, -- tempo em segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para respostas individuais das avaliações
CREATE TABLE IF NOT EXISTS saboteur_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES saboteur_assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  saboteur_id TEXT NOT NULL,
  saboteur_name TEXT NOT NULL,
  answer INTEGER NOT NULL, -- 1-5 (escala Likert)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para resultados agregados por sabotador
CREATE TABLE IF NOT EXISTS saboteur_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES saboteur_assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  saboteur_id TEXT NOT NULL,
  saboteur_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_possible_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE saboteur_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saboteur_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE saboteur_results ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para saboteur_assessments
CREATE POLICY "Users can view their own assessments" ON saboteur_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments" ON saboteur_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" ON saboteur_assessments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all assessments" ON saboteur_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas RLS para saboteur_responses
CREATE POLICY "Users can view their own responses" ON saboteur_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" ON saboteur_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all responses" ON saboteur_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas RLS para saboteur_results
CREATE POLICY "Users can view their own results" ON saboteur_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results" ON saboteur_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all results" ON saboteur_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_saboteur_assessments_user_id ON saboteur_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_saboteur_responses_assessment_id ON saboteur_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_saboteur_responses_user_id ON saboteur_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_saboteur_results_assessment_id ON saboteur_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_saboteur_results_user_id ON saboteur_results(user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_assessment_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_saboteur_assessments_updated_at 
  BEFORE UPDATE ON saboteur_assessments 
  FOR EACH ROW EXECUTE FUNCTION update_assessment_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE saboteur_assessments IS 'Avaliações de sabotadores realizadas pelos usuários';
COMMENT ON TABLE saboteur_responses IS 'Respostas individuais das avaliações de sabotadores';
COMMENT ON TABLE saboteur_results IS 'Resultados agregados por sabotador para cada avaliação';

COMMENT ON COLUMN saboteur_assessments.completion_time IS 'Tempo em segundos para completar a avaliação';
COMMENT ON COLUMN saboteur_responses.answer IS 'Resposta na escala Likert (1-5)';
COMMENT ON COLUMN saboteur_results.percentage IS 'Percentual do score em relação ao máximo possível'; 