-- Corrigir função com sintaxe correta

CREATE OR REPLACE FUNCTION public.test_daily_mission_system(test_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  mission_date DATE,
  session_exists BOOLEAN,
  is_completed BOOLEAN,
  total_points INTEGER,
  streak_days INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Se não especificado, usar o usuário atual
  target_user_id := COALESCE(test_user_id, auth.uid());
  
  -- Criar uma sessão de teste se não existir
  INSERT INTO daily_mission_sessions (user_id, date, is_completed, total_points, streak_days)
  VALUES (target_user_id, CURRENT_DATE, false, 0, 0)
  ON CONFLICT (user_id, date) DO NOTHING;
  
  -- Retornar dados da sessão
  RETURN QUERY
  SELECT 
    dms.user_id,
    dms.date,
    true as session_exists,
    dms.is_completed,
    dms.total_points,
    dms.streak_days
  FROM daily_mission_sessions dms
  WHERE dms.user_id = target_user_id
    AND dms.date = CURRENT_DATE;
END;
$$;