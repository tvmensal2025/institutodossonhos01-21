-- Verificar todos os perfis existentes
SELECT * FROM profiles;

-- Verificar se há outros usuários
SELECT * FROM auth.users;

-- Verificar tabelas relacionadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%user%' OR table_name LIKE '%profile%'; 