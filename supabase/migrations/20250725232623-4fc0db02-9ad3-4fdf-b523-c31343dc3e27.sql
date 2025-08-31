-- Corrigir tabela user_custom_saboteurs adicionando constraint única
-- para permitir ON CONFLICT funcionar corretamente

-- Adicionar constraint única se não existir
DO $$
BEGIN
    -- Tentar adicionar constraint única
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_custom_saboteurs_user_saboteur_unique' 
        AND table_name = 'user_custom_saboteurs'
    ) THEN
        -- Primeiro remover duplicatas se existirem
        DELETE FROM user_custom_saboteurs a USING user_custom_saboteurs b
        WHERE a.id > b.id 
        AND a.user_id = b.user_id 
        AND COALESCE(a.saboteur_id, '00000000-0000-0000-0000-000000000000') = COALESCE(b.saboteur_id, '00000000-0000-0000-0000-000000000000');
        
        -- Adicionar constraint única
        ALTER TABLE user_custom_saboteurs 
        ADD CONSTRAINT user_custom_saboteurs_user_saboteur_unique 
        UNIQUE (user_id, saboteur_id);
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao adicionar constraint: %', SQLERRM;
END $$;

-- Corrigir problema do JSON parse em SessionManagement
-- Não é necessário mudança na database, é problema no frontend

-- Melhorar RLS para user_profiles para mostrar informações básicas para admins
CREATE POLICY IF NOT EXISTS "Admins can view basic user info" ON user_profiles 
FOR SELECT 
USING (is_admin_user());

-- Permitir que admins vejam profiles básicos
CREATE POLICY IF NOT EXISTS "Admins can view profiles" ON profiles 
FOR SELECT 
USING (is_admin_user());