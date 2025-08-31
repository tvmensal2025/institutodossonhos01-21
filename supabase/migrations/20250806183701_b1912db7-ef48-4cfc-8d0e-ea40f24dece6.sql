-- Criar bucket para armazenar imagens de chat se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-images', 'chat-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Idempotência: storage não suporta IF NOT EXISTS em CREATE POLICY
DROP POLICY IF EXISTS "Public can view chat images" ON storage.objects;
CREATE POLICY "Public can view chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'chat-images' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own chat images" ON storage.objects;
CREATE POLICY "Users can update their own chat images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own chat images" ON storage.objects;
CREATE POLICY "Users can delete their own chat images"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Criar tabela para conversas da Sofia
CREATE TABLE IF NOT EXISTS sofia_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para mensagens da Sofia
CREATE TABLE IF NOT EXISTS sofia_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES sofia_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'sofia')),
  content TEXT NOT NULL,
  image_url TEXT,
  has_image BOOLEAN DEFAULT FALSE,
  food_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para análises de alimentos da Sofia
CREATE TABLE IF NOT EXISTS sofia_food_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_id UUID REFERENCES sofia_messages(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  detected_foods TEXT[],
  estimated_calories INTEGER,
  meal_type TEXT,
  analysis_confidence DECIMAL(3,2),
  user_confirmed BOOLEAN DEFAULT NULL,
  correction_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas tabelas
ALTER TABLE sofia_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sofia_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sofia_food_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sofia_conversations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sofia_conversations' AND policyname='Users can view own conversations') THEN
    CREATE POLICY "Users can view own conversations" ON sofia_conversations FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sofia_conversations' AND policyname='Users can create own conversations') THEN
    CREATE POLICY "Users can create own conversations" ON sofia_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sofia_conversations' AND policyname='Users can update own conversations') THEN
    CREATE POLICY "Users can update own conversations" ON sofia_conversations FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas RLS para sofia_messages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sofia_messages' AND policyname='Users can view own messages') THEN
    CREATE POLICY "Users can view own messages" ON sofia_messages FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sofia_messages' AND policyname='Users can create own messages') THEN
    CREATE POLICY "Users can create own messages" ON sofia_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas RLS para sofia_food_analysis
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sofia_food_analysis' AND policyname='Users can view own food analysis') THEN
    CREATE POLICY "Users can view own food analysis" ON sofia_food_analysis FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sofia_food_analysis' AND policyname='Users can create own food analysis') THEN
    CREATE POLICY "Users can create own food analysis" ON sofia_food_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sofia_food_analysis' AND policyname='Users can update own food analysis') THEN
    CREATE POLICY "Users can update own food analysis" ON sofia_food_analysis FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sofia_conversations_updated_at
  BEFORE UPDATE ON sofia_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sofia_food_analysis_updated_at  
  BEFORE UPDATE ON sofia_food_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();