-- Create medical_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'exame_laboratorial',
  file_url TEXT,
  analysis_status TEXT DEFAULT 'pending',
  processing_started_at TIMESTAMP WITH TIME ZONE,
  images_total INTEGER DEFAULT 0,
  images_processed INTEGER DEFAULT 0,
  progress_pct INTEGER DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 0,
  report_meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on medical_documents table
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for medical_documents
CREATE POLICY "Users can view their own medical documents" 
ON public.medical_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical documents" 
ON public.medical_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical documents" 
ON public.medical_documents 
FOR UPDATE 
USING (auth.uid() = user_id);