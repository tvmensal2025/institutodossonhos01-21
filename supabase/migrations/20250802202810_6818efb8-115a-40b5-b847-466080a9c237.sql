-- Criar constraint única para user_id e session_id na tabela user_sessions
ALTER TABLE public.user_sessions 
ADD CONSTRAINT user_sessions_user_id_session_id_unique 
UNIQUE (user_id, session_id);