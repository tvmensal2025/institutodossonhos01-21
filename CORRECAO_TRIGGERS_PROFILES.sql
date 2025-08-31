-- CORREÇÃO URGENTE - Triggers de Profiles
-- Execute este script NO SQL EDITOR DO SUPABASE

-- 1. Verificar triggers existentes
SELECT 'TRIGGERS EXISTENTES:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%auth%' OR trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- 2. Verificar função handle_new_user
SELECT 'FUNÇÃO handle_new_user:' as info;
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 3. Recriar função handle_new_user corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- 4. Remover triggers conflitantes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_role_created ON auth.users;

-- 5. Criar trigger único e correto
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Verificar se trigger foi criado
SELECT 'TRIGGER CRIADO:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 7. Corrigir usuários existentes que não têm profile
INSERT INTO public.profiles (user_id, full_name, email, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', 'Usuário'),
  au.email,
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 8. Verificar quantos usuários foram corrigidos
SELECT 'USUÁRIOS CORRIGIDOS:' as info;
SELECT COUNT(*) as usuarios_sem_perfil
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 9. Verificar estrutura da tabela profiles
SELECT 'ESTRUTURA DA TABELA PROFILES:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 10. Verificar políticas RLS
SELECT 'POLÍTICAS RLS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 11. Recriar políticas RLS se necessário
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 12. Mensagem de sucesso
SELECT '✅ TRIGGERS E PROFILES CORRIGIDOS!' as resultado; 