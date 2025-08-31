-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height decimal(5,2);

-- Add missing columns to sessions table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions' AND table_schema = 'public') THEN
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS type text;
    END IF;
END $$;

-- Create sofia_food_analysis table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sofia_food_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    analysis_date date DEFAULT CURRENT_DATE,
    analysis_time time DEFAULT CURRENT_TIME,
    meal_type text,
    food_items jsonb DEFAULT '[]'::jsonb,
    nutrition_summary jsonb DEFAULT '{}'::jsonb,
    sofia_analysis text,
    total_calories integer,
    total_proteins decimal(8,2),
    total_carbs decimal(8,2),
    total_fats decimal(8,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on sofia_food_analysis
ALTER TABLE public.sofia_food_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sofia_food_analysis
CREATE POLICY "Users can view their own food analysis" 
ON public.sofia_food_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own food analysis" 
ON public.sofia_food_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food analysis" 
ON public.sofia_food_analysis 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add missing functions that are being called
CREATE OR REPLACE FUNCTION public.assign_session_to_all_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Function placeholder - implement logic as needed
  NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_session_to_users()
RETURNS void  
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Function placeholder - implement logic as needed
  NULL;
END;
$$;

-- Add trigger for sofia_food_analysis updated_at
CREATE OR REPLACE FUNCTION public.update_sofia_food_analysis_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_sofia_food_analysis_updated_at
  BEFORE UPDATE ON public.sofia_food_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sofia_food_analysis_updated_at();