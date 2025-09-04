-- 🚀 FIX: Permitir que Service Role (Edge Functions) façam upload no bucket medical-documents-reports

-- 1. Adicionar política para Service Role fazer INSERT
CREATE POLICY "Service role can insert medical reports" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'medical-documents-reports' AND
  auth.role() = 'service_role'
);

-- 2. Adicionar política para Service Role fazer SELECT  
CREATE POLICY "Service role can select medical reports" ON storage.objects
FOR SELECT USING (
  bucket_id = 'medical-documents-reports' AND
  auth.role() = 'service_role'
);

-- 3. Adicionar política para Service Role fazer UPDATE
CREATE POLICY "Service role can update medical reports" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'medical-documents-reports' AND
  auth.role() = 'service_role'
);

-- 4. Adicionar política para Service Role fazer DELETE
CREATE POLICY "Service role can delete medical reports" ON storage.objects
FOR DELETE USING (
  bucket_id = 'medical-documents-reports' AND
  auth.role() = 'service_role'
);

-- 5. Também permitir leitura pública para que o botão "olho" funcione
CREATE POLICY "Public read access to medical reports" ON storage.objects
FOR SELECT USING (bucket_id = 'medical-documents-reports');

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%medical%reports%'
ORDER BY policyname;
