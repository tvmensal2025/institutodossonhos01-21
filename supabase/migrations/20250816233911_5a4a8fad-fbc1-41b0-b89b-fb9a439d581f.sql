-- Corrigir políticas RLS para sessions - permitir super admin fazer tudo

-- 1. Remover políticas existentes problemáticas
DROP POLICY IF EXISTS "sessions_insert_admin" ON public.sessions;
DROP POLICY IF EXISTS "sessions_update_admin" ON public.sessions;
DROP POLICY IF EXISTS "sessions_delete_admin" ON public.sessions;

-- 2. Criar políticas mais específicas para super admin

-- Política para super admin poder inserir sessões
CREATE POLICY "super_admin_can_insert_sessions" ON public.sessions
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_super_admin = true OR (role = 'admin' AND admin_level = 'super'))
  )
);

-- Política para super admin poder atualizar sessões
CREATE POLICY "super_admin_can_update_sessions" ON public.sessions
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_super_admin = true OR (role = 'admin' AND admin_level = 'super'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_super_admin = true OR (role = 'admin' AND admin_level = 'super'))
  )
);

-- Política para super admin poder deletar sessões
CREATE POLICY "super_admin_can_delete_sessions" ON public.sessions
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_super_admin = true OR (role = 'admin' AND admin_level = 'super'))
  )
);

-- 3. Verificar se RLS está habilitado na tabela sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 4. Garantir que o created_by seja definido automaticamente
CREATE OR REPLACE FUNCTION set_session_creator()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para definir created_by automaticamente
DROP TRIGGER IF EXISTS set_session_creator_trigger ON public.sessions;
CREATE TRIGGER set_session_creator_trigger
BEFORE INSERT ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION set_session_creator();

-- 5. Verificar resultado
SELECT 'Políticas criadas para super admin:' as status,
       COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'sessions' 
AND policyname LIKE '%super_admin%';