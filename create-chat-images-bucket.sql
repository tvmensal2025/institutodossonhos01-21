-- Criar bucket para imagens do chat
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('chat-images', 'chat-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Criar política para permitir upload de imagens para usuários autenticados
INSERT INTO storage.policies (name, bucket_id, operation, definition, actions)
VALUES
  ('Allow uploads for authenticated users', 'chat-images', 'INSERT', '(auth.uid() = auth.uid())', ARRAY['INSERT'])
ON CONFLICT (name, bucket_id, operation) DO NOTHING;

-- Criar política para permitir leitura pública das imagens
INSERT INTO storage.policies (name, bucket_id, operation, definition, actions)
VALUES
  ('Allow public read access', 'chat-images', 'SELECT', '(true)', ARRAY['SELECT'])
ON CONFLICT (name, bucket_id, operation) DO NOTHING;