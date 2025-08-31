-- Corrigir erro de recursão infinita na tabela profiles
-- Remover todas as políticas problemáticas e criar políticas simples

DO $$ BEGIN
  -- Remover políticas que causam recursão
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;  
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_users_can_view_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_users_can_insert_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_users_can_update_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_admin_view_all" ON public.profiles;
  
  -- Políticas simples sem recursão
  CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT TO authenticated, anon
    USING (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
    
  CREATE POLICY "profiles_insert" ON public.profiles  
    FOR INSERT TO authenticated, anon
    WITH CHECK (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
    
  CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE TO authenticated, anon
    USING (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
END $$;
