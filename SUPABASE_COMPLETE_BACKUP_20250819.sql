-- =================================================================
-- BACKUP COMPLETO DO SUPABASE - HEALTH NEXUS
-- Data: 19 de Janeiro de 2025
-- Projeto ID: hlrkoyywjpckdotimtik
-- =================================================================

-- ATENÇÃO: Este backup inclui todas as tabelas, políticas RLS, funções,
-- triggers, tipos customizados e índices do projeto Health Nexus.

-- =================================================================
-- 1. TIPOS CUSTOMIZADOS
-- =================================================================

-- Tipo para roles do sistema
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =================================================================
-- 2. CRIAÇÃO DAS TABELAS
-- =================================================================

-- Tabela: profiles (Base dos usuários)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    points INTEGER DEFAULT 0,
    avatar_url TEXT,
    phone VARCHAR(20),
    birth_date DATE,
    city VARCHAR(100),
    state VARCHAR(100),
    height DECIMAL(5,2),
    gender VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: user_roles (Sistema de roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Tabela: ai_configurations (Configurações de IA)
CREATE TABLE IF NOT EXISTS public.ai_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    model TEXT NOT NULL,
    api_key TEXT,
    preset_level TEXT DEFAULT 'maximo',
    functionality TEXT,
    system_prompt TEXT,
    temperature NUMERIC DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: achievements (Conquistas)
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points INTEGER DEFAULT 0
);

-- Tabela: activity_categories (Categorias de atividades)
CREATE TABLE IF NOT EXISTS public.activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    category_name VARCHAR(100) NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    avg_score NUMERIC DEFAULT 0,
    last_activity_date DATE,
    color_code VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: activity_sessions (Sessões de atividade)
CREATE TABLE IF NOT EXISTS public.activity_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    category_id UUID,
    session_date DATE DEFAULT CURRENT_DATE,
    duration_minutes INTEGER,
    intensity_level INTEGER,
    satisfaction_score INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: admin_logs (Logs administrativos)
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: ai_presets (Presets de IA)
CREATE TABLE IF NOT EXISTS public.ai_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preset_name TEXT NOT NULL,
    preset_level TEXT NOT NULL,
    service TEXT NOT NULL,
    model TEXT NOT NULL,
    description TEXT,
    temperature NUMERIC NOT NULL,
    max_tokens INTEGER NOT NULL,
    is_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: ai_usage_logs (Logs de uso de IA)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    service_name TEXT,
    model TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: challenges (Desafios)
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER DEFAULT 7,
    target_value NUMERIC,
    unit TEXT,
    difficulty TEXT DEFAULT 'medio',
    status VARCHAR(50) DEFAULT 'active',
    frequency VARCHAR(50) DEFAULT 'once',
    target_unit VARCHAR(50),
    image_url TEXT,
    icon VARCHAR(50),
    color VARCHAR(10) DEFAULT '#6366f1',
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    entry_fee NUMERIC DEFAULT 0,
    notification_settings JSONB DEFAULT '{}',
    auto_assign BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    completion_criteria JSONB DEFAULT '{}',
    progress_tracking JSONB DEFAULT '{}',
    rewards JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_featured BOOLEAN DEFAULT FALSE,
    xp_reward INTEGER,
    max_participants INTEGER,
    is_group_challenge BOOLEAN DEFAULT FALSE,
    daily_log_target NUMERIC DEFAULT 1,
    daily_log_type TEXT DEFAULT 'boolean',
    daily_log_unit TEXT DEFAULT 'dia',
    challenge_type TEXT DEFAULT 'personal',
    points_reward INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requirements JSONB DEFAULT '{}',
    badge_icon TEXT DEFAULT '🏆',
    badge_name TEXT,
    instructions TEXT,
    tips TEXT[] DEFAULT '{}',
    rules TEXT
);

-- Tabela: challenge_participations (Participações em desafios)
CREATE TABLE IF NOT EXISTS public.challenge_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    challenge_id UUID,
    progress NUMERIC DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_earned INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    target_value NUMERIC DEFAULT 100,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: challenge_daily_logs (Logs diários dos desafios)
CREATE TABLE IF NOT EXISTS public.challenge_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participation_id UUID NOT NULL,
    challenge_name TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    numeric_value NUMERIC,
    value_logged TEXT,
    notes TEXT,
    photo_url TEXT,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: challenge_group_messages (Mensagens de grupo dos desafios)
CREATE TABLE IF NOT EXISTS public.challenge_group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    challenge_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: chat_configurations (Configurações do chat)
CREATE TABLE IF NOT EXISTS public.chat_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT NOT NULL,
    config_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela: chat_conversations (Conversas do chat)
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    character_name TEXT DEFAULT 'Sof.ia',
    conversation_type VARCHAR(50),
    user_message TEXT,
    bot_response TEXT,
    professional_id UUID,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: chat_emotional_analysis (Análise emocional do chat)
