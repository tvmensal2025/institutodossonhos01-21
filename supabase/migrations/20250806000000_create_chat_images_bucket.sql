-- Criar bucket para imagens do chat se não existir
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

-- Remover políticas existentes para evitar duplicação
DROP POLICY IF EXISTS "Allow public access to chat-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to chat-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own chat-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own chat-images" ON storage.objects;

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

-- Criar tabela para armazenar análises de imagens se não existir
CREATE TABLE IF NOT EXISTS public.food_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    analysis_text TEXT NOT NULL,
    meal_type TEXT,
    user_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela food_analysis
ALTER TABLE public.food_analysis ENABLE ROW LEVEL SECURITY;

-- Garantir colunas mínimas quando a tabela já existe
ALTER TABLE public.food_analysis ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.food_analysis ADD COLUMN IF NOT EXISTS analysis_text TEXT;
ALTER TABLE public.food_analysis ADD COLUMN IF NOT EXISTS meal_type TEXT;
ALTER TABLE public.food_analysis ADD COLUMN IF NOT EXISTS user_context JSONB;
ALTER TABLE public.food_analysis ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.food_analysis ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Criar políticas para a tabela food_analysis
DROP POLICY IF EXISTS "Users can view their own food analysis" ON public.food_analysis;
DROP POLICY IF EXISTS "Users can insert their own food analysis" ON public.food_analysis;

CREATE POLICY "Users can view their own food analysis" 
ON public.food_analysis FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food analysis" 
ON public.food_analysis FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_food_analysis_user_id ON public.food_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_food_analysis_created_at ON public.food_analysis(created_at);

-- Comentários para documentação (somente se colunas existirem)
DO $$
BEGIN
  EXECUTE 'COMMENT ON TABLE public.food_analysis IS ''Armazena análises de imagens de alimentos feitas pela Sofia''';
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='food_analysis' AND column_name='user_id') THEN
    EXECUTE 'COMMENT ON COLUMN public.food_analysis.user_id IS ''ID do usuário que enviou a imagem''';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='food_analysis' AND column_name='image_url') THEN
    EXECUTE 'COMMENT ON COLUMN public.food_analysis.image_url IS ''URL da imagem analisada''';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='food_analysis' AND column_name='analysis_text') THEN
    EXECUTE 'COMMENT ON COLUMN public.food_analysis.analysis_text IS ''Texto da análise gerada pela Sofia''';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='food_analysis' AND column_name='meal_type') THEN
    EXECUTE 'COMMENT ON COLUMN public.food_analysis.meal_type IS ''Tipo de refeição (café da manhã, almoço, jantar, lanche)''';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='food_analysis' AND column_name='user_context') THEN
    EXECUTE 'COMMENT ON COLUMN public.food_analysis.user_context IS ''Contexto do usuário no momento da análise''';
  END IF;
END $$;