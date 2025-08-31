-- Fix saboteur-related RLS policies to include WITH CHECK for write operations
-- Idempotent: drop/recreate policies only; do not remove existing user policies

-- Ensure RLS is enabled on involved tables (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='custom_saboteurs') THEN
    EXECUTE 'ALTER TABLE public.custom_saboteurs ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_custom_saboteurs') THEN
    EXECUTE 'ALTER TABLE public.user_custom_saboteurs ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='sessions') THEN
    EXECUTE 'ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_sessions') THEN
    EXECUTE 'ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- custom_saboteurs: admins manage; users can read active
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='custom_saboteurs') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage custom saboteurs" ON public.custom_saboteurs';
    EXECUTE 'CREATE POLICY "Admins can manage custom saboteurs" ON public.custom_saboteurs
              FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user())';

    -- Keep user read policy permissive for active records
    EXECUTE 'DROP POLICY IF EXISTS "Users can view active custom saboteurs" ON public.custom_saboteurs';
    EXECUTE 'CREATE POLICY "Users can view active custom saboteurs" ON public.custom_saboteurs
              FOR SELECT USING (is_active = true)';
  END IF;
END $$;

-- user_custom_saboteurs: users manage own; admins can view all
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_custom_saboteurs') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their own saboteur relationships" ON public.user_custom_saboteurs';
    EXECUTE 'CREATE POLICY "Users can manage their own saboteur relationships" ON public.user_custom_saboteurs
              FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all saboteur relationships" ON public.user_custom_saboteurs';
    EXECUTE 'CREATE POLICY "Admins can view all saboteur relationships" ON public.user_custom_saboteurs
              FOR SELECT USING (public.is_admin_user())';
  END IF;
END $$;

-- sessions: admins manage; users can view active
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='sessions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage sessions" ON public.sessions';
    EXECUTE 'CREATE POLICY "Admins can manage sessions" ON public.sessions
              FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user())';

    EXECUTE 'DROP POLICY IF EXISTS "Users can view active sessions" ON public.sessions';
    EXECUTE 'CREATE POLICY "Users can view active sessions" ON public.sessions
              FOR SELECT USING (is_active = true)';
  END IF;
END $$;

-- user_sessions: users manage own; admins manage all
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_sessions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions';
    EXECUTE 'CREATE POLICY "Users can view their own sessions" ON public.user_sessions
              FOR SELECT USING (auth.uid() = user_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions';
    EXECUTE 'CREATE POLICY "Users can update their own sessions" ON public.user_sessions
              FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all user sessions" ON public.user_sessions';
    EXECUTE 'CREATE POLICY "Admins can manage all user sessions" ON public.user_sessions
              FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user())';
  END IF;
END $$;


