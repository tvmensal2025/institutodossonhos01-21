-- 🚀 SQL CORRIGIDO PARA CRIAR TABELA image_cache
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. CRIAR TABELA image_cache (versão simplificada)
CREATE TABLE image_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  base64_data TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 1
);

-- 2. CRIAR ÍNDICES
CREATE INDEX idx_image_cache_storage_path ON image_cache(storage_path);
CREATE INDEX idx_image_cache_accessed_at ON image_cache(accessed_at);

-- 3. ATIVAR RLS
ALTER TABLE image_cache ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS (uma por vez)
CREATE POLICY "image_cache_select" ON image_cache 
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "image_cache_insert" ON image_cache 
FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "image_cache_update" ON image_cache 
FOR UPDATE TO authenticated 
USING (true);
