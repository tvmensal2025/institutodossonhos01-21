-- Corrigir políticas RLS para ai_configurations
DROP POLICY IF EXISTS "Only admins can manage AI configurations" ON ai_configurations;

-- Criar nova política que permite acesso para usuários autenticados
CREATE POLICY "Authenticated users can view AI configurations" 
ON ai_configurations 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can update AI configurations" 
ON ai_configurations 
FOR UPDATE 
TO authenticated 
USING (true);

-- Corrigir políticas RLS para ai_presets  
DROP POLICY IF EXISTS "Only admins can manage AI presets" ON ai_presets;

CREATE POLICY "Authenticated users can view AI presets" 
ON ai_presets 
FOR SELECT 
TO authenticated 
USING (true);