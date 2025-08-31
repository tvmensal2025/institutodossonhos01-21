-- Tabela de sessões
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT,
    instructions TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'draft',
    is_public BOOLEAN DEFAULT false,
    estimated_time INTEGER DEFAULT 30, -- em minutos
    notification_type VARCHAR(50) DEFAULT 'email',
    wheel_tools TEXT[] DEFAULT '{}'::TEXT[]
);

-- Adicionar coluna sent_to se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'sessions'
        AND column_name = 'sent_to'
    ) THEN
        ALTER TABLE public.sessions ADD COLUMN sent_to UUID[] DEFAULT '{}'::UUID[];
    END IF;
    
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'sessions'
        AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.sessions ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Tabela de materiais das sessões
CREATE TABLE IF NOT EXISTS public.session_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'image', 'audio', 'pdf', 'text')),
    title VARCHAR(255),
    content TEXT,
    url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de respostas dos usuários
CREATE TABLE IF NOT EXISTS public.session_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    response TEXT,
    private_comments TEXT,
    completed BOOLEAN DEFAULT false,
    favorite BOOLEAN DEFAULT false,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    feedback TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(session_id, user_id)
);

-- Tabela de notificações de sessões
CREATE TABLE IF NOT EXISTS public.session_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_category ON public.sessions(category);
CREATE INDEX IF NOT EXISTS idx_session_materials_session_id ON public.session_materials(session_id);
CREATE INDEX IF NOT EXISTS idx_session_responses_user_id ON public.session_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_session_responses_session_id ON public.session_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_session_notifications_user_id ON public.session_notifications(user_id);

-- Políticas de segurança RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para sessions
CREATE POLICY "Admins podem fazer tudo" ON public.sessions
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Políticas para session_materials
CREATE POLICY "Admins podem fazer tudo" ON public.session_materials
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Usuários podem ver materiais de suas sessões" ON public.session_materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sessions s
            WHERE s.id = session_id
            AND (auth.uid() = ANY(s.sent_to) OR s.is_public = true)
        )
    );

-- Políticas para session_responses
CREATE POLICY "Admins podem ver todas as respostas" ON public.session_responses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Usuários podem gerenciar suas próprias respostas" ON public.session_responses
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para session_notifications
CREATE POLICY "Admins podem fazer tudo" ON public.session_notifications
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Usuários podem ver e atualizar suas notificações" ON public.session_notifications
    FOR ALL USING (auth.uid() = user_id);

-- Funções auxiliares
CREATE OR REPLACE FUNCTION public.complete_session(
    p_session_id UUID,
    p_user_id UUID,
    p_response TEXT,
    p_rating INTEGER,
    p_feedback TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_response_id UUID;
BEGIN
    -- Atualiza ou insere a resposta
    INSERT INTO public.session_responses (
        session_id,
        user_id,
        response,
        rating,
        feedback,
        completed,
        completed_at
    )
    VALUES (
        p_session_id,
        p_user_id,
        p_response,
        p_rating,
        p_feedback,
        true,
        NOW()
    )
    ON CONFLICT (session_id, user_id)
    DO UPDATE SET
        response = EXCLUDED.response,
        rating = EXCLUDED.rating,
        feedback = EXCLUDED.feedback,
        completed = true,
        completed_at = NOW()
    RETURNING id INTO v_response_id;

    RETURN v_response_id;
END;
$$; 