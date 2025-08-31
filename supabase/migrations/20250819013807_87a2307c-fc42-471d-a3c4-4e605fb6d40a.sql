-- Add functionality column to ai_configurations if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_configurations' AND column_name = 'functionality'
  ) THEN
    ALTER TABLE ai_configurations ADD COLUMN functionality TEXT;
  END IF;
END $$;