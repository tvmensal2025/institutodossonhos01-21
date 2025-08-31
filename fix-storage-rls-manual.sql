-- Corrigir políticas RLS para o bucket medical-documents

-- 1) Remover políticas antigas se existirem
DROP POLICY IF EXISTS "medical_docs_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "medical_docs_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "medical_docs_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "medical_docs_owner_delete" ON storage.objects;

-- 2) Criar políticas simplificadas e mais permissivas
CREATE POLICY "medical_docs_owner_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-documents'
  );

CREATE POLICY "medical_docs_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-documents'
  );

CREATE POLICY "medical_docs_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'medical-documents'
  );

CREATE POLICY "medical_docs_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'medical-documents'
  );

-- 3) Garantir que o bucket existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-documents', 
  'medical-documents', 
  false, 
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
