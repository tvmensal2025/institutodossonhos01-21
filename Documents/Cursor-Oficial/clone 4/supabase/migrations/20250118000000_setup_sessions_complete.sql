-- =====================================================
-- MIGRAÇÃO COMPLETA PARA SISTEMA DE SESSÕES
-- =====================================================

-- Tabela de sessões (se não existir)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    pdf_url TEXT,
    instructions TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'draft',
    is_public BOOLEAN DEFAULT false,
    estimated_time INTEGER DEFAULT 30,
    notification_type VARCHAR(50) DEFAULT 'email',
    wheel_tools TEXT[] DEFAULT '{}'::TEXT[],
    assigned_to UUID REFERENCES auth.users(id),
    send_type VARCHAR(20) DEFAULT 'immediate',
    scheduled_date TIMESTAMP WITH TIME ZONE
);

-- Adicionar coluna assigned_to se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'sessions'
        AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE public.sessions ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
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

-- Tabela de respostas das rodas de avaliação
CREATE TABLE IF NOT EXISTS public.wheel_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    wheel_type VARCHAR(50) NOT NULL,
    responses JSONB NOT NULL DEFAULT '{}',
    reflection_answers JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, session_id, wheel_type)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_category ON public.sessions(category);
CREATE INDEX IF NOT EXISTS idx_sessions_assigned_to ON public.sessions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_session_materials_session_id ON public.session_materials(session_id);
CREATE INDEX IF NOT EXISTS idx_session_responses_user_id ON public.session_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_session_responses_session_id ON public.session_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_session_notifications_user_id ON public.session_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wheel_responses_user_id ON public.wheel_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_wheel_responses_session_id ON public.wheel_responses(session_id);

-- Políticas de segurança RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_responses ENABLE ROW LEVEL SECURITY;

-- Drop políticas existentes se houver
DROP POLICY IF EXISTS "Admins podem fazer tudo" ON public.sessions;
DROP POLICY IF EXISTS "Usuários podem ver suas sessões" ON public.sessions;
DROP POLICY IF EXISTS "Admins podem fazer tudo" ON public.session_materials;
DROP POLICY IF EXISTS "Usuários podem ver materiais de suas sessões" ON public.session_materials;
DROP POLICY IF EXISTS "Admins podem ver todas as respostas" ON public.session_responses;
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias respostas" ON public.session_responses;
DROP POLICY IF EXISTS "Admins podem fazer tudo" ON public.session_notifications;
DROP POLICY IF EXISTS "Usuários podem ver e atualizar suas notificações" ON public.session_notifications;
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias respostas" ON public.wheel_responses;
DROP POLICY IF EXISTS "Admins podem ver todas as respostas" ON public.wheel_responses;

-- Políticas para sessions
CREATE POLICY "Admins podem fazer tudo" ON public.sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (
                raw_user_meta_data->>'role' = 'admin'
                OR raw_user_meta_data->>'isAdmin' = 'true'
            )
        )
    );

CREATE POLICY "Usuários podem ver suas sessões" ON public.sessions
    FOR SELECT USING (
        assigned_to = auth.uid() OR is_public = true
    );

-- Políticas para session_materials
CREATE POLICY "Admins podem fazer tudo" ON public.session_materials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (
                raw_user_meta_data->>'role' = 'admin'
                OR raw_user_meta_data->>'isAdmin' = 'true'
            )
        )
    );

CREATE POLICY "Usuários podem ver materiais de suas sessões" ON public.session_materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sessions s
            WHERE s.id = session_id
            AND (assigned_to = auth.uid() OR s.is_public = true)
        )
    );

-- Políticas para session_responses
CREATE POLICY "Admins podem ver todas as respostas" ON public.session_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (
                raw_user_meta_data->>'role' = 'admin'
                OR raw_user_meta_data->>'isAdmin' = 'true'
            )
        )
    );

CREATE POLICY "Usuários podem gerenciar suas próprias respostas" ON public.session_responses
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para session_notifications
CREATE POLICY "Admins podem fazer tudo" ON public.session_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (
                raw_user_meta_data->>'role' = 'admin'
                OR raw_user_meta_data->>'isAdmin' = 'true'
            )
        )
    );

CREATE POLICY "Usuários podem ver e atualizar suas notificações" ON public.session_notifications
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para wheel_responses
CREATE POLICY "Usuários podem gerenciar suas próprias respostas" ON public.wheel_responses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as respostas" ON public.wheel_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (
                raw_user_meta_data->>'role' = 'admin'
                OR raw_user_meta_data->>'isAdmin' = 'true'
            )
        )
    );

-- Função para salvar/atualizar resposta da roda
CREATE OR REPLACE FUNCTION public.save_wheel_response(
    p_user_id UUID,
    p_session_id UUID,
    p_wheel_type TEXT,
    p_responses JSONB,
    p_reflection_answers JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_response_id UUID;
BEGIN
    INSERT INTO public.wheel_responses (
        user_id,
        session_id,
        wheel_type,
        responses,
        reflection_answers,
        completed_at
    )
    VALUES (
        p_user_id,
        p_session_id,
        p_wheel_type,
        p_responses,
        p_reflection_answers,
        NOW()
    )
    ON CONFLICT (user_id, session_id, wheel_type)
    DO UPDATE SET
        responses = EXCLUDED.responses,
        reflection_answers = EXCLUDED.reflection_answers,
        completed_at = NOW()
    RETURNING id INTO v_response_id;

    RETURN v_response_id;
END;
$$;

-- Função para completar sessão
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