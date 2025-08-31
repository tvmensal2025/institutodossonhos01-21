-- Add missing content column to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS content TEXT;