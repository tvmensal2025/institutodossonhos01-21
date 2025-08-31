-- MIGRAÇÃO COMPLETA - TODAS AS TABELAS ESSENCIAIS DO SISTEMA

-- ===== TABELAS DE SESSÕES E CURSOS =====

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 30,
    difficulty_level TEXT DEFAULT 'iniciante' CHECK (difficulty_level IN ('iniciante', 'intermediario', 'avancado')),
    category TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões dos usuários
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(user_id, session_id)
);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    instructor_name TEXT,
    duration_hours DECIMAL(4,2),
    difficulty_level TEXT DEFAULT 'iniciante' CHECK (difficulty_level IN ('iniciante', 'intermediario', 'avancado')),
    category TEXT,
    is_published BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de módulos dos cursos
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de lições
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    is_free BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABELAS DE DESAFIOS =====

-- Tabela de desafios
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
    duration_days INTEGER DEFAULT 30,
    points_reward INTEGER DEFAULT 0,
    is_group_challenge BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    rules TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de participações em desafios
CREATE TABLE IF NOT EXISTS public.challenge_participations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    final_score INTEGER,
    UNIQUE(user_id, challenge_id)
);

-- ===== TABELAS DE PESAGEM E DADOS FÍSICOS =====

-- Tabela de dados físicos dos usuários
CREATE TABLE IF NOT EXISTS public.user_physical_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    altura_cm DECIMAL(5,2),
    peso_inicial_kg DECIMAL(5,2),
    idade INTEGER,
    sexo VARCHAR(10) CHECK (sexo IN ('M', 'F', 'Outro')),
    nivel_atividade TEXT DEFAULT 'sedentario' CHECK (nivel_atividade IN ('sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso')),
    objetivo TEXT DEFAULT 'manter_peso' CHECK (objetivo IN ('perder_peso', 'ganhar_peso', 'manter_peso', 'ganhar_massa')),
    meta_peso_kg DECIMAL(5,2),
    restricoes_alimentares TEXT[],
    alergias TEXT[],
    medicamentos TEXT[],
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabela de medições de peso
CREATE TABLE IF NOT EXISTS public.weight_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    peso_kg DECIMAL(5,2) NOT NULL,
    imc DECIMAL(4,2),
    circunferencia_abdominal_cm DECIMAL(5,2),
    percentual_gordura DECIMAL(4,2),
    agua_corporal_percent DECIMAL(4,2),
    massa_ossea_kg DECIMAL(4,2),
    massa_muscular_kg DECIMAL(5,2),
    metabolic_age INTEGER,
    idade_metabolica INTEGER,
    risco_cardiometabolico TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABELAS DE RESPOSTAS DIÁRIAS =====

-- Tabela de respostas diárias
CREATE TABLE IF NOT EXISTS public.daily_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    section TEXT NOT NULL,
    question_id TEXT NOT NULL,
    answer TEXT,
    text_response TEXT,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, section, question_id)
);

-- ===== TABELAS DE CONVITES =====

-- Tabela de convites para metas
CREATE TABLE IF NOT EXISTS public.user_goal_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_email TEXT,
    invitee_name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de participantes de metas
CREATE TABLE IF NOT EXISTS public.user_goal_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    can_view_progress BOOLEAN DEFAULT true,
    can_comment BOOLEAN DEFAULT true,
    UNIQUE(goal_id, user_id)
);

-- ===== TABELAS DE LOGS ADMINISTRATIVOS =====

-- Tabela de logs administrativos
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== BUCKETS DE STORAGE =====

-- Bucket para imagens de chat (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket para documentos médicos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-documents',
  'medical-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para relatórios médicos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-reports',
  'medical-reports',
  false,
  10485760,
  ARRAY['application/pdf', 'text/html']
)
ON CONFLICT (id) DO NOTHING;

-- ===== HABILITAR RLS EM TODAS AS TABELAS =====

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_physical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ===== POLÍTICAS RLS =====

-- Políticas para sessions (apenas visualização pública)
CREATE POLICY "Sessions are viewable by everyone" ON public.sessions
    FOR SELECT USING (is_active = true);

-- Políticas para user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para courses
CREATE POLICY "Published courses are viewable by everyone" ON public.courses
    FOR SELECT USING (is_published = true);

