-- Criar tabela para questões de sessão
CREATE TABLE IF NOT EXISTS public.session_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR NOT NULL CHECK (question_type IN (
        'single_choice', 'multiple_choice', 'numeric_scale', 'boolean', 
        'ranking', 'numeric_range', 'percentage', 'short_text', 'long_text'
    )),
    options JSONB DEFAULT NULL, -- Para opções de múltipla escolha, etc.
    required BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para respostas das sessões
CREATE TABLE IF NOT EXISTS public.session_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.session_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    response_value JSONB NOT NULL, -- Flexível para diferentes tipos de resposta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para atribuição de sessões a usuários
CREATE TABLE IF NOT EXISTS public.session_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    assigned_by UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    is_completed BOOLEAN DEFAULT false,
    UNIQUE(session_id, user_id)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas para session_questions
CREATE POLICY "Super admins can manage session questions"
ON public.session_questions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() AND p.is_super_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() AND p.is_super_admin = true
    )
);

CREATE POLICY "Users can view questions for assigned sessions"
ON public.session_questions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.session_assignments sa
        WHERE sa.session_id = session_questions.session_id 
        AND sa.user_id = auth.uid()
    )
);

-- Políticas para session_responses  
CREATE POLICY "Users can create their own responses"
ON public.session_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses"
ON public.session_responses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all responses"
ON public.session_responses FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() AND p.is_super_admin = true
    )
);

-- Políticas para session_assignments
CREATE POLICY "Super admins can manage assignments"
ON public.session_assignments FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() AND p.is_super_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() AND p.is_super_admin = true
    )
);

CREATE POLICY "Users can view their own assignments"
ON public.session_assignments FOR SELECT
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_session_questions_session_id ON public.session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_session_questions_order ON public.session_questions(session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_session_responses_session_user ON public.session_responses(session_id, user_id);
CREATE INDEX IF NOT EXISTS idx_session_assignments_user ON public.session_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_session_assignments_session ON public.session_assignments(session_id);