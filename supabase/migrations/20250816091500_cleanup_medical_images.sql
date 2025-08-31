-- Tabela auxiliar para marcação de limpeza (opcional)
ALTER TABLE IF EXISTS public.medical_documents
  ADD COLUMN IF NOT EXISTS images_deleted_at timestamptz NULL;


