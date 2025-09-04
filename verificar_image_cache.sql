-- Verificar se a tabela image_cache já existe
SELECT 
  table_name,
  table_schema,
  table_type
FROM information_schema.tables 
WHERE table_name = 'image_cache';

-- Se existir, verificar estrutura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'image_cache' 
ORDER BY ordinal_position;

-- Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'image_cache';

-- Contar registros se existir
SELECT 
  COUNT(*) as total_images_cached,
  COUNT(DISTINCT storage_path) as unique_paths,
  MAX(created_at) as last_cached,
  AVG(access_count) as avg_access_count
FROM image_cache;
