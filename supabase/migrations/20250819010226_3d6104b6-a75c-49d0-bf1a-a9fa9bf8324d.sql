-- Fix numeric field precision issues and daily missions problems

-- Fix daily_responses table to handle larger point values
ALTER TABLE daily_responses 
ALTER COLUMN points_earned TYPE INTEGER;

-- Fix health_diary precision issues for water intake
ALTER TABLE health_diary 
ALTER COLUMN water_intake TYPE NUMERIC(6,2);

-- Fix challenge_participations table structure
ALTER TABLE challenge_participations 
ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT 100;

ALTER TABLE challenge_participations 
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE challenge_participations 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix progress column type separately
ALTER TABLE challenge_participations 
ALTER COLUMN progress TYPE NUMERIC(5,2);

-- Set default values for existing records
UPDATE challenge_participations 
SET progress = 0 
WHERE progress IS NULL;

UPDATE challenge_participations 
SET target_value = 100 
WHERE target_value IS NULL;

UPDATE challenge_participations 
SET is_completed = FALSE 
WHERE is_completed IS NULL;

UPDATE challenge_participations 
SET started_at = NOW() 
WHERE started_at IS NULL;