-- Corrigir bucket medical-documents e políticas
-- Garantir que o bucket existe e está configurado corretamente

-- 1) Recriar bucket se necessário
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

-- 2) Remover políticas antigas se existirem
DROP POLICY IF EXISTS "medical_docs_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "medical_docs_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "medical_docs_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "medical_docs_owner_delete" ON storage.objects;

-- 3) Criar políticas simplificadas e mais permissivas
CREATE POLICY "medical_docs_owner_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-documents' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     auth.uid()::text = (storage.foldername(name))[2])
  );

CREATE POLICY "medical_docs_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-documents' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     auth.uid()::text = (storage.foldername(name))[2])
  );

CREATE POLICY "medical_docs_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'medical-documents' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     auth.uid()::text = (storage.foldername(name))[2])
  );

CREATE POLICY "medical_docs_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'medical-documents' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     auth.uid()::text = (storage.foldername(name))[2])
  );

-- 4) Garantir que a tabela medical_documents existe com as colunas necessárias
CREATE TABLE IF NOT EXISTS public.medical_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  exam_type TEXT DEFAULT 'laboratory',
  file_url TEXT,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'ready', 'error')),
  report_path TEXT,
  report_meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5) Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_medical_documents_user_id ON public.medical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_status ON public.medical_documents(analysis_status);
CREATE INDEX IF NOT EXISTS idx_medical_documents_created_at ON public.medical_documents(created_at DESC);

-- 6) RLS para medical_documents
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_view_own_medical_documents" ON public.medical_documents;
DROP POLICY IF EXISTS "users_can_insert_own_medical_documents" ON public.medical_documents;
DROP POLICY IF EXISTS "users_can_update_own_medical_documents" ON public.medical_documents;
DROP POLICY IF EXISTS "users_can_delete_own_medical_documents" ON public.medical_documents;

CREATE POLICY "users_can_view_own_medical_documents" ON public.medical_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_medical_documents" ON public.medical_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_medical_documents" ON public.medical_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_medical_documents" ON public.medical_documents
  FOR DELETE USING (auth.uid() = user_id);
