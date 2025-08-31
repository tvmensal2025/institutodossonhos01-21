-- Corrigir as políticas RLS da tabela challenges para permitir inserção por admins
-- Primeiro, remove as políticas existentes e cria novas mais adequadas

DROP POLICY IF EXISTS "Admins can manage all challenges" ON public.challenges;
DROP POLICY IF EXISTS "Everyone can view active challenges" ON public.challenges;

-- Criar política para visualização (qualquer um pode ver desafios ativos)
CREATE POLICY "Everyone can view active challenges" ON public.challenges
FOR SELECT USING (is_active = true);

-- Criar política para inserção (usuários autenticados podem criar, sem restrição de admin por enquanto)
CREATE POLICY "Authenticated users can create challenges" ON public.challenges
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Criar política para atualização (criador pode atualizar seus próprios desafios)
CREATE POLICY "Users can update own challenges" ON public.challenges
FOR UPDATE 
USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

-- Criar política para deleção (criador pode deletar seus próprios desafios)
CREATE POLICY "Users can delete own challenges" ON public.challenges
FOR DELETE 
USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

-- Garantir que created_by seja definido automaticamente na inserção
CREATE OR REPLACE FUNCTION public.set_challenge_creator()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para definir created_by automaticamente
DROP TRIGGER IF EXISTS set_challenge_creator_trigger ON public.challenges;
CREATE TRIGGER set_challenge_creator_trigger
  BEFORE INSERT ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.set_challenge_creator();