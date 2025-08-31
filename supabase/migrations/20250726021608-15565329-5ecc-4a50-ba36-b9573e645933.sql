-- Criar tabela para conversas do chatbot
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem inserir suas próprias conversas" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem visualizar suas próprias conversas" 
ON public.chat_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

-- Criar tabela para análises de exames médicos
CREATE TABLE IF NOT EXISTS public.medical_exam_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_type TEXT NOT NULL,
  analysis_result TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.medical_exam_analyses ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem inserir suas próprias análises" 
ON public.medical_exam_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem visualizar suas próprias análises" 
ON public.medical_exam_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON public.chat_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_medical_exam_analyses_user_id ON public.medical_exam_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_exam_analyses_created_at ON public.medical_exam_analyses(created_at);