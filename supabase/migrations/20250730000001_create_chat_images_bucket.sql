-- Criar bucket para imagens do chat
-- Esta migração cria o bucket 'chat-images' para armazenar imagens enviadas no chat

-- Criar o bucket chat-images (idempotente)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de imagens por usuários autenticados
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'chat_images_upload_policy'
  ) THEN
    CREATE POLICY "chat_images_upload_policy" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'chat-images' AND
      auth.uid() IS NOT NULL
    );
  END IF;
END $$;

-- Política para permitir visualização pública das imagens
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'chat_images_view_policy'
  ) THEN
    CREATE POLICY "chat_images_view_policy" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'chat-images'
    );
  END IF;
END $$;

-- Política para permitir atualização de imagens pelo proprietário
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'chat_images_update_policy'
  ) THEN
    CREATE POLICY "chat_images_update_policy" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'chat-images' AND
      auth.uid() = owner
    );
  END IF;
END $$;

-- Política para permitir exclusão de imagens pelo proprietário
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'chat_images_delete_policy'
  ) THEN
    CREATE POLICY "chat_images_delete_policy" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'chat-images' AND
      auth.uid() = owner
    );
  END IF;
END $$;

-- Comentário sobre o bucket
COMMENT ON TABLE storage.buckets IS 'Bucket para armazenar imagens enviadas no chat da Sofia'; 