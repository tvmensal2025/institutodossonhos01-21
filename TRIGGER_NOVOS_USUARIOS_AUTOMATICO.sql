-- TRIGGER PARA ATRIBUIR SESSÕES AUTOMATICAMENTE PARA NOVOS USUÁRIOS
-- Execute este script no SQL Editor do Supabase

-- 1. Criar função para atribuir sessões a um usuário
CREATE OR REPLACE FUNCTION assign_sessions_to_new_user(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atribuir todas as sessões ativas ao novo usuário
  INSERT INTO user_sessions (user_id, session_id, status, progress, assigned_at)
  SELECT 
    user_uuid,
    s.id,
    'pending' as status,
    0 as progress,
    NOW() as assigned_at
  FROM sessions s
  WHERE s.is_active = true
    AND NOT EXISTS (
      SELECT 1 
      FROM user_sessions us 
      WHERE us.user_id = user_uuid 
        AND us.session_id = s.id
    );
END;
$$;

-- 2. Criar trigger para novos usuários
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar profile para o novo usuário
  INSERT INTO profiles (user_id, full_name, email, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.created_at,
    NEW.updated_at
  );
  
  -- Atribuir role 'user' por padrão
  INSERT INTO user_roles (user_id, role, assigned_at)
  VALUES (NEW.id, 'user', NOW());
  
  -- Atribuir sessões ativas ao novo usuário
  PERFORM assign_sessions_to_new_user(NEW.id);
  
  RETURN NEW;
END;
$$;

-- 3. Criar trigger na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Verificar se o trigger foi criado
SELECT 
  'Trigger criado:' as info,
  'Novos usuários receberão sessões automaticamente' as status;

-- 5. Testar a função com um usuário existente (opcional)
-- SELECT assign_sessions_to_new_user('ID_DO_USUARIO_AQUI'); 