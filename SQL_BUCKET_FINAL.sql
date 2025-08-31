-- Criar bucket chat-images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas RLS para o bucket
CREATE POLICY "Permitir upload de imagens" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Permitir visualização pública" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat-images');

-- Verificar se foi criado
SELECT * FROM storage.buckets WHERE id = 'chat-images';