-- Script para corrigir especificamente a coluna chronic_diseases
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar se a coluna existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_anamnesis'
        AND column_name = 'chronic_diseases'
        AND table_schema = 'public'
    ) THEN
        -- Se a coluna existe, alterar o tipo para JSONB com valor padrão
        ALTER TABLE public.user_anamnesis 
        ALTER COLUMN chronic_diseases TYPE JSONB USING 
            CASE 
                WHEN chronic_diseases IS NULL THEN '[]'::JSONB
                WHEN chronic_diseases::TEXT = '' THEN '[]'::JSONB
                ELSE to_jsonb(chronic_diseases)
            END,
        ALTER COLUMN chronic_diseases SET DEFAULT '[]'::JSONB;
        
        RAISE NOTICE 'Coluna chronic_diseases alterada para JSONB com sucesso!';
    ELSE
        -- Se a coluna não existe, criar a coluna
        ALTER TABLE public.user_anamnesis 
        ADD COLUMN chronic_diseases JSONB DEFAULT '[]'::JSONB;
        
        RAISE NOTICE 'Coluna chronic_diseases criada com sucesso!';
    END IF;
END $$;

-- Verificar se a coluna foi corrigida
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_anamnesis' 
AND column_name = 'chronic_diseases'
AND table_schema = 'public';

-- Mensagem de sucesso
SELECT 'Coluna chronic_diseases corrigida com sucesso!' as status;
