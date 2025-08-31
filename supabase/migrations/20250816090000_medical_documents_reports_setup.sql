-- Medical documents: buckets, policies and report columns

-- 1) Ensure private buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents-reports', 'medical-documents-reports', false)
ON CONFLICT (id) DO NOTHING;

-- 2) Storage policies (owner-only access based on first folder = user_id)
DO $$ BEGIN
  -- medical-documents policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='medical_docs_owner_select'
  ) THEN
    CREATE POLICY "medical_docs_owner_select" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'medical-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='medical_docs_owner_insert'
  ) THEN
    CREATE POLICY "medical_docs_owner_insert" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'medical-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='medical_docs_owner_update'
  ) THEN
    CREATE POLICY "medical_docs_owner_update" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'medical-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='medical_docs_owner_delete'
  ) THEN
    CREATE POLICY "medical_docs_owner_delete" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'medical-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- medical-documents-reports policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='medical_reports_owner_select'
  ) THEN
    CREATE POLICY "medical_reports_owner_select" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'medical-documents-reports' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='medical_reports_owner_insert'
  ) THEN
    CREATE POLICY "medical_reports_owner_insert" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'medical-documents-reports' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='medical_reports_owner_update'
  ) THEN
    CREATE POLICY "medical_reports_owner_update" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'medical-documents-reports' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='medical_reports_owner_delete'
  ) THEN
    CREATE POLICY "medical_reports_owner_delete" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'medical-documents-reports' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- 3) Extend medical_documents with report metadata and processing status
ALTER TABLE public.medical_documents
  ADD COLUMN IF NOT EXISTS analysis_status TEXT NOT NULL DEFAULT 'processing' CHECK (analysis_status IN ('processing','ready','error')),
  ADD COLUMN IF NOT EXISTS report_path TEXT,
  ADD COLUMN IF NOT EXISTS report_meta JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_medical_documents_status2 ON public.medical_documents(analysis_status);


