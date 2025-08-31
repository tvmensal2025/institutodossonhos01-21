-- Add missing columns to medical_documents table for processing workflow

ALTER TABLE medical_documents 
ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS images_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS images_processed INTEGER DEFAULT 0, 
ADD COLUMN IF NOT EXISTS progress_pct INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 0;