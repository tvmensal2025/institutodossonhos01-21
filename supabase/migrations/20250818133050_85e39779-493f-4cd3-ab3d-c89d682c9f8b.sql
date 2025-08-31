-- Verificar se a tabela meal_plan_history existe e sua estrutura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'meal_plan_history' 
AND table_schema = 'public';

-- Criar a tabela meal_plan_history se não existir ou adicionar colunas faltantes
CREATE TABLE IF NOT EXISTS meal_plan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('weekly', 'daily')) NOT NULL,
  meal_plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar a coluna meal_plan_data se ela não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meal_plan_history' 
    AND column_name = 'meal_plan_data'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE meal_plan_history ADD COLUMN meal_plan_data JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Habilitar RLS na tabela
ALTER TABLE meal_plan_history ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários possam gerenciar seus próprios cardápios
DROP POLICY IF EXISTS "Users can manage their meal plans" ON meal_plan_history;
CREATE POLICY "Users can manage their meal plans" ON meal_plan_history
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_meal_plan_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meal_plan_history_updated_at ON meal_plan_history;
CREATE TRIGGER meal_plan_history_updated_at
  BEFORE UPDATE ON meal_plan_history
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_plan_history_updated_at();