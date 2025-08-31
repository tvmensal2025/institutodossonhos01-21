-- Migração para sistema de memória avançado da Sofia
-- Criado em: 2025-01-01
-- Versão: 1.0

-- Tabela para conversas do usuário
CREATE TABLE IF NOT EXISTS user_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID DEFAULT gen_random_uuid(),
    message_role TEXT NOT NULL CHECK (message_role IN ('user', 'assistant')),
    message_content TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela para base de conhecimento da Sofia
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    key_info TEXT NOT NULL,
    value_info JSONB NOT NULL,
    importance_score INTEGER DEFAULT 1 CHECK (importance_score >= 1 AND importance_score <= 10),
    tags TEXT[] DEFAULT '{}',
    source TEXT DEFAULT 'conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_conversations_user_id ON user_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_conversations_conversation_id ON user_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_conversations_created_at ON user_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_user_id ON knowledge_base(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_importance ON knowledge_base(importance_score);

-- RLS (Row Level Security)
ALTER TABLE user_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para user_conversations
CREATE POLICY "Users can view own conversations" ON user_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON user_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON user_conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON user_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para knowledge_base
CREATE POLICY "Users can view own knowledge" ON knowledge_base
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge" ON knowledge_base
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge" ON knowledge_base
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge" ON knowledge_base
    FOR DELETE USING (auth.uid() = user_id);

-- Função para buscar conversas recentes
CREATE OR REPLACE FUNCTION get_recent_conversations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    conversation_id UUID,
    message_role TEXT,
    message_content TEXT,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uc.conversation_id,
        uc.message_role,
        uc.message_content,
        uc.context,
        uc.created_at
    FROM user_conversations uc
    WHERE uc.user_id = p_user_id
    ORDER BY uc.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Função para buscar na base de conhecimento
CREATE OR REPLACE FUNCTION search_knowledge_base(search_terms TEXT[])
RETURNS TABLE (
    id UUID,
    category TEXT,
    key_info TEXT,
    value_info JSONB,
    importance_score INTEGER,
    relevance_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    term TEXT;
    search_query TEXT := '';
BEGIN
    -- Construir query de busca
    FOREACH term IN ARRAY search_terms LOOP
        IF search_query != '' THEN
            search_query := search_query || ' | ';
        END IF;
        search_query := search_query || term;
    END LOOP;

    RETURN QUERY
    SELECT 
        kb.id,
        kb.category,
        kb.key_info,
        kb.value_info,
        kb.importance_score,
        (
            CASE 
                WHEN kb.key_info ILIKE '%' || array_to_string(search_terms, '%') || '%' THEN 3.0
                WHEN array_to_string(kb.tags, ' ') ILIKE '%' || array_to_string(search_terms, '%') || '%' THEN 2.0
                ELSE 1.0
            END * kb.importance_score
        )::FLOAT as relevance_score
    FROM knowledge_base kb
    WHERE auth.uid() = kb.user_id
    AND (
        kb.key_info ILIKE '%' || array_to_string(search_terms, '%') || '%'
        OR kb.tags && search_terms
        OR kb.value_info::text ILIKE '%' || array_to_string(search_terms, '%') || '%'
    )
    ORDER BY relevance_score DESC, kb.importance_score DESC
    LIMIT 20;
END;
$$;

-- Função para adicionar conhecimento
CREATE OR REPLACE FUNCTION add_knowledge(
    p_user_id UUID,
    p_category TEXT,
    p_key_info TEXT,
    p_value_info JSONB,
    p_importance_score INTEGER DEFAULT 5,
    p_tags TEXT[] DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_id UUID;
BEGIN
    -- Verificar se já existe conhecimento similar
    UPDATE knowledge_base 
    SET 
        value_info = p_value_info,
        importance_score = GREATEST(importance_score, p_importance_score),
        tags = array(SELECT DISTINCT unnest(tags || p_tags)),
        updated_at = now()
    WHERE user_id = p_user_id 
    AND category = p_category 
    AND key_info = p_key_info
    RETURNING id INTO new_id;

    -- Se não existe, criar novo
    IF new_id IS NULL THEN
        INSERT INTO knowledge_base (
            user_id, category, key_info, value_info, importance_score, tags
        ) VALUES (
            p_user_id, p_category, p_key_info, p_value_info, p_importance_score, p_tags
        ) RETURNING id INTO new_id;
    END IF;

    RETURN new_id;
END;
$$;

-- Função para limpar conversas antigas (manter apenas últimas 100)
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH conversations_to_keep AS (
        SELECT DISTINCT conversation_id
        FROM user_conversations
        ORDER BY created_at DESC
        LIMIT 100
    )
    DELETE FROM user_conversations
    WHERE conversation_id NOT IN (SELECT conversation_id FROM conversations_to_keep);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger às tabelas
DROP TRIGGER IF EXISTS update_user_conversations_updated_at ON user_conversations;
CREATE TRIGGER update_user_conversations_updated_at
    BEFORE UPDATE ON user_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE user_conversations IS 'Armazena histórico de conversas entre usuários e Sofia';
COMMENT ON TABLE knowledge_base IS 'Base de conhecimento personalizada para cada usuário';
COMMENT ON FUNCTION get_recent_conversations(UUID, INTEGER) IS 'Busca conversas recentes do usuário';
COMMENT ON FUNCTION search_knowledge_base(TEXT[]) IS 'Busca na base de conhecimento com relevância';
COMMENT ON FUNCTION add_knowledge(UUID, TEXT, TEXT, JSONB, INTEGER, TEXT[]) IS 'Adiciona ou atualiza conhecimento';
COMMENT ON FUNCTION cleanup_old_conversations() IS 'Remove conversas antigas para otimização';