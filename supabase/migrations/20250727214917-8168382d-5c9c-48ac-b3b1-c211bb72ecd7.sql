-- Create AI configurations table
CREATE TABLE public.ai_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  functionality TEXT NOT NULL UNIQUE,
  service TEXT NOT NULL DEFAULT 'openai',
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 1000,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can manage AI configurations"
ON public.ai_configurations
FOR ALL
USING (is_admin_user());

-- Create trigger for updated_at
CREATE TRIGGER update_ai_configurations_updated_at
BEFORE UPDATE ON public.ai_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();