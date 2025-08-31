-- Corrigir problemas no gerenciamento de metas (versão corrigida)

-- 1. Criar foreign key entre user_goals e challenges se não existir
ALTER TABLE user_goals 
DROP CONSTRAINT IF EXISTS fk_user_goals_challenge;

ALTER TABLE user_goals 
ADD CONSTRAINT fk_user_goals_challenge 
FOREIGN KEY (challenge_id) REFERENCES challenges(id);

-- 2. Verificar e corrigir políticas RLS para user_goals
-- Primeiro remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Admins can view all user goals" ON user_goals;
DROP POLICY IF EXISTS "Admins can update user goals" ON user_goals;

-- 3. Recriar políticas para admin com lógica simplificada
CREATE POLICY "Admins can view all user goals" 
ON user_goals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      email = 'admin@institutodossonhos.com.br'
      OR email = 'teste@institutodossonhos.com'
      OR email = 'contato@rafael-dias.com'
      OR raw_user_meta_data->>'role' = 'admin'
    )
  )
);

CREATE POLICY "Admins can update user goals" 
ON user_goals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      email = 'admin@institutodossonhos.com.br'
      OR email = 'teste@institutodossonhos.com'
      OR email = 'contato@rafael-dias.com'
      OR raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- 4. Política para admins inserirem metas
CREATE POLICY "Admins can insert user goals" 
ON user_goals 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      email = 'admin@institutodossonhos.com.br'
      OR email = 'teste@institutodossonhos.com'
      OR email = 'contato@rafael-dias.com'
      OR raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- 5. Inserir algumas categorias de metas (sem ON CONFLICT)
INSERT INTO goal_categories (id, name, icon, color, is_active) 
SELECT gen_random_uuid(), 'Perda de Peso', '⚖️', '#FF6B6B', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Perda de Peso');

INSERT INTO goal_categories (id, name, icon, color, is_active) 
SELECT gen_random_uuid(), 'Exercícios', '💪', '#4ECDC4', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Exercícios');

INSERT INTO goal_categories (id, name, icon, color, is_active) 
SELECT gen_random_uuid(), 'Alimentação', '🥗', '#45B7D1', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Alimentação');

INSERT INTO goal_categories (id, name, icon, color, is_active) 
SELECT gen_random_uuid(), 'Saúde Mental', '🧠', '#96CEB4', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Saúde Mental');

INSERT INTO goal_categories (id, name, icon, color, is_active) 
SELECT gen_random_uuid(), 'Hábitos', '✅', '#FFEAA7', true
WHERE NOT EXISTS (SELECT 1 FROM goal_categories WHERE name = 'Hábitos');

-- 6. Inserir uma meta de teste para verificar se o sistema funciona
INSERT INTO user_goals (
  user_id, 
  title, 
  description, 
  target_value, 
  unit, 
  difficulty, 
  target_date,
  status,
  estimated_points,
  category_id
) 
SELECT 
  'd87c26cd-b9e8-40a8-ae82-afed7dedf7cb',
  'Meta de Teste - Perder 5kg',
  'Meta criada para testar o sistema administrativo',
  5,
  'kg',
  'medio',
  CURRENT_DATE + INTERVAL '30 days',
  'pendente',
  50,
  (SELECT id FROM goal_categories WHERE name = 'Perda de Peso' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM user_goals 
  WHERE user_id = 'd87c26cd-b9e8-40a8-ae82-afed7dedf7cb' 
  AND title = 'Meta de Teste - Perder 5kg'
);