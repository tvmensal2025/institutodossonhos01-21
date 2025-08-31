-- Script para garantir que o campo completed_at seja atualizado corretamente
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar se a coluna completed_at existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_anamnesis'
        AND column_name = 'completed_at'
        AND table_schema = 'public'
    ) THEN
        -- Se a coluna não existe, criar a coluna
        ALTER TABLE public.user_anamnesis 
        ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Coluna completed_at criada com sucesso!';
    ELSE
        -- Se a coluna existe, atualizar para NOW() para todas as anamneses que não têm data
        UPDATE public.user_anamnesis
        SET completed_at = NOW()
        WHERE completed_at IS NULL;
        
        RAISE NOTICE 'Coluna completed_at atualizada com sucesso!';
    END IF;
END $$;

-- Criar ou substituir a trigger para atualizar completed_at automaticamente
CREATE OR REPLACE FUNCTION update_anamnesis_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.completed_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover a trigger se já existir
DROP TRIGGER IF EXISTS update_user_anamnesis_completed_at ON public.user_anamnesis;

-- Criar a trigger para atualizar completed_at
CREATE TRIGGER update_user_anamnesis_completed_at 
    BEFORE UPDATE ON public.user_anamnesis 
    FOR EACH ROW 
    EXECUTE FUNCTION update_anamnesis_completed_at();

-- Verificar se a coluna foi corrigida
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_anamnesis' 
AND column_name = 'completed_at'
AND table_schema = 'public';

-- Mensagem de sucesso
SELECT 'Coluna completed_at configurada com sucesso!' as status;
