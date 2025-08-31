-- Verificar estrutura das tabelas

-- Ver tipos de dados e enums
SELECT t.typname AS enum_name, e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%category%' OR t.typname LIKE '%difficulty%'
ORDER BY t.typname, e.enumsortorder;

-- Ver estrutura da tabela missions
\d public.missions;

-- Ver estrutura da tabela challenges
\d public.challenges;

-- Tentar inserir um registro simples primeiro
INSERT INTO public.challenges (title, description, points) VALUES
('Teste Simples', 'Desafio de teste', 10)
ON CONFLICT DO NOTHING;

-- Ver o que foi criado
SELECT * FROM public.challenges LIMIT 5;