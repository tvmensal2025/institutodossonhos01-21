-- Corrigir erro 406 removendo política RLS conflitante
DROP POLICY IF EXISTS "Users manage own mission sessions" ON public.daily_mission_sessions;

-- As políticas específicas já existem e são suficientes:
-- Users can view their own mission sessions (SELECT)
-- Users can create their own mission sessions (INSERT) 
-- Users can update their own mission sessions (UPDATE)