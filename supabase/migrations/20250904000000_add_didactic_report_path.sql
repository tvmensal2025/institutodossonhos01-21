-- Adicionar campo para relatório didático na tabela medical_documents
ALTER TABLE medical_documents 
ADD COLUMN IF NOT EXISTS didactic_report_path TEXT;

-- Comentário para documentação
COMMENT ON COLUMN medical_documents.didactic_report_path IS 'Caminho para o relatório didático com explicações simplificadas';
