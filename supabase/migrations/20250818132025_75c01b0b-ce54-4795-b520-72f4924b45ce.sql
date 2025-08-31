
-- RESOLVER DEFINITIVAMENTE OS PROBLEMAS DE RLS
-- Primeiro, vamos remover TODAS as políticas problemáticas

-- Remover políticas da tabela profiles
DROP POLICY IF EXISTS "profiles_user_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public profile access" ON profiles;

-- Remover políticas da tabela challenges
DROP POLICY IF EXISTS "Anyone can view challenges" ON challenges;
DROP POLICY IF EXISTS "Admins can manage challenges" ON challenges;
DROP POLICY IF EXISTS "Users can view challenges" ON challenges;

-- Remover políticas da tabela challenge_participations
DROP POLICY IF EXISTS "Users can view their own participations" ON challenge_participations;
DROP POLICY IF EXISTS "Users can create participations" ON challenge_participations;
DROP POLICY IF EXISTS "Users can update their participations" ON challenge_participations;

-- Remover políticas da tabela challenge_daily_logs
DROP POLICY IF EXISTS "Users can view their own logs" ON challenge_daily_logs;
DROP POLICY IF EXISTS "Users can create their own logs" ON challenge_daily_logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON challenge_daily_logs;

-- Agora vamos criar políticas SIMPLES e SEM RECURSÃO

-- Política SIMPLES para profiles
CREATE POLICY "profiles_access" ON profiles
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Política SIMPLES para challenges (todos podem ver, só admin pode criar/editar)
CREATE POLICY "challenges_read" ON challenges
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "challenges_write" ON challenges
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'rafael.ids@icloud.com'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'rafael.ids@icloud.com'
  )
);

-- Política SIMPLES para challenge_participations
CREATE POLICY "participations_access" ON challenge_participations
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política SIMPLES para challenge_daily_logs  
CREATE POLICY "logs_access" ON challenge_daily_logs
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM challenge_participations cp 
    WHERE cp.id = challenge_daily_logs.participation_id 
    AND cp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM challenge_participations cp 
    WHERE cp.id = challenge_daily_logs.participation_id 
    AND cp.user_id = auth.uid()
  )
);

-- Garantir que o perfil do rafael existe
INSERT INTO profiles (
  user_id,
  full_name,
  email,
  role,
  admin_level,
  created_at,
  updated_at
)
SELECT 
  id,
  'Rafael Ferreira Dias',
  email,
  'admin',
  'super',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'rafael.ids@icloud.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  admin_level = 'super',
  full_name = 'Rafael Ferreira Dias',
  updated_at = NOW();
