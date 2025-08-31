-- RECUPERAÇÃO COMPLETA DO SISTEMA DE METAS - CORRIGIDA
-- Análise: Sistema estava funcional ontem, vamos garantir que tudo esteja correto

-- 1. GARANTIR ESTRUTURA CORRETA DA TABELA user_goals
-- Verificar se todos os campos necessários existem
DO $$ 
BEGIN
    -- Verificar se a coluna updated_at existe, se não criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_goals' AND column_name = 'updated_at') THEN
        ALTER TABLE user_goals ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Verificar se a coluna evidence_urls existe, se não criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_goals' AND column_name = 'evidence_urls') THEN
        ALTER TABLE user_goals ADD COLUMN evidence_urls TEXT[];
    END IF;
    
    -- Verificar se a coluna notes existe, se não criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_goals' AND column_name = 'notes') THEN
        ALTER TABLE user_goals ADD COLUMN notes TEXT;
    END IF;
    
    -- Verificar se a coluna is_active existe, se não criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_goals' AND column_name = 'is_active') THEN
        ALTER TABLE user_goals ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Verificar se a coluna completion_date existe, se não criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_goals' AND column_name = 'completion_date') THEN
        ALTER TABLE user_goals ADD COLUMN completion_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. CRIAR TRIGGER PARA updated_at SE NÃO EXISTIR
CREATE OR REPLACE FUNCTION update_user_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_goals_updated_at_trigger ON user_goals;
CREATE TRIGGER update_user_goals_updated_at_trigger
    BEFORE UPDATE ON user_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_user_goals_updated_at();

-- 3. LIMPAR E RECRIAR POLÍTICAS RLS DE FORMA ORGANIZADA
-- Remover todas as políticas duplicadas
DROP POLICY IF EXISTS "Admins can view all user goals" ON user_goals;
DROP POLICY IF EXISTS "Admins can update user goals" ON user_goals;
DROP POLICY IF EXISTS "Admins can insert user goals" ON user_goals;
DROP POLICY IF EXISTS "Users can view their own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON user_goals;
DROP POLICY IF EXISTS "Admins can manage all goals" ON user_goals;

-- Criar políticas limpas e funcionais
CREATE POLICY "Users can view own goals" ON user_goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON user_goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON user_goals
FOR DELETE USING (auth.uid() = user_id);

-- Política específica para admins com acesso total
CREATE POLICY "Admins can manage all goals" ON user_goals
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (
            email = 'admin@institutodossonhos.com.br' OR
            email = 'teste@institutodossonhos.com' OR
            email = 'contato@rafael-dias.com' OR
            raw_user_meta_data->>'role' = 'admin'
        )
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (
            email = 'admin@institutodossonhos.com.br' OR
            email = 'teste@institutodossonhos.com' OR
            email = 'contato@rafael-dias.com' OR
            raw_user_meta_data->>'role' = 'admin'
        )
    )
);

-- 4. GARANTIR QUE AS TABELAS RELACIONADAS ESTEJAM CORRETAS
-- Verificar tabela goal_categories (inserir apenas se não existir)
INSERT INTO goal_categories (name, icon, color, is_active)
SELECT 'Peso Ideal', '⚖️', '#FF6B6B', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Peso Ideal');

INSERT INTO goal_categories (name, icon, color, is_active)
SELECT 'Exercícios Diários', '💪', '#4ECDC4', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Exercícios Diários');

INSERT INTO goal_categories (name, icon, color, is_active)
SELECT 'Alimentação Saudável', '🥗', '#95E1D3', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Alimentação Saudável');

INSERT INTO goal_categories (name, icon, color, is_active)
SELECT 'Saúde Mental', '🧠', '#96CEB4', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Saúde Mental');

INSERT INTO goal_categories (name, icon, color, is_active)
SELECT 'Hidratação', '💧', '#06b6d4', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Hidratação');

INSERT INTO goal_categories (name, icon, color, is_active)
SELECT 'Sono Reparador', '😴', '#8b5cf6', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Sono Reparador');

INSERT INTO goal_categories (name, icon, color, is_active)
SELECT 'Resistência Física', '🏃', '#f59e0b', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Resistência Física');

INSERT INTO goal_categories (name, icon, color, is_active)
SELECT 'Flexibilidade', '🤸', '#ec4899', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Flexibilidade');

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_category_id ON user_goals(category_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_created_at ON user_goals(created_at);

-- 6. GARANTIR FOREIGN KEYS CORRETAS
-- Verificar se o foreign key para goal_categories existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_goals_category'
    ) THEN
        ALTER TABLE user_goals 
        ADD CONSTRAINT fk_user_goals_category 
        FOREIGN KEY (category_id) REFERENCES goal_categories(id);
    END IF;
END $$;