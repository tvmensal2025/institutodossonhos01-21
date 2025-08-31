-- Fix storage RLS policies for medical-documents bucket to prevent upload errors

-- 1. Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own medical documents" ON storage.objects;  
DROP POLICY IF EXISTS "Users can update their own medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow medical document access" ON storage.objects;
DROP POLICY IF EXISTS "Allow medical document uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow medical document updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow medical document deletes" ON storage.objects;

-- 2. Create new simplified policies for medical-documents bucket
CREATE POLICY "Medical documents - select own files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Medical documents - insert own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Medical documents - update own files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Medical documents - delete own files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Ensure bucket exists and is private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-documents', 
  'medical-documents', 
  false, 
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'image/tiff', 'image/bmp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Also fix medical-documents-reports bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-documents-reports', 
  'medical-documents-reports', 
  true, 
  52428800, -- 50MB limit
  ARRAY['text/html', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5. Create policies for medical-documents-reports bucket
DROP POLICY IF EXISTS "Public read access to medical reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload medical reports" ON storage.objects;

CREATE POLICY "Medical reports - public read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'medical-documents-reports');

CREATE POLICY "Medical reports - insert own reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'medical-documents-reports' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);