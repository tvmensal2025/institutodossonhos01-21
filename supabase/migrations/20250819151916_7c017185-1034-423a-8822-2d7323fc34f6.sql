-- Fix numeric overflow on daily_responses.points_earned
-- Increase precision to allow values like 10, 15, 100, etc.
DO $$
BEGIN
  -- If the column exists, alter its type to numeric(6,2)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_responses'
      AND column_name = 'points_earned'
  ) THEN
    ALTER TABLE public.daily_responses
    ALTER COLUMN points_earned TYPE numeric(6,2)
    USING points_earned::numeric;
    
    -- Ensure a default of 0 for safety (optional)
    ALTER TABLE public.daily_responses
    ALTER COLUMN points_earned SET DEFAULT 0;
  END IF;
END $$;