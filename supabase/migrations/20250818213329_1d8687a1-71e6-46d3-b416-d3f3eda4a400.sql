-- Adicionar campo updated_at à tabela weight_measurements
ALTER TABLE weight_measurements 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_weight_measurements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS update_weight_measurements_updated_at_trigger ON weight_measurements;
CREATE TRIGGER update_weight_measurements_updated_at_trigger
  BEFORE UPDATE ON weight_measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_weight_measurements_updated_at();