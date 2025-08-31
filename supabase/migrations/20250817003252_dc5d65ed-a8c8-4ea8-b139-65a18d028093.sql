-- Atualizar políticas RLS para challenges table para corrigir erro de created_by
DROP POLICY IF EXISTS "challenges_insert_admin" ON challenges;
DROP POLICY IF EXISTS "challenges_update_admin" ON challenges;
DROP POLICY IF EXISTS "challenges_delete_admin" ON challenges;

-- Criar políticas que usam is_admin_user function para admin/super admin
CREATE POLICY "Admins can insert challenges" ON challenges
FOR INSERT
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins can update challenges" ON challenges
FOR UPDATE
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins can delete challenges" ON challenges
FOR DELETE
USING (is_admin_user());

-- Atualizar trigger para preencher created_by automaticamente nos challenges
CREATE OR REPLACE FUNCTION public.set_challenge_creator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;