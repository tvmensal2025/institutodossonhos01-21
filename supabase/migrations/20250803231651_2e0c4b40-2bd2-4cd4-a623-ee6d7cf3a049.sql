-- Adicionar campo altura à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2);

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.profiles.height_cm IS 'Altura do usuário em centímetros';