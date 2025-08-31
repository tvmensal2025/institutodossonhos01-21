-- Vamos resolver os problemas com constraints na tabela challenges
-- Primeiro removemos quaisquer constraints problemáticos
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_category_check;
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_difficulty_check;
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_challenge_type_check;
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_daily_log_type_check;

-- Agora vamos adicionar novos constraints mais flexíveis
ALTER TABLE challenges 
ADD CONSTRAINT challenges_category_check 
CHECK (category IN ('exercicio', 'nutricao', 'mindfulness', 'bem-estar', 'hidratacao', 'sono', 'outros'));

ALTER TABLE challenges 
ADD CONSTRAINT challenges_difficulty_check 
CHECK (difficulty IN ('facil', 'medio', 'dificil', 'extremo'));

ALTER TABLE challenges 
ADD CONSTRAINT challenges_challenge_type_check 
CHECK (challenge_type IN ('daily', 'weekly', 'monthly', 'custom'));

ALTER TABLE challenges 
ADD CONSTRAINT challenges_daily_log_type_check 
CHECK (daily_log_type IN ('quantity', 'duration', 'boolean', 'weight', 'distance'));

-- Atualizar qualquer dado que possa estar causando problemas
UPDATE challenges SET 
  category = 'exercicio' 
WHERE category IS NULL OR category NOT IN ('exercicio', 'nutricao', 'mindfulness', 'bem-estar', 'hidratacao', 'sono', 'outros');

UPDATE challenges SET 
  difficulty = 'medio' 
WHERE difficulty IS NULL OR difficulty NOT IN ('facil', 'medio', 'dificil', 'extremo');

UPDATE challenges SET 
  challenge_type = 'daily' 
WHERE challenge_type IS NULL OR challenge_type NOT IN ('daily', 'weekly', 'monthly', 'custom');

UPDATE challenges SET 
  daily_log_type = 'quantity' 
WHERE daily_log_type IS NULL OR daily_log_type NOT IN ('quantity', 'duration', 'boolean', 'weight', 'distance');