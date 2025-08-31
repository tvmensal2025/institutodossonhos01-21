-- GARANTIR CONTROLE TOTAL DO ADMIN SOBRE ATRIBUIÇÃO DE SESSÕES

-- 1. Verificar se há triggers automáticos que atribuem sessões
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table IN ('profiles', 'sessions', 'user_sessions');

-- 2. Remover qualquer trigger que atribua sessões automaticamente
DROP TRIGGER IF EXISTS assign_sessions_to_new_user ON auth.users;
DROP TRIGGER IF EXISTS auto_assign_sessions ON profiles;

-- 3. Garantir que user_sessions só mostra sessões explicitamente atribuídas
-- Verificar política atual
SELECT policyname, cmd, permissive, roles, with_check, qual 
FROM pg_policies 
WHERE tablename = 'user_sessions' AND schemaname = 'public';

-- 4. Criar função para limpar sessões não atribuídas explicitamente (se necessário)
CREATE OR REPLACE FUNCTION remove_auto_assigned_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta função pode ser usada para limpar sessões que foram atribuídas automaticamente
  -- Por enquanto apenas logamos para verificar
  RAISE NOTICE 'Função criada para controle manual de sessões';
END;
$$;

-- 5. Verificar quantas sessões cada usuário tem atualmente
SELECT 
  p.full_name,
  p.email,
  COUNT(us.id) as total_sessoes_atribuidas
FROM profiles p
LEFT JOIN user_sessions us ON p.user_id = us.user_id
GROUP BY p.user_id, p.full_name, p.email
ORDER BY p.full_name;