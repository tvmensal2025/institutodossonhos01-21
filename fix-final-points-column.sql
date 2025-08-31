-- Adicionar coluna final_points na tabela user_goals
ALTER TABLE user_goals 
ADD COLUMN IF NOT EXISTS final_points INTEGER DEFAULT 0;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
AND column_name = 'final_points';

-- Atualizar registros existentes que não têm final_points
UPDATE user_goals 
SET final_points = estimated_points 
WHERE final_points IS NULL 
AND estimated_points IS NOT NULL;

-- Verificar a estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
ORDER BY ordinal_position; 