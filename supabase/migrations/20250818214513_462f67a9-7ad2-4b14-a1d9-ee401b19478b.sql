-- Fix RLS policies to allow uploads in tmp/ directory
-- The current policies are too restrictive for the tmp upload pattern

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Medical documents - select own files" ON storage.objects;
DROP POLICY IF EXISTS "Medical documents - insert own files" ON storage.objects;
DROP POLICY IF EXISTS "Medical documents - update own files" ON storage.objects;
DROP POLICY IF EXISTS "Medical documents - delete own files" ON storage.objects;

-- 2. Create more permissive policies that handle tmp/ uploads
CREATE POLICY "Medical documents - select files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'medical-documents' AND (
    -- Allow access to files in user's own folder or tmp folder they created
    auth.uid()::text = (storage.foldername(name))[1] OR
    (
      name LIKE 'tmp/%' AND 
      auth.uid()::text = (storage.foldername(name))[2]
    )
  )
);

CREATE POLICY "Medical documents - insert files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'medical-documents' AND (
    -- Allow uploads to user's own folder or tmp folder with their user_id
    auth.uid()::text = (storage.foldername(name))[1] OR
    (
      name LIKE 'tmp/%' AND 
      auth.uid()::text = (storage.foldername(name))[2]
    )
  )
);

CREATE POLICY "Medical documents - update files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'medical-documents' AND (
    -- Allow updates to files in user's own folder or tmp folder they created
    auth.uid()::text = (storage.foldername(name))[1] OR
    (
      name LIKE 'tmp/%' AND 
      auth.uid()::text = (storage.foldername(name))[2]
    )
  )
);

CREATE POLICY "Medical documents - delete files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'medical-documents' AND (
    -- Allow deletes to files in user's own folder or tmp folder they created
    auth.uid()::text = (storage.foldername(name))[1] OR
    (
      name LIKE 'tmp/%' AND 
      auth.uid()::text = (storage.foldername(name))[2]
    )
  )
);