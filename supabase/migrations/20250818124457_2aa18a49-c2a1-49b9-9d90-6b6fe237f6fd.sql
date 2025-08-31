-- Add missing columns to fix database schema issues
ALTER TABLE daily_mission_sessions ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'assessment';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS peso_meta_kg NUMERIC;
ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE food_analysis ADD COLUMN IF NOT EXISTS meal_type TEXT;

-- Add missing columns to ai_documents table
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS functionality TEXT;
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create missing functions for session management
CREATE OR REPLACE FUNCTION assign_session_to_all_users(session_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_sessions (user_id, session_id, assigned_at, status)
  SELECT id, session_id_param, now(), 'assigned'
  FROM auth.users;
  
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
  SELECT unnest(user_ids_param), session_id_param, now(), 'assigned';
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;