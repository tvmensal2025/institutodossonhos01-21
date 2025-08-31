-- Verificar estrutura da tabela valores_nutricionais_completos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'valores_nutricionais_completos' 
ORDER BY ordinal_position;

-- Verificar estrutura da tabela alimentos_completos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'alimentos_completos' 
ORDER BY ordinal_position;
