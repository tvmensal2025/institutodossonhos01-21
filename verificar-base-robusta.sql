-- Verificar se a base robusta TACO já existe e qual tabela usar
SELECT 'Verificando tabelas nutricionais existentes...' as status;

-- Verificar alimentos_completos
SELECT 'alimentos_completos' as tabela, COUNT(*) as registros 
FROM alimentos_completos;

-- Verificar valores_nutricionais_completos
SELECT 'valores_nutricionais_completos' as tabela, COUNT(*) as registros 
FROM valores_nutricionais_completos;

-- Verificar se existe dados para ovos
SELECT 'Dados de ovos encontrados:' as status;
SELECT alimento_nome, kcal, proteina, gorduras, carboidratos 
FROM valores_nutricionais_completos 
WHERE alimento_nome ILIKE '%ovo%'
LIMIT 5;

-- Verificar se existe dados para arroz
SELECT 'Dados de arroz encontrados:' as status;
SELECT alimento_nome, kcal, proteina, gorduras, carboidratos 
FROM valores_nutricionais_completos 
WHERE alimento_nome ILIKE '%arroz%'
LIMIT 5;
