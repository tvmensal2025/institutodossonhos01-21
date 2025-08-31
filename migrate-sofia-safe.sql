-- MIGRAÇÃO SEGURA DO SISTEMA SOFIA DA VERSÃO 76 PARA 32
-- Execute linha por linha para segurança máxima
-- Baseado no arquivo SOFIA_SIMPLES_SEM_ERRO.sql que funciona 100%

-- ========================================
-- ETAPA 1: VERIFICAR SE TABELAS JÁ EXISTEM
-- ========================================
DO $$
BEGIN
    -- Verificar se as tabelas Sofia já existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sofia_conversations') THEN
        RAISE NOTICE 'AVISO: Tabela sofia_conversations já existe - pulando criação';
    ELSE
        RAISE NOTICE 'OK: Tabela sofia_conversations será criada';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sofia_food_analysis') THEN
        RAISE NOTICE 'AVISO: Tabela sofia_food_analysis já existe - pulando criação';
    ELSE
        RAISE NOTICE 'OK: Tabela sofia_food_analysis será criada';
    END IF;
END $$;

-- ========================================
-- ETAPA 2: CRIAR TABELAS SOFIA SEGURAMENTE
-- ========================================

-- 1. Criar tabela de conversas da Sofia
CREATE TABLE IF NOT EXISTS sofia_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de análises de comida da Sofia
CREATE TABLE IF NOT EXISTS sofia_food_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  foods_detected JSONB NOT NULL DEFAULT '[]',
  total_calories INTEGER,
  sofia_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ETAPA 3: CONFIGURAR RLS SEGURAMENTE
-- ========================================

-- 3. Habilitar RLS nas novas tabelas
ALTER TABLE sofia_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sofia_food_analysis ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas seguras para conversas
DROP POLICY IF EXISTS "sofia_conversations_access" ON sofia_conversations;
CREATE POLICY "sofia_conversations_access" ON sofia_conversations
  FOR ALL USING (auth.uid() = user_id);

-- 5. Criar políticas seguras para análises
DROP POLICY IF EXISTS "sofia_food_access" ON sofia_food_analysis;
CREATE POLICY "sofia_food_access" ON sofia_food_analysis
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- ETAPA 4: VERIFICAÇÃO FINAL
-- ========================================

-- 6. Verificar se as tabelas foram criadas com sucesso
SELECT 
  'SOFIA MIGRATION STATUS' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sofia_conversations') as conversations_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sofia_food_analysis') as food_analysis_table,
  (SELECT COUNT(*) FROM information_schema.table_privileges WHERE table_name = 'sofia_conversations') as conversations_permissions,
  (SELECT COUNT(*) FROM information_schema.table_privileges WHERE table_name = 'sofia_food_analysis') as food_analysis_permissions;

-- 7. Verificar RLS
SELECT 
  'RLS STATUS' as status,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('sofia_conversations', 'sofia_food_analysis');

-- 8. Verificar políticas
SELECT 
  'POLICIES STATUS' as status,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('sofia_conversations', 'sofia_food_analysis');

-- Resultado final
SELECT 'SUCESSO: Sistema Sofia migrado com segurança para versão 32!' as resultado;