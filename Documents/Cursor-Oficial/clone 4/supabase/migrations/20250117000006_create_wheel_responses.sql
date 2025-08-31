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

-- Índices
CREATE INDEX IF NOT EXISTS idx_wheel_responses_user_id ON public.wheel_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_wheel_responses_session_id ON public.wheel_responses(session_id);

-- RLS
ALTER TABLE public.wheel_responses ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Usuários podem gerenciar suas próprias respostas" ON public.wheel_responses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as respostas" ON public.wheel_responses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Função para salvar/atualizar resposta
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