-- Criar tabela para biografias geradas pela Sof.ia
CREATE TABLE public.user_ai_biography (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  biography TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  conversation_count INTEGER DEFAULT 0,
  personality_traits JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_ai_biography ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem visualizar sua própria biografia" 
ON public.user_ai_biography 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir biografias" 
ON public.user_ai_biography 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar biografias" 
ON public.user_ai_biography 
FOR UPDATE 
USING (true);

-- Índice para performance
CREATE INDEX idx_user_ai_biography_user_id ON public.user_ai_biography(user_id);