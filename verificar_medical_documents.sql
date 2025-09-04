-- Verificar a estrutura exata da tabela medical_documents
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'medical_documents'
ORDER BY 
  ordinal_position;

-- Verificar o constraint de status
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM 
  pg_constraint
WHERE 
  conrelid = 'medical_documents'::regclass
  AND conname LIKE '%status%';

-- Verificar os valores permitidos para status
SELECT 
  pg_get_constraintdef(oid) AS constraint_definition
FROM 
  pg_constraint
WHERE 
  conrelid = 'medical_documents'::regclass
  AND pg_get_constraintdef(oid) LIKE '%status%IN%';
