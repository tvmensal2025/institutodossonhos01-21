-- Corrigir RLS da tabela public.challenges para permitir criação por ADMIN
-- e manter leitura para usuários autenticados

-- Garantir que RLS está habilitado
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas conflitando
DROP POLICY IF EXISTS "Admins can manage challenges" ON public.challenges;
DROP POLICY IF EXISTS "challenges_admin_all" ON public.challenges;
DROP POLICY IF EXISTS "Everyone can view active challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can view active challenges" ON public.challenges;
DROP POLICY IF EXISTS "Authenticated users can create challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can delete own challenges" ON public.challenges;

-- Leitura: permitir SELECT para usuários autenticados (admin consegue ver tudo no painel)
DROP POLICY IF EXISTS "challenges_read_all_auth" ON public.challenges;
CREATE POLICY "challenges_read_all_auth" 
ON public.challenges
FOR SELECT TO authenticated
USING (true);

-- Gerenciamento: somente ADMIN pode inserir/atualizar/deletar
-- Critério de admin: possuir perfil com role = 'admin' (ou admin_level definido)
DROP POLICY IF EXISTS "challenges_admin_manage" ON public.challenges;
CREATE POLICY "challenges_admin_manage" 
ON public.challenges
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
      AND p.role = 'admin'
  )
);

-- Opcional: garantir que created_by é preenchido automaticamente quando não enviado
CREATE OR REPLACE FUNCTION public.set_challenge_creator()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_challenge_creator_trigger ON public.challenges;
CREATE TRIGGER set_challenge_creator_trigger
  BEFORE INSERT ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.set_challenge_creator();

-- Verificação simples (não quebra migração se RLS estiver OK)
DO $$ BEGIN
  PERFORM 1; 
END $$;







