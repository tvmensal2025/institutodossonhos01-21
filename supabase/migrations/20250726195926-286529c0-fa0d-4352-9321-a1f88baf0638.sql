-- Criar tabela user_profiles se não existir (compatibilidade com hook existente)
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

-- RLS para user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir perfis básicos para usuários existentes que não têm perfil
INSERT INTO public.user_profiles (user_id, full_name, bio)
SELECT u.id, 
       COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
       'Membro da comunidade de saúde'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Garantir que todos os usuários tenham um perfil (função para novos usuários)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    'Membro da comunidade de saúde'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Adicionar colunas de pontuação/gamificação na user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level_name TEXT DEFAULT 'Iniciante',
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Função para calcular nível baseado em pontos
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

-- Atualizar níveis de todos os usuários baseado nos pontos das missões diárias
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

-- Criar bucket de storage para uploads da comunidade
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-uploads', 'community-uploads', true)
ON CONFLICT DO NOTHING;

-- Políticas de storage para uploads da comunidade
CREATE POLICY "Users can upload their own community content" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'community-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view community uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'community-uploads');

CREATE POLICY "Users can update their own community uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'community-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own community uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'community-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);