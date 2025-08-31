-- Criar sistema robusto de histórico de ingredientes e receitas
CREATE TABLE IF NOT EXISTS user_ingredient_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ingredient_name TEXT NOT NULL,
  meal_plan_id UUID REFERENCES meal_plan_history(id) ON DELETE CASCADE,
  frequency_used INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, ingredient_name)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ingredient_history_user_frequency 
ON user_ingredient_history(user_id, frequency_used DESC);

CREATE INDEX IF NOT EXISTS idx_ingredient_history_last_used 
ON user_ingredient_history(user_id, last_used_at DESC);

-- RLS para ingredient history
ALTER TABLE user_ingredient_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ingredient history" 
ON user_ingredient_history FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Melhorar tabela de preferências
ALTER TABLE user_food_preferences ADD COLUMN IF NOT EXISTS severity_level INTEGER DEFAULT 5;
ALTER TABLE user_food_preferences ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE user_food_preferences ADD COLUMN IF NOT EXISTS auto_detected BOOLEAN DEFAULT false;

-- Melhorar tabela de histórico de meal plans
ALTER TABLE meal_plan_history ADD COLUMN IF NOT EXISTS restrictions_applied TEXT[];
ALTER TABLE meal_plan_history ADD COLUMN IF NOT EXISTS preferences_applied TEXT[];
ALTER TABLE meal_plan_history ADD COLUMN IF NOT EXISTS calories_target INTEGER;
ALTER TABLE meal_plan_history ADD COLUMN IF NOT EXISTS protein_target NUMERIC;
ALTER TABLE meal_plan_history ADD COLUMN IF NOT EXISTS carbs_target NUMERIC;
ALTER TABLE meal_plan_history ADD COLUMN IF NOT EXISTS fat_target NUMERIC;
ALTER TABLE meal_plan_history ADD COLUMN IF NOT EXISTS fiber_target NUMERIC;
ALTER TABLE meal_plan_history ADD COLUMN IF NOT EXISTS generation_params JSONB DEFAULT '{}';

-- Função para atualizar frequência de ingredientes
CREATE OR REPLACE FUNCTION update_ingredient_frequency()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_ingredient_history 
  SET frequency_used = frequency_used + 1,
      last_used_at = now()
  WHERE user_id = NEW.user_id 
    AND ingredient_name = NEW.ingredient_name;
  
  IF NOT FOUND THEN
    INSERT INTO user_ingredient_history (user_id, ingredient_name, meal_plan_id, frequency_used, last_used_at)
    VALUES (NEW.user_id, NEW.ingredient_name, NEW.meal_plan_id, 1, now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para automatizar contagem
CREATE TRIGGER trigger_update_ingredient_frequency
  BEFORE INSERT ON user_ingredient_history
  FOR EACH ROW
  EXECUTE FUNCTION update_ingredient_frequency();