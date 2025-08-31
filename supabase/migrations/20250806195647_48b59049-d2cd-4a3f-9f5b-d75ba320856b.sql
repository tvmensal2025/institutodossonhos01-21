-- Verificar se existe tabela sofia_conversations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sofia_conversations') THEN
    -- Criar tabela sofia_conversations
    CREATE TABLE public.sofia_conversations (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID,
      user_message TEXT,
      sofia_response TEXT,
      context_data JSONB DEFAULT '{}',
      conversation_type VARCHAR DEFAULT 'chat',
      related_analysis_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Habilitar RLS
    ALTER TABLE public.sofia_conversations ENABLE ROW LEVEL SECURITY;

    -- Políticas RLS
    CREATE POLICY "Users can view own conversations" ON public.sofia_conversations 
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can create own conversations" ON public.sofia_conversations 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Verificar se existe tabela sofia_food_analysis  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sofia_food_analysis') THEN
    -- Criar tabela sofia_food_analysis
    CREATE TABLE public.sofia_food_analysis (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID,
      user_name TEXT,
      image_url TEXT,
      detected_foods JSONB DEFAULT '[]',
      estimated_calories INTEGER DEFAULT 0,
      meal_type VARCHAR DEFAULT 'refeicao',
      nutritional_score INTEGER DEFAULT 7,
      confirmed_by_user BOOLEAN DEFAULT FALSE,
      confirmation_prompt_sent BOOLEAN DEFAULT FALSE,
      analysis_result JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Habilitar RLS
    ALTER TABLE public.sofia_food_analysis ENABLE ROW LEVEL SECURITY;

    -- Políticas RLS
    CREATE POLICY "Users can view own food analysis" ON public.sofia_food_analysis 
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can create own food analysis" ON public.sofia_food_analysis 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Users can update own food analysis" ON public.sofia_food_analysis 
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Verificar se bucket chat-images existe
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('chat-images', 'chat-images', TRUE, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
  ON CONFLICT (id) DO NOTHING;

  -- Políticas para o bucket
  DO $bucket_policies$
  BEGIN
    -- Policy para SELECT (visualizar imagens)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Chat images are publicly viewable'
    ) THEN
      CREATE POLICY "Chat images are publicly viewable" ON storage.objects
        FOR SELECT USING (bucket_id = 'chat-images');
    END IF;

    -- Policy para INSERT (upload de imagens)  
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Anyone can upload chat images'
    ) THEN
      CREATE POLICY "Anyone can upload chat images" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'chat-images');
    END IF;
  END $bucket_policies$;

END $$;