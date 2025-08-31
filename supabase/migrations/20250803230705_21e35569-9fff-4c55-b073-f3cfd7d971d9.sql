-- 1. Verificar se o trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Verificar se a função existe
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 3. Recriar função handle_new_user corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
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
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    'user',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- 4. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Criar profiles para usuários existentes que não têm
INSERT INTO public.profiles (user_id, full_name, email, role, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', SPLIT_PART(au.email, '@', 1)),
  au.email,
  'user',
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 6. Verificar resultado
SELECT 
  'PROFILES CRIADOS!' as status,
  (SELECT COUNT(*) FROM auth.users) as total_usuarios,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.profiles p ON au.id = p.user_id WHERE p.id IS NULL) as usuarios_sem_profile;