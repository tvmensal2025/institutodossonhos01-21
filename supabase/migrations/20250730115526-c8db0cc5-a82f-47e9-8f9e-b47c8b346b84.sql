-- 1. Atualizar política de admin para incluir o email de teste
DROP POLICY IF EXISTS "Admins can view all user goals" ON user_goals;
DROP POLICY IF EXISTS "Admins can update user goals" ON user_goals;

-- Criar políticas RLS adequadas para user_goals
-- Política para usuários criarem suas próprias metas
CREATE POLICY "Users can create their own goals" 
ON user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para usuários visualizarem suas próprias metas
CREATE POLICY "Users can view their own goals" 
ON user_goals 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias metas
CREATE POLICY "Users can update their own goals" 
ON user_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para admins visualizarem todas as metas
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
      OR email = 'admin@institutodossonhos.com'
      OR email = 'teste@institutodossonhos.com'
      OR email = 'contato@rafael-dias.com'
      OR raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- Política para admins atualizarem metas
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
      OR email = 'admin@institutodossonhos.com'
      OR email = 'teste@institutodossonhos.com'
      OR email = 'contato@rafael-dias.com'
      OR raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- 2. Adicionar foreign key entre user_goals e goal_categories
ALTER TABLE user_goals 
ADD CONSTRAINT fk_user_goals_category 
FOREIGN KEY (category_id) REFERENCES goal_categories(id);