-- Políticas para course_modules
CREATE POLICY "Published modules are viewable by everyone" ON public.course_modules
    FOR SELECT USING (is_published = true);

-- Políticas para lessons
CREATE POLICY "Free lessons are viewable by everyone" ON public.lessons
    FOR SELECT USING (is_free = true);

-- Políticas para challenges
CREATE POLICY "Active challenges are viewable by everyone" ON public.challenges
    FOR SELECT USING (is_active = true);

-- Políticas para challenge_participations
CREATE POLICY "Users can view their own participations" ON public.challenge_participations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own participations" ON public.challenge_participations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participations" ON public.challenge_participations
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_physical_data
CREATE POLICY "Users can manage their own physical data" ON public.user_physical_data
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para weight_measurements
CREATE POLICY "Users can manage their own weight measurements" ON public.weight_measurements
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para daily_responses
CREATE POLICY "Users can manage their own daily responses" ON public.daily_responses
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_goal_invitations
CREATE POLICY "Users can view invitations they sent or received" ON public.user_goal_invitations
    FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_user_id);

CREATE POLICY "Users can create invitations" ON public.user_goal_invitations
    FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update invitations they received" ON public.user_goal_invitations
    FOR UPDATE USING (auth.uid() = invitee_user_id);

-- Políticas para user_goal_participants
CREATE POLICY "Users can view participants of their goals" ON public.user_goal_participants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join goals" ON public.user_goal_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para admin_logs (apenas admins)
CREATE POLICY "Admins can view all logs" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ===== POLÍTICAS DE STORAGE =====

-- Políticas para chat-images
CREATE POLICY "Users can upload chat images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Chat images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-images');

CREATE POLICY "Users can update their own chat images" ON storage.objects
FOR UPDATE USING (bucket_id = 'chat-images');

CREATE POLICY "Users can delete their own chat images" ON storage.objects
FOR DELETE USING (bucket_id = 'chat-images');

-- Políticas para medical-documents
CREATE POLICY "Users can upload their own medical documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own medical documents" ON storage.objects
FOR SELECT USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ===== ÍNDICES PARA PERFORMANCE =====

CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_id ON public.challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_challenge_id ON public.challenge_participations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_id ON public.weight_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_measurements_created_at ON public.weight_measurements(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_date ON public.daily_responses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_goal_invitations_inviter ON public.user_goal_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_user_goal_invitations_invitee ON public.user_goal_invitations(invitee_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_user_id ON public.admin_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at);

-- ===== TRIGGERS PARA UPDATED_AT =====

-- Trigger para sessions
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_sessions
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para courses
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para course_modules
CREATE TRIGGER update_course_modules_updated_at
    BEFORE UPDATE ON public.course_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para lessons
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para challenges
CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON public.challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_physical_data
CREATE TRIGGER update_user_physical_data_updated_at
    BEFORE UPDATE ON public.user_physical_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===== DADOS INICIAIS =====

-- Inserir algumas sessões padrão
INSERT INTO public.sessions (title, description, duration_minutes, difficulty_level, category) VALUES
('Meditação Matinal', 'Sessão de meditação para começar o dia com tranquilidade', 15, 'iniciante', 'mindfulness'),
('Respiração Consciente', 'Técnicas de respiração para reduzir ansiedade', 10, 'iniciante', 'respiracao'),
('Relaxamento Muscular', 'Exercícios de relaxamento progressivo', 20, 'intermediario', 'relaxamento'),
('Mindfulness Avançado', 'Práticas avançadas de atenção plena', 30, 'avancado', 'mindfulness')
ON CONFLICT DO NOTHING;

-- Inserir alguns desafios padrão
INSERT INTO public.challenges (title, description, category, difficulty, duration_days, points_reward) VALUES
('30 Dias de Meditação', 'Medite pelo menos 10 minutos por dia durante 30 dias', 'mindfulness', 'medio', 30, 300),
('Semana Detox Digital', 'Reduza o uso de dispositivos eletrônicos por uma semana', 'bem-estar', 'facil', 7, 100),
('Caminhada Diária', 'Caminhe pelo menos 30 minutos todos os dias', 'exercicio', 'facil', 21, 200)
ON CONFLICT DO NOTHING;