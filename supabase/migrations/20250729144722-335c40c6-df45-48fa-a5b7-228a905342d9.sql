-- Corrigir RLS policies da tabela profiles para permitir queries corretas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Criar políticas RLS corretas para a tabela profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR auth.uid() = user_id
);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR auth.uid() = user_id
);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() = id OR auth.uid() = user_id
);

-- Verificar e corrigir políticas da tabela user_goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;

-- Criar políticas RLS corretas para user_goals
CREATE POLICY "Users can view their own goals" ON public.user_goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" ON public.user_goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.user_goals
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.user_goals
FOR DELETE USING (auth.uid() = user_id);

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;