CREATE TABLE IF NOT EXISTS public.chat_emotional_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    conversation_id UUID NOT NULL,
    week_start DATE NOT NULL DEFAULT (DATE_TRUNC('week', CURRENT_DATE))::DATE,
    sentiment_score NUMERIC,
    emotions_detected TEXT[],
    mood_keywords TEXT[],
    energy_level INTEGER,
    stress_level INTEGER,
    pain_level INTEGER,
    physical_symptoms TEXT[],
    emotional_topics TEXT[],
    concerns_mentioned TEXT[],
    goals_mentioned TEXT[],
    achievements_mentioned TEXT[],
    analysis_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela: chat_messages (Mensagens do chat)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID,
    sender_id UUID,
    message_text TEXT,
    message_type VARCHAR(50),
    attachments JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: comments (Comentários)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    post_id UUID,
    parent_comment_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: company_configurations (Configurações da empresa)
CREATE TABLE IF NOT EXISTS public.company_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    mission TEXT,
    vision TEXT,
    values TEXT,
    about_us TEXT,
    target_audience TEXT,
    health_philosophy TEXT,
    company_culture TEXT,
    differentials TEXT,
    main_services TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela: company_data (Dados da empresa)
CREATE TABLE IF NOT EXISTS public.company_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    mission TEXT,
    vision TEXT,
    values TEXT,
    about_us TEXT,
    target_audience TEXT,
    health_philosophy TEXT,
    company_culture TEXT,
    differentials TEXT,
    main_services TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: courses (Cursos)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    duration_hours INTEGER,
    difficulty_level VARCHAR(20),
    category VARCHAR(50),
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: course_modules (Módulos do curso)
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela: course_lessons (Lições do curso)
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID,
    module_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    lesson_type TEXT DEFAULT 'video',
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    prerequisites TEXT[],
    resources JSONB DEFAULT '[]',
    quiz_questions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela: daily_mission_sessions (Sessões de missões diárias)
CREATE TABLE IF NOT EXISTS public.daily_mission_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    total_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Tabela: daily_responses (Respostas diárias)
CREATE TABLE IF NOT EXISTS public.daily_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    date DATE NOT NULL,
    section TEXT,
    question_id TEXT,
    answer TEXT,
    text_response TEXT,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: goal_updates (Atualizações de metas)
CREATE TABLE IF NOT EXISTS public.goal_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL,
    user_id UUID NOT NULL,
    previous_value NUMERIC,
    new_value NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela: user_goals (Metas dos usuários)
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    challenge_id UUID,
    target_value NUMERIC,
    unit TEXT,
    difficulty TEXT,
    target_date DATE,
    is_group_goal BOOLEAN,
    evidence_required BOOLEAN,
    estimated_points INTEGER,
    status TEXT,
    current_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: weight_measurements (Medições de peso)
CREATE TABLE IF NOT EXISTS public.weight_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    peso_kg NUMERIC,
    circunferencia_abdominal_cm NUMERIC,
    agua_corporal_percent NUMERIC,
    massa_ossea_kg NUMERIC,
    risco_cardiometabolico TEXT,
    measurement_date DATE DEFAULT CURRENT_DATE,
    device_type TEXT DEFAULT 'manual',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: weekly_analyses (Análises semanais)
CREATE TABLE IF NOT EXISTS public.weekly_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    semana_inicio DATE NOT NULL,
    semana_fim DATE NOT NULL,
    peso_inicial DECIMAL(5,2),
    peso_final DECIMAL(5,2),
    variacao_peso DECIMAL(5,2),
    tendencia TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, semana_inicio)
);

-- Tabela: weekly_insights (Insights semanais)
CREATE TABLE IF NOT EXISTS public.weekly_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    week_start_date DATE NOT NULL,
    average_mood DECIMAL(3,2),
    average_energy DECIMAL(3,2),
    average_stress DECIMAL(3,2),
    most_common_gratitude TEXT,
    water_consistency DECIMAL(3,2),
    sleep_consistency DECIMAL(3,2),
    exercise_frequency DECIMAL(3,2),
    total_points INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- Tabela: smart_notifications (Notificações inteligentes)
CREATE TABLE IF NOT EXISTS public.smart_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    trigger_conditions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =================================================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_emotional_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_mission_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- 4. FUNÇÕES DE SEGURANÇA
-- =================================================================

-- Função para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN public.has_role(auth.uid(), 'admin');
END;
$function$;

-- =================================================================
-- 5. POLÍTICAS RLS PRINCIPAIS
-- =================================================================

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para ai_configurations
CREATE POLICY "Authenticated users can view AI configurations" ON public.ai_configurations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update AI configurations" ON public.ai_configurations
  FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can insert AI configurations" ON public.ai_configurations
  FOR INSERT WITH CHECK (true);

