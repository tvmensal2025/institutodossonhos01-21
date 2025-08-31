-- MIGRAÇÃO COMPLETA - TODAS AS TABELAS RESTANTES
-- Restaurando todas as tabelas em uma única migração

-- Tabela TACO Foods (essencial para nutrição)
CREATE TABLE IF NOT EXISTS public.taco_foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    codigo INTEGER UNIQUE,
    categoria TEXT,
    subcategoria TEXT,
    energia_kcal DECIMAL(8,2),
    proteina_g DECIMAL(8,2),
    carboidrato_g DECIMAL(8,2),
    fibra_g DECIMAL(8,2),
    lipidios_g DECIMAL(8,2),
    calcio_mg DECIMAL(8,2),
    ferro_mg DECIMAL(8,2),
    sodio_mg DECIMAL(8,2),
    vitamina_c_mg DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de valores nutricionais
CREATE TABLE IF NOT EXISTS public.valores_nutricionais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alimento_nome TEXT NOT NULL,
    porcao_g DECIMAL(8,2) DEFAULT 100,
    energia_kcal DECIMAL(8,2),
    proteina_g DECIMAL(8,2),
    carboidrato_g DECIMAL(8,2),
    fibra_g DECIMAL(8,2),
    lipidios_g DECIMAL(8,2),
    calcio_mg DECIMAL(8,2),
    ferro_mg DECIMAL(8,2),
    sodio_mg DECIMAL(8,2),
    potassio_mg DECIMAL(8,2),
    vitamina_a_mcg DECIMAL(8,2),
    vitamina_c_mg DECIMAL(8,2),
    vitamina_d_mcg DECIMAL(8,2),
    vitamina_e_mg DECIMAL(8,2),
    folato_mcg DECIMAL(8,2),
    colesterol_mg DECIMAL(8,2),
    acidos_graxos_saturados_g DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversas da Sofia (IA)
CREATE TABLE IF NOT EXISTS public.sofia_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    context_type TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER,
    model_used TEXT DEFAULT 'gpt-4'
);

-- Anamnese dos usuários
CREATE TABLE IF NOT EXISTS public.user_anamnesis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    historico_familiar JSONB,
    medicamentos_uso JSONB,
    sintomas_atuais JSONB,
    exames_recentes JSONB,
    estilo_vida JSONB,
    objetivos_saude JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avaliações profissionais
CREATE TABLE IF NOT EXISTS public.professional_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES auth.users(id),
    evaluation_type TEXT NOT NULL,
    findings JSONB,
    recommendations JSONB,
    follow_up_date DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planos alimentares
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    total_calories_target INTEGER,
    is_active BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    meal_distribution JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refeições do plano
CREATE TABLE IF NOT EXISTS public.meal_plan_meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL,
    day_of_week INTEGER,
    recipe_name TEXT,
    ingredients JSONB,
    calories_estimate INTEGER,
    preparation_instructions TEXT,
    order_index INTEGER DEFAULT 0
);

-- Histórico de peso
CREATE TABLE IF NOT EXISTS public.weight_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    peso_kg DECIMAL(5,2) NOT NULL,
    imc DECIMAL(4,2),
    idade_metabolica INTEGER,
    metabolic_age INTEGER,
    data_medicao DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercícios
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    muscle_groups TEXT[],
    equipment_needed TEXT[],
    difficulty_level TEXT DEFAULT 'iniciante',
    calories_per_minute DECIMAL(4,2),
    instructions TEXT,
    benefits TEXT[],
    precautions TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de exercícios
CREATE TABLE IF NOT EXISTS public.exercise_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id),
    exercise_name TEXT,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    intensity_level TEXT,
    notes TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sono
CREATE TABLE IF NOT EXISTS public.sleep_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sleep_date DATE NOT NULL,
    bedtime TIME,
    wake_time TIME,
    duration_hours DECIMAL(4,2),
    quality_score INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hidratação
CREATE TABLE IF NOT EXISTS public.hydration_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    water_intake_ml INTEGER DEFAULT 0,
    target_ml INTEGER DEFAULT 2000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suplementos
CREATE TABLE IF NOT EXISTS public.supplements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    active_ingredients TEXT[],
    recommended_dosage TEXT,
    benefits TEXT[],
    contraindications TEXT[],
    category TEXT,
    brand TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uso de suplementos
CREATE TABLE IF NOT EXISTS public.user_supplements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplement_id UUID REFERENCES public.supplements(id),
    supplement_name TEXT,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receitas médicas
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_name TEXT,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    duration_days INTEGER,
    instructions TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relatórios médicos
CREATE TABLE IF NOT EXISTS public.medical_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB,
    generated_by TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_start DATE,
    period_end DATE,
    status TEXT DEFAULT 'draft'
);

