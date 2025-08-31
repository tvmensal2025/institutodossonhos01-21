-- Adicionar colunas faltantes para o processamento robusto
ALTER TABLE public.medical_documents 
ADD COLUMN IF NOT EXISTS processing_stage TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS report_path TEXT,
ADD COLUMN IF NOT EXISTS report_content TEXT;