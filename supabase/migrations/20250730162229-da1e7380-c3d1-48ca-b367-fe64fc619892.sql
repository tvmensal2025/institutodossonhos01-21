-- Add missing columns to challenges table
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0;

-- Now insert sample challenges with the correct UUIDs
INSERT INTO challenges (id, title, description, category, difficulty, challenge_type, target_value, xp_reward, is_active, created_at)
VALUES 
  ('01234567-89ab-cdef-0123-456789abcdef', 'Hidratação Diária', 'Beba 2L de água todos os dias', 'Saúde', 'easy', 'daily', 2, 50, true, now()),
  ('11234567-89ab-cdef-0123-456789abcdef', 'Exercício Matinal', '30 minutos de exercício toda manhã', 'Fitness', 'medium', 'daily', 30, 100, true, now()),
  ('21234567-89ab-cdef-0123-456789abcdef', 'Meditação Diária', '10 minutos de meditação por dia', 'Mental', 'easy', 'daily', 10, 75, true, now())
ON CONFLICT (id) DO NOTHING;

-- Update existing challenges that might have null/zero values
UPDATE challenges 
SET 
  target_value = CASE 
    WHEN title LIKE '%Hidratação%' THEN 2
    WHEN title LIKE '%Exercício%' THEN 30
    WHEN title LIKE '%Meditação%' THEN 10
    ELSE 100
  END,
  xp_reward = CASE 
    WHEN difficulty = 'easy' THEN 50
    WHEN difficulty = 'medium' THEN 100
    WHEN difficulty = 'hard' THEN 150
    ELSE 100
  END,
  challenge_type = COALESCE(challenge_type, 'daily')
WHERE target_value = 0 OR target_value IS NULL OR xp_reward = 0 OR xp_reward IS NULL;