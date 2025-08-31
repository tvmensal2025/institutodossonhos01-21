-- Fix numeric field precision issues
-- Update daily_responses table to handle larger point values
ALTER TABLE daily_responses 
ALTER COLUMN points_earned TYPE INTEGER;

-- Fix health_diary precision issues for water intake and other fields
ALTER TABLE health_diary 
ALTER COLUMN water_intake TYPE NUMERIC(6,2);

-- Fix challenge_participations table to add missing target_value column
ALTER TABLE challenge_participations 
ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT 100,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ALTER COLUMN progress TYPE NUMERIC(5,2) DEFAULT 0;

-- Update any existing records to ensure compatibility
UPDATE challenge_participations 
SET progress = 0 
WHERE progress IS NULL;

UPDATE challenge_participations 
SET target_value = 100 
WHERE target_value IS NULL;