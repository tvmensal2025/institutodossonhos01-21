-- Criar tabela user_missions
CREATE TABLE IF NOT EXISTS public.user_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  date_assigned DATE NOT NULL DEFAULT CURRENT_DATE,
  date_completed TIMESTAMP WITH TIME ZONE,
  points_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_missions
CREATE POLICY "Users can view their own missions" 
ON public.user_missions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions" 
ON public.user_missions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions" 
ON public.user_missions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_missions_updated_at
    BEFORE UPDATE ON public.user_missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON public.user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_date_assigned ON public.user_missions(date_assigned);
CREATE INDEX IF NOT EXISTS idx_user_missions_is_completed ON public.user_missions(is_completed);