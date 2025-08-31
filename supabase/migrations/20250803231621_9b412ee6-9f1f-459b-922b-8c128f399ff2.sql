-- Verificar estrutura atual da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Adicionar campos que estão faltando na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS state VARCHAR(100);

-- Verificar estrutura atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar campos existentes vs necessários
SELECT 'CAMPOS ATUAIS NA TABELA PROFILES:' as info;
SELECT 
  CASE 
    WHEN column_name = 'full_name' THEN '✅ Nome Completo'
    WHEN column_name = 'email' THEN '✅ Email'
    WHEN column_name = 'phone' THEN '✅ Celular'
    WHEN column_name = 'birth_date' THEN '✅ Data de Nascimento'
    WHEN column_name = 'city' THEN '✅ Cidade'
    WHEN column_name = 'gender' THEN '✅ Gênero'
    WHEN column_name = 'state' THEN '✅ Estado'
    ELSE column_name
  END as campo_status,
  data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
AND column_name IN ('full_name', 'email', 'phone', 'birth_date', 'city', 'gender', 'state')
ORDER BY 
  CASE column_name 
    WHEN 'full_name' THEN 1
    WHEN 'email' THEN 2
    WHEN 'phone' THEN 3
    WHEN 'gender' THEN 4
    WHEN 'birth_date' THEN 5
    WHEN 'city' THEN 6
    WHEN 'state' THEN 7
  END;