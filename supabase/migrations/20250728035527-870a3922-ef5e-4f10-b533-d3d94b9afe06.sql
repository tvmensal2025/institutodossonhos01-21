-- Criar tabela para histórico de mapeamento de sintomas
CREATE TABLE IF NOT EXISTS health_symptom_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_score INTEGER NOT NULL DEFAULT 0,
  system_scores JSONB NOT NULL DEFAULT '{}', -- Scores por sistema (cabeça, olhos, etc)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, assessment_date)
);

-- Enable RLS
ALTER TABLE health_symptom_mappings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own symptom mappings"
  ON health_symptom_mappings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom mappings"
  ON health_symptom_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom mappings"
  ON health_symptom_mappings FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins podem visualizar todos os dados para análise
CREATE POLICY "Admins can view all symptom mappings"
  ON health_symptom_mappings FOR SELECT
  USING (is_admin_user());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_health_symptom_mappings_updated_at
  BEFORE UPDATE ON health_symptom_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();