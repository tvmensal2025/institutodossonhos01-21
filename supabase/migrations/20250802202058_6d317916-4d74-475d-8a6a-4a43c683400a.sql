-- Adicionar campo selected_session_id na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN selected_session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL;