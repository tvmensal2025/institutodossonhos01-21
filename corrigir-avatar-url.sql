-- Correção para problema da foto de perfil não ser salva
-- Esta migração garante que a estrutura esteja correta

-- 1. Garantir que a tabela profiles existe com a coluna avatar_url
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'Brasil',
  bio text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Adicionar coluna avatar_url se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 3. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS para a tabela profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Criar bucket avatars se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Configurar políticas RLS para o bucket avatars
DROP POLICY IF EXISTS "Avatar images são acessíveis publicamente" ON storage.objects;
CREATE POLICY "Avatar images são acessíveis publicamente"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de avatars" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatars" ON storage.objects;
CREATE POLICY "Usuários podem atualizar seus próprios avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios avatars" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus próprios avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 7. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Criar função para auto-criar perfil quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 10. Criar trigger para auto-criar perfil
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 11. Verificar se há usuários sem perfil e criar
INSERT INTO public.profiles (user_id, full_name, email)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', 'Usuário'),
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 12. Log de verificação
DO $$
BEGIN
  RAISE NOTICE '✅ Correção da foto de perfil concluída!';
  RAISE NOTICE '📊 Total de perfis na tabela: %', (SELECT COUNT(*) FROM public.profiles);
  RAISE NOTICE '📊 Perfis com avatar_url: %', (SELECT COUNT(*) FROM public.profiles WHERE avatar_url IS NOT NULL);
  RAISE NOTICE '📊 Perfis sem avatar_url: %', (SELECT COUNT(*) FROM public.profiles WHERE avatar_url IS NULL);
END $$; 