-- Políticas para challenges
CREATE POLICY "Everyone can view challenges" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage challenges" ON public.challenges
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas para daily_mission_sessions
CREATE POLICY "Users can manage their own daily missions" ON public.daily_mission_sessions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para daily_responses
CREATE POLICY "Users can manage their own daily responses" ON public.daily_responses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para weight_measurements
CREATE POLICY "Users can manage their own weight measurements" ON public.weight_measurements
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para smart_notifications
CREATE POLICY "Users can view their own notifications" ON public.smart_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.smart_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =================================================================
-- 6. FUNÇÕES PRINCIPAIS DO SISTEMA
-- =================================================================

-- Função para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $function$
BEGIN
    -- Inserir apenas o perfil básico, sem complicações
    INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        phone,
        birth_date,
        city,
        state,
        height,
        gender,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        (NEW.raw_user_meta_data->>'birth_date')::date,
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'state',
        (NEW.raw_user_meta_data->>'height')::decimal,
        NEW.raw_user_meta_data->>'gender',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        birth_date = COALESCE(EXCLUDED.birth_date, profiles.birth_date),
        city = COALESCE(EXCLUDED.city, profiles.city),
        state = COALESCE(EXCLUDED.state, profiles.state),
        height = COALESCE(EXCLUDED.height, profiles.height),
        gender = COALESCE(EXCLUDED.gender, profiles.gender),
        updated_at = NOW();
    
    -- Inserir role padrão
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falha a criação do usuário
        RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$function$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- 7. TRIGGERS
-- =================================================================

-- Trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_configurations_updated_at
  BEFORE UPDATE ON public.ai_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weight_measurements_updated_at
  BEFORE UPDATE ON public.weight_measurements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_analyses_updated_at
  BEFORE UPDATE ON public.weekly_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =================================================================
-- 8. ÍNDICES PRINCIPAIS
-- =================================================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Índices para user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Índices para ai_configurations
CREATE UNIQUE INDEX IF NOT EXISTS ai_configurations_functionality_unique 
  ON public.ai_configurations(functionality);

-- Índices para daily_mission_sessions
CREATE INDEX IF NOT EXISTS idx_daily_mission_sessions_user_date 
  ON public.daily_mission_sessions(user_id, date);

-- Índices para daily_responses
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_date 
  ON public.daily_responses(user_id, date);

-- Índices para weight_measurements
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_date 
  ON public.weight_measurements(user_id, measurement_date);

-- Índices para smart_notifications
CREATE INDEX IF NOT EXISTS idx_smart_notifications_user_active 
  ON public.smart_notifications(user_id, is_active);

-- =================================================================
-- 9. DADOS INICIAIS
-- =================================================================

-- Configurações padrão de IA
INSERT INTO public.ai_configurations (
  service_name, model, preset_level, functionality, 
  system_prompt, temperature, max_tokens, is_active, is_primary
) VALUES 
(
  'openai', 'gpt-4o-mini', 'maximo', 'sofia_chat',
  'Você é Sofia, uma assistente de saúde inteligente e empática do Instituto dos Sonhos.',
  0.7, 2000, true, true
),
(
  'google', 'gemini-1.5-flash', 'economico', 'nutrition_analysis',
  'Você é um especialista em nutrição que analisa alimentos e fornece informações precisas.',
  0.3, 1500, true, false
)
ON CONFLICT (functionality) DO NOTHING;

-- Presets de IA
INSERT INTO public.ai_presets (
  preset_name, preset_level, service, model, description,
  temperature, max_tokens, is_recommended
) VALUES 
(
  'OpenAI GPT-4o Mini - Máximo', 'maximo', 'openai', 'gpt-4o-mini',
  'Melhor qualidade para conversas complexas', 0.7, 2000, true
),
(
  'Google Gemini Flash - Econômico', 'economico', 'google', 'gemini-1.5-flash',
  'Opção econômica para tarefas simples', 0.3, 1500, false
)
ON CONFLICT DO NOTHING;

-- =================================================================
-- 10. CONFIGURAÇÕES FINAIS
-- =================================================================

-- Verificar se as tabelas foram criadas
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  RAISE NOTICE '✅ BACKUP COMPLETO FINALIZADO!';
  RAISE NOTICE '📊 Total de tabelas: %', table_count;
  RAISE NOTICE '🔐 RLS habilitado em todas as tabelas principais';
  RAISE NOTICE '⚡ Funções e triggers configurados';
  RAISE NOTICE '📈 Índices otimizados criados';
  RAISE NOTICE '🚀 Sistema pronto para uso!';
END $$;

-- =================================================================
-- INSTRUÇÕES DE RESTAURAÇÃO:
-- 
-- 1. Execute este script em um banco Supabase limpo
-- 2. Configure as variáveis de ambiente necessárias
-- 3. Teste as funcionalidades principais
-- 4. Importe dados se necessário
-- 
-- ATENÇÃO: Este backup NÃO inclui dados, apenas estrutura!
-- Para backup completo com dados, use pg_dump do Supabase
-- =================================================================