-- Fix error: record "NEW" has no field "updated_at" when inserting weekly analysis
-- Ensure weekly_analyses has updated_at and auto-update trigger

-- 1) Add updated_at column
ALTER TABLE public.weekly_analyses
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2) Create/update generic updated_at trigger using existing helper
DROP TRIGGER IF EXISTS update_weekly_analyses_updated_at ON public.weekly_analyses;
CREATE TRIGGER update_weekly_analyses_updated_at
  BEFORE UPDATE ON public.weekly_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3) (Optional safety) Ensure weight_measurements also has updated_at + trigger
ALTER TABLE public.weight_measurements
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

DROP TRIGGER IF EXISTS update_weight_measurements_updated_at_trigger ON public.weight_measurements;
CREATE TRIGGER update_weight_measurements_updated_at_trigger
  BEFORE UPDATE ON public.weight_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
