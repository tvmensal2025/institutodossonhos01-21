-- Corrigir tabela preventive_health_analyses que está causando erro
ALTER TABLE preventive_health_analyses 
ADD COLUMN IF NOT EXISTS analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar dados existentes se necessário
UPDATE preventive_health_analyses 
SET analysis_date = created_at 
WHERE analysis_date IS NULL AND created_at IS NOT NULL;