-- ========================================
-- MIGRAÇÃO DOS ESSENCIAIS DA VERSÃO 76
-- Apenas o que realmente falta na versão 32
-- ========================================

-- ========================================
-- 1. TABELA USER_ASSESSMENTS (ÚNICA DIFERENÇA IMPORTANTE)
-- ========================================

-- Criar tabela para armazenar avaliações das rodas (da versão 76)
CREATE TABLE IF NOT EXISTS user_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('abundance', 'competency', 'health', 'life')),
  scores JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  areas JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_type ON user_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_user_assessments_completed_at ON user_assessments(completed_at);

-- Política RLS para permitir que usuários vejam apenas suas próprias avaliações
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own assessments" ON user_assessments;
CREATE POLICY "Users can view their own assessments" ON user_assessments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own assessments" ON user_assessments;
CREATE POLICY "Users can insert their own assessments" ON user_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own assessments" ON user_assessments;
CREATE POLICY "Users can update their own assessments" ON user_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_assessments_updated_at ON user_assessments;
CREATE TRIGGER update_user_assessments_updated_at
  BEFORE UPDATE ON user_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_user_assessments_updated_at();

-- ========================================
-- 2. MELHORAR SISTEMA SOFIA (SE AINDA NÃO EXISTIR)
-- ========================================

-- Criar tabelas Sofia com todas as funcionalidades da versão 76
CREATE TABLE IF NOT EXISTS sofia_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance Sofia
CREATE INDEX IF NOT EXISTS idx_sofia_conversations_user_id ON sofia_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_sofia_conversations_updated_at ON sofia_conversations(updated_at);

-- Política RLS para segurança Sofia
ALTER TABLE sofia_conversations ENABLE ROW LEVEL SECURITY;

-- Políticas Sofia detalhadas (como na versão 76)
DROP POLICY IF EXISTS "Users can view their own sofia conversations" ON sofia_conversations;
CREATE POLICY "Users can view their own sofia conversations" ON sofia_conversations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own sofia conversations" ON sofia_conversations;
CREATE POLICY "Users can insert their own sofia conversations" ON sofia_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sofia conversations" ON sofia_conversations;
CREATE POLICY "Users can update their own sofia conversations" ON sofia_conversations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sofia conversations" ON sofia_conversations;
CREATE POLICY "Users can delete their own sofia conversations" ON sofia_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente Sofia
CREATE OR REPLACE FUNCTION update_sofia_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at Sofia
DROP TRIGGER IF EXISTS update_sofia_conversations_updated_at ON sofia_conversations;
CREATE TRIGGER update_sofia_conversations_updated_at
  BEFORE UPDATE ON sofia_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_sofia_conversations_updated_at();

-- ========================================
-- 3. VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se tudo foi criado corretamente
SELECT 
  'MIGRAÇÃO VERSÃO 76 CONCLUÍDA!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_assessments') as user_assessments_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sofia_conversations') as sofia_conversations_table,
  (SELECT COUNT(*) FROM information_schema.table_privileges WHERE table_name = 'user_assessments') as assessments_permissions,
  (SELECT COUNT(*) FROM information_schema.table_privileges WHERE table_name = 'sofia_conversations') as sofia_permissions;

-- Mostrar políticas criadas
SELECT 
  'POLÍTICAS RLS' as info,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('user_assessments', 'sofia_conversations')
ORDER BY tablename, policyname;

SELECT 'SUCESSO: Todos os essenciais da versão 76 foram migrados para a versão 32!' as resultado;