-- Configurar políticas de segurança para o bucket avatars
-- Permitir que usuários autenticados façam upload de seus próprios avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir que usuários autenticados vejam todos os avatars (para perfil público)
CREATE POLICY "Users can view all avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Permitir que usuários autenticados atualizem seus próprios avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir que usuários autenticados deletem seus próprios avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Habilitar RLS no bucket avatars se ainda não estiver habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 