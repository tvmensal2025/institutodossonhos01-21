-- Corrigir problema de usuários sem perfil
-- Criar perfis para usuários que não têm perfil na tabela profiles

-- Inserir perfis para usuários sem perfil
INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    role,
    created_at,
    updated_at
)
SELECT 
    au.id,
    COALESCE(
        au.raw_user_meta_data ->> 'full_name',
        au.raw_user_meta_data ->> 'name',
        SPLIT_PART(au.email, '@', 1)
    ) as full_name,
    au.email,
    'user' as role,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- Verificar se o trigger handle_new_user existe e está funcionando
-- Se não existir, criar o trigger para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'name',
        SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.email,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recriar o trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();