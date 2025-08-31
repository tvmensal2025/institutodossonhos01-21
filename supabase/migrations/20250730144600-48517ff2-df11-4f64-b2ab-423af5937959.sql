-- Verificar estrutura das tabelas e constraints

-- Ver constraints da tabela missions
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.missions'::regclass;

-- Ver constraints da tabela challenges  
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.challenges'::regclass;

-- Ver dados existentes
SELECT DISTINCT category FROM public.challenges;
SELECT DISTINCT category FROM public.missions;

-- Ver estrutura das colunas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'missions' AND table_schema = 'public';

SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'challenges' AND table_schema = 'public';