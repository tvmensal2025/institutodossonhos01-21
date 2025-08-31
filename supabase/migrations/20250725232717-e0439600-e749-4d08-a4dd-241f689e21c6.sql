-- Corrigir tabela user_custom_saboteurs adicionando constraint única
-- para permitir ON CONFLICT funcionar corretamente

-- Primeiro remover duplicatas se existirem
DELETE FROM user_custom_saboteurs a USING user_custom_saboteurs b
WHERE a.id > b.id 
AND a.user_id = b.user_id 
AND COALESCE(a.saboteur_id, '00000000-0000-0000-0000-000000000000') = COALESCE(b.saboteur_id, '00000000-0000-0000-0000-000000000000');

-- Adicionar constraint única se não existir
ALTER TABLE user_custom_saboteurs 
ADD CONSTRAINT user_custom_saboteurs_user_saboteur_unique 
UNIQUE (user_id, saboteur_id);

-- Permitir que admins vejam profiles básicos
DROP POLICY IF EXISTS "Admins can view profiles" ON profiles;
CREATE POLICY "Admins can view profiles" ON profiles 
FOR SELECT 
USING (is_admin_user());

-- Melhorar RLS para user_profiles para mostrar informações básicas para admins  
DROP POLICY IF EXISTS "Admins can view basic user info" ON user_profiles;
CREATE POLICY "Admins can view basic user info" ON user_profiles 
FOR SELECT 
USING (is_admin_user());