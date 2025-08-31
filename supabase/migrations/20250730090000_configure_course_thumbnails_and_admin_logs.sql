-- Idempotent setup for course-thumbnails bucket policies and admin_logs table

-- 1) Ensure course-thumbnails bucket exists (uses existing bucket if present)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Policies for course-thumbnails (create only if not already defined)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'course_thumbs_public_view'
  ) THEN
    CREATE POLICY "course_thumbs_public_view" ON storage.objects
      FOR SELECT USING (bucket_id = 'course-thumbnails');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'course_thumbs_authenticated_upload'
  ) THEN
    CREATE POLICY "course_thumbs_authenticated_upload" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'course-thumbnails' AND auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'course_thumbs_admin_update'
  ) THEN
    CREATE POLICY "course_thumbs_admin_update" ON storage.objects
      FOR UPDATE USING (bucket_id = 'course-thumbnails' AND auth.jwt() ->> 'role' = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'course_thumbs_admin_delete'
  ) THEN
    CREATE POLICY "course_thumbs_admin_delete" ON storage.objects
      FOR DELETE USING (bucket_id = 'course-thumbnails' AND auth.jwt() ->> 'role' = 'admin');
  END IF;
END $$;

-- 3) Admin logs table (idempotent)
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all logs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_logs' AND policyname = 'admin_logs_admin_select'
  ) THEN
    CREATE POLICY "admin_logs_admin_select" ON public.admin_logs
      FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
  END IF;
END $$;

-- Allow authenticated users to insert their own logs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_logs' AND policyname = 'admin_logs_user_insert'
  ) THEN
    CREATE POLICY "admin_logs_user_insert" ON public.admin_logs
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);


