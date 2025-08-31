-- Corrigir políticas RLS que causam recursão infinita na tabela profiles

-- Primeiro, remover políticas duplicadas/conflitantes
DROP POLICY IF EXISTS "admin_can_view_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;

-- Recriar políticas simples e sem recursão
CREATE POLICY "profiles_users_can_view_own" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "profiles_users_can_insert_own" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_users_can_update_own" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Política para admins verem todos os perfis (sem recursão)
CREATE POLICY "profiles_admin_view_all" ON public.profiles
FOR SELECT TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (auth.jwt() ->> 'email' IN ('admin@institutodossonhos.com.br', 'lucas11@gmail.com'))
);

-- Verificar se as políticas foram criadas corretamente
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'profiles';