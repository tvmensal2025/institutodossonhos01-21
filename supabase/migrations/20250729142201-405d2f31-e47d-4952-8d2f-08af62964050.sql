-- Unificar tabelas profiles e user_profiles
-- Primeiro, migrar dados de user_profiles para profiles se existir
INSERT INTO public.profiles (
  id, 
  full_name, 
  avatar_url, 
  updated_at
)
SELECT 
  user_id,
  full_name,
  avatar_url,
  updated_at
FROM public.user_profiles
WHERE user_id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE SET
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
  updated_at = EXCLUDED.updated_at;

-- Adicionar colunas faltantes na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS goals TEXT[],
ADD COLUMN IF NOT EXISTS achievements TEXT[];

-- Migrar dados adicionais de user_profiles se existirem
UPDATE public.profiles 
SET 
  phone = up.phone,
  birth_date = up.birth_date,
  city = up.city,
  bio = up.bio,
  goals = up.goals,
  achievements = up.achievements
FROM public.user_profiles up
WHERE profiles.id = up.user_id
  AND (profiles.phone IS NULL OR profiles.birth_date IS NULL OR profiles.city IS NULL);

-- Dropar tabela user_profiles após migração
DROP TABLE IF EXISTS public.user_profiles;

-- Criar função para auto-criação de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url,
    phone,
    birth_date,
    city,
    state,
    bio,
    goals,
    achievements
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'phone',
    (NEW.raw_user_meta_data ->> 'birth_date')::DATE,
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state',
    COALESCE(NEW.raw_user_meta_data ->> 'bio', 'Transformando minha vida através da saúde e bem-estar.'),
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data ? 'goals' THEN 
          ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'goals'))
        ELSE ARRAY['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis']
      END
    ),
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data ? 'achievements' THEN 
          ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'achievements'))
        ELSE ARRAY['Primeira semana completa', 'Primeira pesagem registrada']
      END
    )
  );
  RETURN NEW;
END;
$$;

-- Criar trigger para auto-criação de perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualizar RLS policies da tabela profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);