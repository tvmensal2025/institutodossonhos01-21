-- Add missing columns to existing tables only
ALTER TABLE daily_mission_sessions ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE food_analysis ADD COLUMN IF NOT EXISTS meal_type TEXT;

-- Add missing columns to ai_documents table
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS functionality TEXT;
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create user_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'assigned',
  progress INTEGER DEFAULT 0,
  notes TEXT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'assessment',
  tools JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create missing functions for session management
CREATE OR REPLACE FUNCTION assign_session_to_all_users(session_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_sessions (user_id, session_id, assigned_at, status)
  SELECT id, session_id_param, now(), 'assigned'
  FROM auth.users
  ON CONFLICT DO NOTHING;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION assign_session_to_users(session_id_param UUID, user_ids_param UUID[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_sessions (user_id, session_id, assigned_at, status)
  SELECT unnest(user_ids_param), session_id_param, now(), 'assigned'
  ON CONFLICT DO NOTHING;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;