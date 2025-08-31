-- Remover a versão antiga da função que retorna void
DROP FUNCTION IF EXISTS public.assign_session_to_users(uuid[], uuid);

-- Verificar se a função correta ainda existe
SELECT 'Função assign_session_to_users atualizada!' as status;