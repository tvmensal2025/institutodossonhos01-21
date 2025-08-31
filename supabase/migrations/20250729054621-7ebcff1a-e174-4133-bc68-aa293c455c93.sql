-- Corrigir a coluna agua_corporal_percent na tabela weight_measurements
-- Adicionar coluna caso não exista
ALTER TABLE public.weight_measurements 
ADD COLUMN IF NOT EXISTS agua_corporal_percent DECIMAL(5,2) DEFAULT 0.00;

-- Adicionar coluna challenge_type na tabela challenges caso não exista
ALTER TABLE public.challenges
ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'personal';

-- Criar tabela early_release_requests para corrigir os erros de TypeScript
CREATE TABLE IF NOT EXISTS public.early_release_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  cycle_number INTEGER,
  request_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.early_release_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para early_release_requests
CREATE POLICY "Users can view their own early release requests" ON public.early_release_requests
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own early release requests" ON public.early_release_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar função release_session_early para corrigir erros
CREATE OR REPLACE FUNCTION public.release_session_early(user_uuid UUID, session_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Lógica para liberar sessão antecipadamente
  INSERT INTO public.early_release_requests (user_id, session_id, status)
  VALUES (user_uuid, session_uuid, 'approved');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;