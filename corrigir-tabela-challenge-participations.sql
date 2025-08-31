-- Corrigir tabela challenge_participations
-- Verificar se a coluna target_value existe e adicionar se necessário

-- 1. Verificar estrutura atual da tabela
SELECT 'Estrutura atual da tabela challenge_participations:' as info,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'challenge_participations'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se target_value existe
SELECT 'Verificando se target_value existe:' as info,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'challenge_participations' 
               AND column_name = 'target_value'
           ) THEN '✅ target_value existe'
           ELSE '❌ target_value não existe'
       END as status;

-- 3. Adicionar target_value se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'challenge_participations' 
        AND column_name = 'target_value'
    ) THEN
        ALTER TABLE public.challenge_participations 
        ADD COLUMN target_value NUMERIC DEFAULT 100;
        
        RAISE NOTICE 'Coluna target_value adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna target_value já existe!';
    END IF;
END $$;

-- 4. Verificar estrutura final
SELECT 'Estrutura final da tabela challenge_participations:' as info,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'challenge_participations'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar dados existentes
SELECT 'Dados existentes:' as info,
       COUNT(*) as total_participations
FROM public.challenge_participations;

-- 6. Resultado final
SELECT 'TABELA CORRIGIDA!' as status,
       'Agora teste participar de um desafio' as resultado; 