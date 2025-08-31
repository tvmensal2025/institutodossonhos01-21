-- MIGRAÇÃO COMPLETA - PARTE 2 CORRIGIDA: TABELAS CRÍTICAS

-- Primeiro criar a tabela de membros dos grupos
CREATE TABLE IF NOT EXISTS public.health_feed_group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários do feed de saúde
CREATE TABLE IF NOT EXISTS public.health_feed_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.health_feed_comments(id),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grupos do feed de saúde
CREATE TABLE IF NOT EXISTS public.health_feed_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_private BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Análise de alimentos
CREATE TABLE IF NOT EXISTS public.food_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    image_url TEXT,
    analysis_result JSONB,
    confidence_score DECIMAL(3,2),
    nutrition_data JSONB,
    allergen_warnings TEXT[],
    health_score INTEGER,
    recommendations TEXT[],
    processed_by TEXT DEFAULT 'system',
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documentos médicos (versão completa)
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_size_bytes INTEGER,
    mime_type TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    document_date DATE,
    doctor_name TEXT,
    medical_institution TEXT,
    document_number TEXT,
    tags TEXT[],
    is_sensitive BOOLEAN DEFAULT true,
    expiry_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'expired')),
    metadata JSONB,
    ocr_text TEXT,
    processing_status TEXT DEFAULT 'pending',
    shared_with TEXT[],
    access_level TEXT DEFAULT 'private',
    version_number INTEGER DEFAULT 1,
    parent_document_id UUID,
    encrypted_data JSONB,
    checksum TEXT,
    digital_signature TEXT,
    compliance_flags TEXT[],
    retention_period_days INTEGER,
    auto_delete_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Missões do usuário
CREATE TABLE IF NOT EXISTS public.user_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'failed', 'skipped')),
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Doenças e condições
CREATE TABLE IF NOT EXISTS public.doencas_condicoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    categoria TEXT,
    subcategoria TEXT,
    cid_10 TEXT,
    descricao TEXT,
    sintomas TEXT[],
    fatores_risco TEXT[],
    tratamentos_convencionais TEXT[],
    abordagens_integrativas TEXT[],
    alimentos_recomendados TEXT[],
    alimentos_evitar TEXT[],
    suplementos_indicados TEXT[],
    exercicios_recomendados TEXT[],
    contraindicacoes_exercicio TEXT[],
    observacoes_especiais TEXT
);

-- Questões de sessão
CREATE TABLE IF NOT EXISTS public.session_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'multiple_choice', 'scale', 'yes_no', 'date')),
    options JSONB,
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    validation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de ingredientes do usuário
CREATE TABLE IF NOT EXISTS public.user_ingredient_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    frequency_count INTEGER DEFAULT 1,
    last_used_date DATE DEFAULT CURRENT_DATE,
    preference_score DECIMAL(3,2) DEFAULT 0,
    notes TEXT
);

-- Progresso do usuário
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.health_feed_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doencas_condicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ingredient_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Group members can view their memberships" ON public.health_feed_group_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join groups" ON public.health_feed_group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view comments" ON public.health_feed_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.health_feed_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Groups are viewable" ON public.health_feed_groups
    FOR SELECT USING (NOT is_private OR EXISTS (
        SELECT 1 FROM public.health_feed_group_members 
        WHERE group_id = health_feed_groups.id AND user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their food analysis" ON public.food_analysis
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their medical documents" ON public.medical_documents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their missions" ON public.user_missions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Diseases are viewable by everyone" ON public.doencas_condicoes
    FOR SELECT USING (true);

CREATE POLICY "Session questions are viewable by everyone" ON public.session_questions
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their ingredient history" ON public.user_ingredient_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_health_feed_group_members_group_id ON public.health_feed_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_group_members_user_id ON public.health_feed_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_comments_post_id ON public.health_feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_food_analysis_user_id ON public.food_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_user_id ON public.medical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_type ON public.medical_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON public.user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_questions_session_id ON public.session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_ingredient_history_user_id ON public.user_ingredient_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);