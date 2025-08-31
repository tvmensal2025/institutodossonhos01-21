-- 🔧 RECONSTRUÇÃO COMPLETA - PARTE 3: RECRIAR POLÍTICAS RLS
-- Corrigindo todos os problemas de segurança identificados

-- 1. RECRIAR POLÍTICAS PARA PROFILES
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 2. RECRIAR POLÍTICAS PARA USER_SESSIONS
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create sessions for themselves" ON public.user_sessions;
CREATE POLICY "Users can create sessions for themselves" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all user sessions" ON public.user_sessions;
CREATE POLICY "Admins can manage all user sessions" ON public.user_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 3. RECRIAR POLÍTICAS PARA SESSIONS
CREATE POLICY "Everyone can view active sessions" ON public.sessions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage sessions" ON public.sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 4. RECRIAR POLÍTICAS PARA COURSES
CREATE POLICY "Everyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 5. RECRIAR POLÍTICAS PARA COURSE_MODULES
CREATE POLICY "Everyone can view course modules" ON public.course_modules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage course modules" ON public.course_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 6. RECRIAR POLÍTICAS PARA LESSONS
CREATE POLICY "Everyone can view lessons" ON public.lessons
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 7. HABILITAR RLS EM TABELAS QUE ESTAVAM DESABILITADAS
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_mission_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_diary ENABLE ROW LEVEL SECURITY;

-- Idempotência: dropar antes de criar
DROP POLICY IF EXISTS "Users manage own activity categories" ON public.activity_categories;
CREATE POLICY "Users manage own activity categories" ON public.activity_categories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own activity sessions" ON public.activity_sessions;
CREATE POLICY "Users manage own activity sessions" ON public.activity_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own assessments" ON public.assessments;
CREATE POLICY "Users manage own assessments" ON public.assessments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own mission sessions" ON public.daily_mission_sessions;
CREATE POLICY "Users manage own mission sessions" ON public.daily_mission_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own daily responses" ON public.daily_responses;
CREATE POLICY "Users manage own daily responses" ON public.daily_responses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own missions" ON public.daily_missions;
CREATE POLICY "Users manage own missions" ON public.daily_missions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own health diary" ON public.health_diary;
CREATE POLICY "Users manage own health diary" ON public.health_diary
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage AI configurations" ON public.ai_configurations;
CREATE POLICY "Admins manage AI configurations" ON public.ai_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 9. VERIFICAÇÃO FINAL
SELECT 'POLÍTICAS RLS RESTAURADAS!' as status,
       COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';