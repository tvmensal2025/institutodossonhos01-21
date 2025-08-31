-- Atualizar políticas RLS para challenges table para corrigir erro de created_by
DROP POLICY IF EXISTS "challenges_insert_admin" ON challenges;
DROP POLICY IF EXISTS "challenges_update_admin" ON challenges;
DROP POLICY IF EXISTS "challenges_delete_admin" ON challenges;

-- Criar políticas que usam is_admin_user function para admin/super admin
CREATE POLICY "Admins can insert challenges" ON challenges
FOR INSERT
WITH CHECK (is_admin_user());

CREATE POLICY "Admins can update challenges" ON challenges
FOR UPDATE
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins can delete challenges" ON challenges
FOR DELETE
USING (is_admin_user());