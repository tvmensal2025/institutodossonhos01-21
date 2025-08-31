-- Criar bucket chat-images para upload de imagens do chat
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Criar políticas RLS para o bucket chat-images
DROP POLICY IF EXISTS "Users can upload chat images" ON storage.objects;
CREATE POLICY "Users can upload chat images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "Chat images are publicly accessible" ON storage.objects;
CREATE POLICY "Chat images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "Users can update their own chat images" ON storage.objects;
CREATE POLICY "Users can update their own chat images" ON storage.objects
FOR UPDATE USING (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "Users can delete their own chat images" ON storage.objects;
CREATE POLICY "Users can delete their own chat images" ON storage.objects
FOR DELETE USING (bucket_id = 'chat-images');