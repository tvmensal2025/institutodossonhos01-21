-- Function to cleanup orphaned user_sessions (sessions assigned to users that don't exist in profiles)
CREATE OR REPLACE FUNCTION cleanup_orphaned_user_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions
  WHERE user_id NOT IN (
    SELECT user_id FROM profiles WHERE user_id IS NOT NULL
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;