-- 🚨 CORREÇÃO URGENTE: Adicionar colunas faltantes na tabela medical_documents
-- Este script garante que todas as colunas necessárias existam

-- 1. Adicionar colunas essenciais se não existirem
ALTER TABLE public.medical_documents 
ADD COLUMN IF NOT EXISTS report_content JSONB,
ADD COLUMN IF NOT EXISTS processing_stage TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS report_path TEXT,
ADD COLUMN IF NOT EXISTS didactic_report_path TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS report_meta JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS images_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS images_processed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_pct INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE;

-- 2. Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_medical_documents_user_id ON public.medical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_analysis_status ON public.medical_documents(analysis_status);
CREATE INDEX IF NOT EXISTS idx_medical_documents_processing_stage ON public.medical_documents(processing_stage);

-- 3. Atualizar constraint para incluir novos status
ALTER TABLE public.medical_documents DROP CONSTRAINT IF EXISTS medical_documents_status_check;
ALTER TABLE public.medical_documents 
ADD CONSTRAINT medical_documents_status_check 
CHECK (status IN ('active', 'archived', 'expired', 'processing', 'error', 'ready'));

-- 4. Garantir que a coluna type existe (necessária para analyze-medical-exam)
ALTER TABLE public.medical_documents 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'exame_laboratorial';

-- 5. Atualizar documentos existentes com report_content vazio para JSONB vazio
UPDATE public.medical_documents 
SET report_content = '{}'::JSONB 
WHERE report_content IS NULL;

-- 6. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'medical_documents'
ORDER BY ordinal_position;
