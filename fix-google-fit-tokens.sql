-- Verificar e corrigir tabela google_fit_tokens (sem erros se já existir)
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.google_fit_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS se não estiver habilitado
ALTER TABLE public.google_fit_tokens ENABLE ROW LEVEL SECURITY;

-- Remover política se existir e recriar
DROP POLICY IF EXISTS "Users can manage their own Google Fit tokens" ON public.google_fit_tokens;

-- Criar política
CREATE POLICY "Users can manage their own Google Fit tokens" ON public.google_fit_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger se existir e recriar
DROP TRIGGER IF EXISTS update_google_fit_tokens_updated_at ON public.google_fit_tokens;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_google_fit_tokens_updated_at 
    BEFORE UPDATE ON public.google_fit_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_google_fit_tokens_user_id ON public.google_fit_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_tokens_expires_at ON public.google_fit_tokens(expires_at);

-- Verificar se a tabela está pronta
SELECT 'Tabela google_fit_tokens está pronta!' as status;
