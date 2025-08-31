-- Add missing data_date column to google_fit_data table
ALTER TABLE public.google_fit_data 
ADD COLUMN data_date DATE;

-- Update existing rows to set data_date based on start_time
UPDATE public.google_fit_data 
SET data_date = start_time::DATE 
WHERE data_date IS NULL;

-- Create a trigger to automatically set data_date when inserting/updating
CREATE OR REPLACE FUNCTION set_google_fit_data_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_date = NEW.start_time::DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_google_fit_data_date
  BEFORE INSERT OR UPDATE ON public.google_fit_data
  FOR EACH ROW
  EXECUTE FUNCTION set_google_fit_data_date();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_fit_data_date ON public.google_fit_data(data_date);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_date ON public.google_fit_data(user_id, data_date);