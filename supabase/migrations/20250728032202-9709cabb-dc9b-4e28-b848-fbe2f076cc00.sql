-- Create table for health wheel assessments
CREATE TABLE public.health_wheel_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID,
  total_score INTEGER NOT NULL DEFAULT 0,
  systems_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_wheel_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for health wheel assessments
CREATE POLICY "Users can view their own health wheel assessments" 
ON public.health_wheel_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health wheel assessments" 
ON public.health_wheel_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health wheel assessments" 
ON public.health_wheel_assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_health_wheel_assessments_user_date 
ON public.health_wheel_assessments (user_id, assessment_date DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_health_wheel_assessments_updated_at
BEFORE UPDATE ON public.health_wheel_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();