
-- Add optional neck circumference to weight_measurements (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='weight_measurements' AND column_name='neck_circumference_cm'
  ) THEN
    ALTER TABLE public.weight_measurements
      ADD COLUMN neck_circumference_cm NUMERIC;
  END IF;
END $$;
