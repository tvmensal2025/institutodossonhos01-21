-- Add missing thumbnail_url column to course_modules table
ALTER TABLE public.course_modules 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;