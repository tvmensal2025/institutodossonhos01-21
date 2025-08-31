-- Criar tabela para participações em desafios
CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress NUMERIC DEFAULT 0,
  target_value NUMERIC NOT NULL DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own challenge participations" 
ON public.challenge_participations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenge participations" 
ON public.challenge_participations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge participations" 
ON public.challenge_participations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can view all participations
CREATE POLICY "Admins can view all challenge participations" 
ON public.challenge_participations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_challenge_participation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenge_participations_updated_at
  BEFORE UPDATE ON public.challenge_participations
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_participation_updated_at();