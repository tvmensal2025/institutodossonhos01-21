-- Adicionar política para admins criarem desafios
-- Primeiro vamos criar uma função simples para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Por enquanto, qualquer usuário autenticado pode criar desafios
  -- Em produção, adicionar lógica de verificação de role de admin
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Adicionar políticas para admins gerenciarem desafios
CREATE POLICY "Admins can create challenges" 
ON public.challenges 
FOR INSERT 
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update challenges" 
ON public.challenges 
FOR UPDATE 
USING (public.is_admin_user());

CREATE POLICY "Admins can delete challenges" 
ON public.challenges 
FOR DELETE 
USING (public.is_admin_user());