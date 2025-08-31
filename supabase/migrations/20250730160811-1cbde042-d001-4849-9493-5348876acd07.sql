-- Add missing course_id column to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS course_id UUID;