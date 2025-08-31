-- Script para verificar e corrigir a query do admin para buscar metas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela goal_categories existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'goal_categories'
) as goal_categories_exists;

-- 2. Verificar estrutura da tabela user_goals
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
ORDER BY ordinal_position;

-- 3. Verificar se há metas pendentes
SELECT COUNT(*) as total_pendentes FROM user_goals WHERE status = 'pendente';

-- 4. Verificar políticas RLS para admin
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_goals';

-- 5. Testar query simples (sem relacionamentos)
SELECT * FROM user_goals WHERE status = 'pendente' ORDER BY created_at DESC;

-- 6. Se goal_categories existir, testar com relacionamento
-- SELECT 
--   ug.*,
--   gc.name as category_name,
--   gc.icon as category_icon,
--   gc.color as category_color
-- FROM user_goals ug
-- LEFT JOIN goal_categories gc ON ug.category_id = gc.id
-- WHERE ug.status = 'pendente'
-- ORDER BY ug.created_at DESC; 