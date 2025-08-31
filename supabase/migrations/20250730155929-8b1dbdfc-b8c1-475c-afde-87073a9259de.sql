-- Fix missing columns and RLS policies

-- 1. Add missing is_active column to course_modules
ALTER TABLE public.course_modules 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Add RLS policies for course_modules
CREATE POLICY "Admins can manage course modules" 
ON public.course_modules 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Everyone can view course modules" 
ON public.course_modules 
FOR SELECT 
USING (true);

-- 3. Add RLS policies for lessons
CREATE POLICY "Admins can manage lessons" 
ON public.lessons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 4. Fix challenge_participations - add unique constraint to prevent conflicts
ALTER TABLE public.challenge_participations 
DROP CONSTRAINT IF EXISTS unique_user_challenge;

ALTER TABLE public.challenge_participations 
ADD CONSTRAINT unique_user_challenge 
UNIQUE (user_id, challenge_id);

-- 5. Enable RLS on tables that need it
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;