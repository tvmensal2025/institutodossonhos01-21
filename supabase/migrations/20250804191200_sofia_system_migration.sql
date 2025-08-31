-- MIGRAÇÃO SEGURA DO SISTEMA SOFIA DA VERSÃO 76 PARA 32
-- Data: 2025-08-04 19:12:00
-- Baseado no arquivo SOFIA_SIMPLES_SEM_ERRO.sql que funciona 100%

-- ========================================
-- SISTEMA SOFIA - MIGRAÇÃO SEGURA
-- ========================================

-- 1. Criar tabela de conversas da Sofia (se não existir)
CREATE TABLE IF NOT EXISTS sofia_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de análises de comida da Sofia (se não existir)
CREATE TABLE IF NOT EXISTS sofia_food_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  foods_detected JSONB NOT NULL DEFAULT '[]',
  total_calories INTEGER,
  sofia_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS nas tabelas Sofia
ALTER TABLE sofia_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sofia_food_analysis ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança para conversas
DROP POLICY IF EXISTS "sofia_conversations_access" ON sofia_conversations;
CREATE POLICY "sofia_conversations_access" ON sofia_conversations
  FOR ALL USING (auth.uid() = user_id);

-- 5. Criar políticas de segurança para análises
DROP POLICY IF EXISTS "sofia_food_access" ON sofia_food_analysis;
CREATE POLICY "sofia_food_access" ON sofia_food_analysis
  FOR ALL USING (auth.uid() = user_id);

-- 6. Adicionar comentários para documentação
-- Garantir coluna messages existe mesmo que a tabela tenha sido criada sem ela em versões anteriores
ALTER TABLE sofia_conversations ADD COLUMN IF NOT EXISTS messages JSONB NOT NULL DEFAULT '[]';
COMMENT ON TABLE sofia_conversations IS 'Conversas do usuário com a IA Sofia - Migrado da versão 76';
COMMENT ON TABLE sofia_food_analysis IS 'Análises de alimentos feitas pela Sofia - Migrado da versão 76';
COMMENT ON COLUMN sofia_conversations.messages IS 'Array JSON com histórico completo da conversa';
COMMENT ON COLUMN sofia_food_analysis.foods_detected IS 'Array JSON com alimentos detectados na imagem';
COMMENT ON COLUMN sofia_food_analysis.sofia_analysis IS 'Análise textual da Sofia sobre os alimentos';