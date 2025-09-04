-- Tabela para cache de imagens convertidas em base64
-- Elimina CPU timeout ao reutilizar conversões já feitas

CREATE TABLE IF NOT EXISTS image_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE, -- path da imagem no storage
  base64_data TEXT NOT NULL, -- dados em base64
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  
  -- Índices para performance
  CONSTRAINT image_cache_storage_path_key UNIQUE (storage_path)
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_image_cache_storage_path ON image_cache(storage_path);
CREATE INDEX IF NOT EXISTS idx_image_cache_accessed_at ON image_cache(accessed_at);

-- RLS (Row Level Security)
ALTER TABLE image_cache ENABLE ROW LEVEL SECURITY;

-- Política: qualquer usuário autenticado pode ler/escrever
-- (cache é compartilhado entre usuários para eficiência)
CREATE POLICY "Allow authenticated read access" ON image_cache
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write access" ON image_cache
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON image_cache
  FOR UPDATE TO authenticated USING (true);

-- Função para limpeza automática de cache antigo (30 dias)
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

-- Comentários para documentação
COMMENT ON TABLE image_cache IS 'Cache de imagens convertidas em base64 para eliminar CPU timeout nas edge functions';
COMMENT ON COLUMN image_cache.storage_path IS 'Caminho da imagem no Supabase Storage (chave única)';
COMMENT ON COLUMN image_cache.base64_data IS 'Dados da imagem convertidos em base64 (data:image/jpeg;base64,...)';
COMMENT ON COLUMN image_cache.access_count IS 'Número de vezes que esta imagem foi acessada (para estatísticas)';
