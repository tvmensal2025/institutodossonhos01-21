-- Primeiro, vamos verificar e atualizar o perfil do rafael.ids@icloud.com como super admin
UPDATE profiles 
SET 
  role = 'admin',
  admin_level = 'super',
  is_admin = true,
  is_super_admin = true
WHERE email = 'rafael.ids@icloud.com';

-- Criar política para super admin rafael.ids@icloud.com ter acesso total aos desafios
DROP POLICY IF EXISTS "Super admin can manage all challenges" ON challenges;
CREATE POLICY "Super admin can manage all challenges" ON challenges
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = 'rafael.ids@icloud.com'
    AND profiles.admin_level = 'super'
  )
);

-- Política para super admin gerenciar participações em desafios
DROP POLICY IF EXISTS "Super admin can manage all challenge participations" ON challenge_participations;
CREATE POLICY "Super admin can manage all challenge participations" ON challenge_participations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = 'rafael.ids@icloud.com'
    AND profiles.admin_level = 'super'
  ) OR user_id = auth.uid()
);

-- Política para super admin gerenciar logs de desafios
DROP POLICY IF EXISTS "Super admin can manage all challenge logs" ON challenge_daily_logs;
CREATE POLICY "Super admin can manage all challenge logs" ON challenge_daily_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = 'rafael.ids@icloud.com'
    AND profiles.admin_level = 'super'
  ) OR EXISTS (
    SELECT 1 FROM challenge_participations
    WHERE challenge_participations.id = challenge_daily_logs.participation_id 
    AND challenge_participations.user_id = auth.uid()
  )
);

-- Política para super admin gerenciar todas as tabelas importantes
-- Profiles
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON profiles;
CREATE POLICY "Super admin can manage all profiles" ON profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.email = 'rafael.ids@icloud.com'
    AND p.admin_level = 'super'
  ) OR user_id = auth.uid()
);

-- Courses
DROP POLICY IF EXISTS "Super admin can manage all courses" ON courses;
CREATE POLICY "Super admin can manage all courses" ON courses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = 'rafael.ids@icloud.com'
    AND profiles.admin_level = 'super'
  ) OR is_published = true
);

-- Course modules
DROP POLICY IF EXISTS "Super admin can manage all course modules" ON course_modules;
CREATE POLICY "Super admin can manage all course modules" ON course_modules
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = 'rafael.ids@icloud.com'
    AND profiles.admin_level = 'super'
  ) OR is_published = true
);

-- Course lessons
DROP POLICY IF EXISTS "Super admin can manage all course lessons" ON course_lessons;
CREATE POLICY "Super admin can manage all course lessons" ON course_lessons
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = 'rafael.ids@icloud.com'
    AND profiles.admin_level = 'super'
  )
);

-- Community posts
DROP POLICY IF EXISTS "Super admin can manage all community posts" ON community_posts;
CREATE POLICY "Super admin can manage all community posts" ON community_posts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = 'rafael.ids@icloud.com'
    AND profiles.admin_level = 'super'
  ) OR user_id = auth.uid() OR is_published = true
);

-- Community comments
DROP POLICY IF EXISTS "Super admin can manage all community comments" ON community_comments;
CREATE POLICY "Super admin can manage all community comments" ON community_comments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = 'rafael.ids@icloud.com'
    AND profiles.admin_level = 'super'
  ) OR user_id = auth.uid()
);

-- Criar função para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = 'rafael.ids@icloud.com'
    AND profiles.admin_level = 'super'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;