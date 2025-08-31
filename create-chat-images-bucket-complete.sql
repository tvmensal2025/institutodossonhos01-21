-- Verificar se o bucket já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'chat-images') THEN
        -- Criar bucket para imagens do chat
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('chat-images', 'chat-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif']);
        
        RAISE NOTICE 'Bucket chat-images criado com sucesso!';
    ELSE
        RAISE NOTICE 'Bucket chat-images já existe!';
    END IF;
END $$;

-- Configurar política RLS para o bucket
CREATE POLICY "Allow public access to chat-images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'chat-images');

CREATE POLICY "Allow authenticated uploads to chat-images" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own chat-images" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'chat-images' AND auth.uid() = owner)
    WITH CHECK (bucket_id = 'chat-images' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete their own chat-images" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'chat-images' AND auth.uid() = owner);

-- Confirmar criação de políticas
DO $$
BEGIN
    RAISE NOTICE 'Políticas para bucket chat-images configuradas com sucesso!';
END $$;