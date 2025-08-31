-- Verificar se as tabelas necessárias existem e criar tabela de configuração se não existir
CREATE TABLE IF NOT EXISTS public.chat_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_configurations ENABLE ROW LEVEL SECURITY;

-- Criar política para que apenas administradores acessem
CREATE POLICY "Only admins can manage chat configurations" 
ON public.chat_configurations 
FOR ALL 
USING (auth.jwt() ->> 'email' = 'admin@institutodossonhos.com.br');