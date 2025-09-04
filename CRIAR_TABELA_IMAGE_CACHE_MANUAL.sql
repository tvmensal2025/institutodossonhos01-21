-- 🚀 CACHE SUPABASE PARA ELIMINAR CPU TIMEOUT
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. CRIAR TABELA image_cache
CREATE TABLE IF NOT EXISTS image_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  base64_data TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 1
);

-- 2. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_image_cache_storage_path ON image_cache(storage_path);
CREATE INDEX IF NOT EXISTS idx_image_cache_accessed_at ON image_cache(accessed_at);

-- 3. RLS (Row Level Security)
ALTER TABLE image_cache ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS (cache compartilhado para performance)
CREATE POLICY "image_cache_select" ON image_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "image_cache_insert" ON image_cache FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "image_cache_update" ON image_cache FOR UPDATE TO authenticated USING (true);

-- 5. FUNÇÃO DE LIMPEZA AUTOMÁTICA
CREATE OR REPLACE FUNCTION cleanup_old_image_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM image_cache 
  WHERE accessed_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. COMENTÁRIOS
COMMENT ON TABLE image_cache IS 'Cache de imagens em base64 para eliminar CPU timeout';
COMMENT ON COLUMN image_cache.storage_path IS 'Caminho único da imagem no storage';
COMMENT ON COLUMN image_cache.base64_data IS 'Dados em base64 (data:image/jpeg;base64,...)';

-- ✅ TABELA CRIADA COM SUCESSO!
-- Agora as edge functions usarão cache automático
