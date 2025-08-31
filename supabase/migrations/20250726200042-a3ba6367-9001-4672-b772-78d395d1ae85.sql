-- Verificar se user_profiles já existe, se não criar
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  birth_date DATE,
  city TEXT,
  state TEXT,
  avatar_url TEXT,
  bio TEXT,
  goals TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS se a tabela for criada
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile') THEN
    EXECUTE 'ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- Adicionar colunas de gamificação se não existirem
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level_name TEXT DEFAULT 'Iniciante',
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Função para calcular nível baseado em pontos (sobrescrever se existir)
CREATE OR REPLACE FUNCTION public.calculate_user_level(points INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE 
    WHEN points >= 10000 THEN RETURN 'Mestre';
    WHEN points >= 5000 THEN RETURN 'Especialista';
    WHEN points >= 2000 THEN RETURN 'Avançado';
    WHEN points >= 1000 THEN RETURN 'Experiente';
    WHEN points >= 500 THEN RETURN 'Intermediário';
    WHEN points >= 100 THEN RETURN 'Dedicado';
    ELSE RETURN 'Iniciante';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Inserir perfis para usuários que não têm
INSERT INTO public.user_profiles (user_id, full_name, bio)
SELECT u.id, 
       COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
       'Membro da comunidade de saúde'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Atualizar pontos e níveis dos usuários baseado nas missões diárias
UPDATE public.user_profiles 
SET 
  total_points = COALESCE((
    SELECT SUM(total_points) 
    FROM daily_mission_sessions 
    WHERE user_id = user_profiles.user_id
  ), 0),
  level_name = public.calculate_user_level(COALESCE((
    SELECT SUM(total_points) 
    FROM daily_mission_sessions 
    WHERE user_id = user_profiles.user_id
  ), 0));

-- Criar bucket de storage para uploads da comunidade se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-uploads', 'community-uploads', true)
ON CONFLICT DO NOTHING;

-- Políticas de storage (recriar se necessário)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Users can upload their own community content'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload their own community content" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = ''community-uploads'' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Anyone can view community uploads'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view community uploads" ON storage.objects
      FOR SELECT USING (bucket_id = ''community-uploads'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Users can update their own community uploads'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own community uploads" ON storage.objects
      FOR UPDATE USING (
        bucket_id = ''community-uploads'' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Users can delete their own community uploads'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own community uploads" ON storage.objects
      FOR DELETE USING (
        bucket_id = ''community-uploads'' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      )';
  END IF;
END $$;