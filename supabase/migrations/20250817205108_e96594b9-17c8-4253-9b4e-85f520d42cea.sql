-- MIGRAÇÃO COMPLETA - PARTE 2: TABELAS CRÍTICAS RESTANTES

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

-- Itens de receitas
CREATE TABLE IF NOT EXISTS public.recipe_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL,
    ingredient_name TEXT NOT NULL,
    quantity DECIMAL(8,2),
    unit TEXT
);

-- Vista de ingestão macro diária (será uma view)
CREATE TABLE IF NOT EXISTS public.v_daily_macro_intake (
    user_id UUID,
    date DATE,
    total_calories DECIMAL(10,2),
    total_protein_g DECIMAL(8,2),
    total_carbs_g DECIMAL(8,2),
    total_fat_g DECIMAL(8,2),
    total_fiber_g DECIMAL(8,2),
    total_sodium_mg DECIMAL(8,2),
    meal_count INTEGER
);

-- Receitas modelo
CREATE TABLE IF NOT EXISTS public.receitas_modelo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT,
    tempo_preparo INTEGER,
    rendimento INTEGER,
    dificuldade TEXT DEFAULT 'facil',
    instrucoes TEXT
);

-- Backup de profiles (tabela de backup)
CREATE TABLE IF NOT EXISTS public._backup_profiles_unify (
    id UUID,
    user_id UUID,
    full_name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50),
    points INTEGER,
    avatar_url TEXT,
    phone VARCHAR(20),
    birth_date DATE,
    city VARCHAR(100),
    google_fit_enabled BOOLEAN,
    altura_cm DECIMAL(5,2),
    peso_kg DECIMAL(5,2),
    sexo VARCHAR(10),
    data_nascimento DATE,
    nivel_atividade TEXT,
    objetivo_saude TEXT,
    restricoes_alimentares TEXT[],
    medicamentos TEXT[],
    condicoes_medicas TEXT[],
    preferencias_alimentares TEXT[],
    alergias TEXT[],
    intolerancia TEXT[],
    habitos_alimentares TEXT,
    frequencia_exercicio TEXT,
    tipo_exercicio_preferido TEXT[],
    experiencia_fitness TEXT,
    limitacoes_fisicas TEXT,
    sono_horas_media DECIMAL(3,1),
    qualidade_sono TEXT,
    estresse_nivel INTEGER,
    motivacao_principal TEXT,
    backup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações de fallback da IA
CREATE TABLE IF NOT EXISTS public.ai_fallback_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_name TEXT NOT NULL,
    fallback_model TEXT NOT NULL,
    priority_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    config_data JSONB
);

-- Combinações terapêuticas
CREATE TABLE IF NOT EXISTS public.combinacoes_terapeuticas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT,
    subcategoria TEXT,
    principios_ativos TEXT[],
    indicacoes TEXT[],
    contraindicacoes TEXT[],
    dosagem_recomendada TEXT,
    forma_administracao TEXT,
    interacoes TEXT[],
    observacoes TEXT,
    referencias_cientificas TEXT[]
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

-- Eventos de relatórios premium
CREATE TABLE IF NOT EXISTS public.premium_report_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_url TEXT,
    status TEXT DEFAULT 'pending'
);

-- Contraindicações
CREATE TABLE IF NOT EXISTS public.contraindicacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    principio_ativo_id UUID,
    condicao_medica TEXT NOT NULL,
    nivel_severidade TEXT DEFAULT 'moderado' CHECK (nivel_severidade IN ('leve', 'moderado', 'severo', 'absoluto')),
    descricao TEXT,
    mecanismo TEXT,
    alternativas_sugeridas TEXT[],
    referencias TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Impacto ambiental
CREATE TABLE IF NOT EXISTS public.impacto_ambiental (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alimento_id UUID,
    pegada_carbono_kg_co2 DECIMAL(8,4),
    uso_agua_litros DECIMAL(10,2),
    uso_solo_m2 DECIMAL(8,4),
    score_sustentabilidade INTEGER CHECK (score_sustentabilidade >= 0 AND score_sustentabilidade <= 100),
    sazonalidade_local TEXT[],
    origem_geografica TEXT,
    metodo_producao TEXT,
    certificacoes TEXT[]
);

-- Documentos médicos
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Objetivos nutricionais
CREATE TABLE IF NOT EXISTS public.nutrition_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('calorie', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'sugar', 'water')),
    target_value DECIMAL(8,2) NOT NULL,
    current_value DECIMAL(8,2) DEFAULT 0,
    unit TEXT NOT NULL,
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    auto_adjust BOOLEAN DEFAULT false,
    priority_level INTEGER DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5),
    notes TEXT,
    created_by TEXT DEFAULT 'user',
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    last_updated_value TIMESTAMP WITH TIME ZONE,
    reminder_enabled BOOLEAN DEFAULT true,
    achievement_unlocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.health_feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v_daily_macro_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas_modelo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_profiles_unify ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_fallback_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combinacoes_terapeuticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_report_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contraindicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impacto_ambiental ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Users can view comments on public posts" ON public.health_feed_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.health_feed_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Groups are viewable by everyone" ON public.health_feed_groups
    FOR SELECT USING (NOT is_private OR EXISTS (
        SELECT 1 FROM public.health_feed_group_members 
        WHERE group_id = health_feed_groups.id AND user_id = auth.uid()
    ));

CREATE POLICY "Recipe items are viewable by everyone" ON public.recipe_items
    FOR SELECT USING (true);

CREATE POLICY "Receitas modelo are viewable by everyone" ON public.receitas_modelo
    FOR SELECT USING (true);

CREATE POLICY "AI fallback configs are viewable by admins" ON public.ai_fallback_configs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Therapeutic combinations are viewable by everyone" ON public.combinacoes_terapeuticas
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their food analysis" ON public.food_analysis
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their premium reports" ON public.premium_report_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Contraindications are viewable by everyone" ON public.contraindicacoes
    FOR SELECT USING (true);

CREATE POLICY "Environmental impact is viewable by everyone" ON public.impacto_ambiental
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their medical documents" ON public.medical_documents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their nutrition goals" ON public.nutrition_goals
    FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_health_feed_comments_post_id ON public.health_feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_comments_user_id ON public.health_feed_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_groups_created_by ON public.health_feed_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_food_analysis_user_id ON public.food_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_food_analysis_created_at ON public.food_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_premium_report_events_user_id ON public.premium_report_events(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_user_id ON public.medical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_type ON public.medical_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_id ON public.nutrition_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_active ON public.nutrition_goals(is_active);