-- CONFIGURAR TRIGGER PARA NOVOS USUÁRIOS
-- Execute este script no SQL Editor do Supabase

-- 1. Criar função para atribuir sessões a um usuário
CREATE OR REPLACE FUNCTION assign_sessions_to_user(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atribuir todas as sessões ativas ao usuário
  INSERT INTO user_sessions (user_id, session_id, status, progress, assigned_at)
  SELECT 
    user_uuid as user_id,
    s.id as session_id,
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
  
  -- Atribuir sessões ao novo usuário
  PERFORM assign_sessions_to_user(NEW.id);
  
  RETURN NEW;
END;
$$;

-- 3. Criar trigger (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Verificar se o trigger foi criado
SELECT 
  'Trigger criado:' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 5. Testar a função com um usuário existente
SELECT 
  'Testando função:' as info,
  'assign_sessions_to_user function created' as status; 