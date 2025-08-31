-- Criar política RLS para admins poderem visualizar todas as metas
CREATE POLICY "Admins can view all user goals" 
ON user_goals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      email LIKE '%admin%' 
      OR email = 'admin@institutodossonhos.com.br'
      OR raw_user_meta_data->>'role' = 'admin'
      OR email = 'contato@rafael-dias.com'
    )
  )
);

-- Criar política RLS para admins poderem atualizar metas
CREATE POLICY "Admins can update user goals" 
ON user_goals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      email LIKE '%admin%' 
      OR email = 'admin@institutodossonhos.com.br'
      OR raw_user_meta_data->>'role' = 'admin'
      OR email = 'contato@rafael-dias.com'
    )
  )
);