-- Sessões do usuário
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desafios diários (logs)
CREATE TABLE IF NOT EXISTS public.challenge_daily_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participation_id UUID NOT NULL REFERENCES public.challenge_participations(id) ON DELETE CASCADE,
    log_date DATE DEFAULT CURRENT_DATE,
    value_logged DECIMAL(10,2),
    notes TEXT,
    evidence_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Preferências do usuário
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dietary_restrictions TEXT[],
    allergies TEXT[],
    food_preferences TEXT[],
    exercise_preferences TEXT[],
    notification_settings JSONB,
    privacy_settings JSONB,
    language TEXT DEFAULT 'pt-BR',
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comunidade (posts)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários da comunidade
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.community_comments(id),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Curtidas dos posts
CREATE TABLE IF NOT EXISTS public.community_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- Tokens de integração
CREATE TABLE IF NOT EXISTS public.integration_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eventos do calendário
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    reminder_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.taco_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valores_nutricionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Tabelas públicas (leitura para todos)
CREATE POLICY "TACO foods are viewable by everyone" ON public.taco_foods FOR SELECT USING (true);
CREATE POLICY "Nutritional values are viewable by everyone" ON public.valores_nutricionais FOR SELECT USING (true);
CREATE POLICY "Exercises are viewable by everyone" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Supplements are viewable by everyone" ON public.supplements FOR SELECT USING (true);

-- Dados pessoais dos usuários
CREATE POLICY "Users can manage their Sofia conversations" ON public.sofia_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their anamnesis" ON public.user_anamnesis FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their evaluations" ON public.professional_evaluations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their meal plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view meal plan meals" ON public.meal_plan_meals FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.meal_plans WHERE id = meal_plan_id AND user_id = auth.uid()
));
CREATE POLICY "Users can manage their weight history" ON public.weight_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their exercise history" ON public.exercise_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their sleep tracking" ON public.sleep_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their hydration tracking" ON public.hydration_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their supplements" ON public.user_supplements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their prescriptions" ON public.prescriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their medical reports" ON public.medical_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their challenge logs" ON public.challenge_daily_logs FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.challenge_participations WHERE id = participation_id AND user_id = auth.uid()
));
CREATE POLICY "Users can create their challenge logs" ON public.challenge_daily_logs FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.challenge_participations WHERE id = participation_id AND user_id = auth.uid()
));
CREATE POLICY "Users can manage their notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their integration tokens" ON public.integration_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their calendar events" ON public.calendar_events FOR ALL USING (auth.uid() = user_id);

-- Comunidade
CREATE POLICY "Community posts are viewable by everyone" ON public.community_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Users can manage their own posts" ON public.community_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Community comments are viewable by everyone" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their likes" ON public.community_likes FOR ALL USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_taco_foods_nome ON public.taco_foods(nome);
CREATE INDEX IF NOT EXISTS idx_taco_foods_categoria ON public.taco_foods(categoria);
CREATE INDEX IF NOT EXISTS idx_valores_nutricionais_alimento ON public.valores_nutricionais(alimento_nome);
CREATE INDEX IF NOT EXISTS idx_sofia_conversations_user_id ON public.sofia_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_sofia_conversations_created_at ON public.sofia_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_anamnesis_user_id ON public.user_anamnesis(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_evaluations_user_id ON public.professional_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_plan_id ON public.meal_plan_meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_weight_history_user_id ON public.weight_history(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_history_data ON public.weight_history(data_medicao);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercise_history_user_id ON public.exercise_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_history_date ON public.exercise_history(date);
CREATE INDEX IF NOT EXISTS idx_sleep_tracking_user_id ON public.sleep_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_tracking_date ON public.sleep_tracking(sleep_date);
CREATE INDEX IF NOT EXISTS idx_hydration_tracking_user_id ON public.hydration_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_tracking_date ON public.hydration_tracking(date);
CREATE INDEX IF NOT EXISTS idx_user_supplements_user_id ON public.user_supplements(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_reports_user_id ON public.medical_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_challenge_daily_logs_participation_id ON public.challenge_daily_logs(participation_id);
CREATE INDEX IF NOT EXISTS idx_challenge_daily_logs_date ON public.challenge_daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON public.community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_user_id ON public.integration_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);

-- Triggers para campos updated_at
CREATE TRIGGER update_user_anamnesis_updated_at BEFORE UPDATE ON public.user_anamnesis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professional_evaluations_updated_at BEFORE UPDATE ON public.professional_evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integration_tokens_updated_at BEFORE UPDATE ON public.integration_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para calcular IMC na tabela weight_history
CREATE TRIGGER calculate_weight_imc BEFORE INSERT OR UPDATE ON public.weight_history FOR EACH ROW EXECUTE FUNCTION public.calculate_imc();