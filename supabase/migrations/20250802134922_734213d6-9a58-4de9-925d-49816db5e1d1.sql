-- Corrigir políticas RLS da tabela user_sessions
-- Remover políticas problemáticas existentes
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert user sessions" ON public.user_sessions;

-- Criar políticas RLS corretas para user_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permitir que admins vejam e gerenciem todas as sessões
CREATE POLICY "Admins can manage all user sessions" 
ON public.user_sessions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Verificar se as políticas foram criadas corretamente
SELECT 'Políticas RLS corrigidas para user_sessions' as status;