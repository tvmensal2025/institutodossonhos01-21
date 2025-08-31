-- Função para verificar se um usuário tem acesso a uma sessão (usar funções já existentes)
-- A função is_admin já existe na migração anterior

-- Função para verificar se um usuário tem acesso a uma sessão
CREATE OR REPLACE FUNCTION public.has_session_access(p_session_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = p_session_id
        AND (
            p_user_id = ANY(s.sent_to)
            OR s.is_public = true
            OR public.is_admin()
        )
    );
END;
$$;

-- Função para enviar uma sessão para usuários
CREATE OR REPLACE FUNCTION public.send_session_to_users(
    p_session_id UUID,
    p_user_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem enviar sessões';
    END IF;

    -- Atualizar a lista de usuários da sessão
    UPDATE public.sessions
    SET sent_to = array_cat(sent_to, p_user_ids)
    WHERE id = p_session_id;

    -- Criar notificações para os usuários
    INSERT INTO public.session_notifications (
        session_id,
        user_id,
        type,
        title,
        message
    )
    SELECT 
        p_session_id,
        user_id,
        'session_assigned',
        'Nova Sessão Disponível',
        'Uma nova sessão foi atribuída a você'
    FROM unnest(p_user_ids) AS user_id;
END;
$$;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.session_notifications
    SET read = true
    WHERE id = p_notification_id
    AND user_id = auth.uid();
END;
$$;

-- Função para obter estatísticas de sessões de um usuário
CREATE OR REPLACE FUNCTION public.get_user_session_stats(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    total_sessions BIGINT,
    completed_sessions BIGINT,
    in_progress_sessions BIGINT,
    pending_sessions BIGINT,
    average_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN sr.completed THEN s.id END) as completed_sessions,
        COUNT(DISTINCT CASE WHEN sr.started_at IS NOT NULL AND NOT sr.completed THEN s.id END) as in_progress_sessions,
        COUNT(DISTINCT CASE WHEN sr.started_at IS NULL THEN s.id END) as pending_sessions,
        COALESCE(AVG(sr.rating) FILTER (WHERE sr.rating IS NOT NULL), 0) as average_rating
    FROM public.sessions s
    LEFT JOIN public.session_responses sr ON s.id = sr.session_id AND sr.user_id = p_user_id
    WHERE p_user_id = ANY(s.sent_to) OR s.is_public = true;
END;
$$; 