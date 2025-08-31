-- Adicionar timeout automático para documentos travados em processamento
CREATE OR REPLACE FUNCTION reset_stuck_processing_documents()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  reset_count INTEGER := 0;
BEGIN
  -- Resetar documentos que estão há mais de 10 minutos em processamento
  UPDATE medical_documents 
  SET 
    analysis_status = 'pending',
    processing_stage = 'resetado_por_timeout',
    progress_pct = 0,
    processing_started_at = NULL,
    error_message = 'Documento resetado automaticamente por timeout'
  WHERE 
    analysis_status = 'processing' 
    AND processing_started_at < NOW() - INTERVAL '10 minutes';
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  
  RETURN reset_count;
END;
$$;

-- Função para reprocessar documento específico
CREATE OR REPLACE FUNCTION retry_document_analysis(doc_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE medical_documents 
  SET 
    analysis_status = 'pending',
    processing_stage = NULL,
    progress_pct = 0,
    processing_started_at = NULL,
    error_message = NULL
  WHERE id = doc_id;
  
  RETURN FOUND;
END;
$$;