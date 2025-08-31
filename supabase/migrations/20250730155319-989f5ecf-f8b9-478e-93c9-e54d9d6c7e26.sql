-- Corrigir problemas críticos de RLS

-- Habilitar RLS em todas as tabelas que não têm
ALTER TABLE public.weighings ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para weighings
CREATE POLICY "Users can insert own weighings" 
ON public.weighings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own weighings" 
ON public.weighings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own weighings" 
ON public.weighings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weighings" 
ON public.weighings 
FOR DELETE 
USING (auth.uid() = user_id);