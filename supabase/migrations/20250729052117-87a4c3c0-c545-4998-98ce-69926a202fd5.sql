-- Add missing data_date column to google_fit_data table
ALTER TABLE public.google_fit_data 
ADD COLUMN data_date DATE GENERATED ALWAYS AS (start_time::DATE) STORED;

-- Create index for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_google_fit_data_date ON public.google_fit_data(data_date);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_date ON public.google_fit_data(user_id, data_date);