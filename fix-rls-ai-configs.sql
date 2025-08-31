-- Corrigir políticas RLS para ai_configurations
-- Permitir inserção e atualização para todos os usuários autenticados

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON ai_configurations;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON ai_configurations;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON ai_configurations;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON ai_configurations;

-- Criar políticas permissivas para desenvolvimento
CREATE POLICY "Enable all operations for authenticated users" ON ai_configurations
    FOR ALL USING (auth.role() = 'authenticated');

-- Ou se preferir políticas mais específicas:
-- CREATE POLICY "Enable insert for authenticated users" ON ai_configurations
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Enable select for authenticated users" ON ai_configurations
--     FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable update for authenticated users" ON ai_configurations
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable delete for authenticated users" ON ai_configurations
--     FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'ai_configurations'; 