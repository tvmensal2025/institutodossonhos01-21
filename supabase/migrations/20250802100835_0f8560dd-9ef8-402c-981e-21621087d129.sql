-- Corrigir políticas de storage para o bucket chat-images
-- Primeiro, verificar se o bucket existe e se não, criar
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-images', 'chat-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para permitir que usuários autenticados façam upload de imagens
-- Policy para SELECT (visualizar imagens)
DROP POLICY IF EXISTS "Usuários podem ver imagens do chat" ON storage.objects;
CREATE POLICY "Usuários podem ver imagens do chat" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-images');

-- Policy para INSERT (upload de imagens)
DROP POLICY IF EXISTS "Usuários podem fazer upload de imagens no chat" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de imagens no chat" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para UPDATE (atualizar imagens)
DROP POLICY IF EXISTS "Usuários podem atualizar suas imagens do chat" ON storage.objects;
CREATE POLICY "Usuários podem atualizar suas imagens do chat" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy para DELETE (deletar imagens)
DROP POLICY IF EXISTS "Usuários podem deletar suas imagens do chat" ON storage.objects;
CREATE POLICY "Usuários podem deletar suas imagens do chat" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);