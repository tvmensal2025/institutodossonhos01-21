-- MIGRAÇÃO COMPLETA - PARTE 1: TABELAS DE NUTRIÇÃO E CATÁLOGO

-- Tabela do catálogo nutricional do instituto
CREATE TABLE IF NOT EXISTS public.instituto_catalogo_nutricional (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT,
    subcategoria TEXT,
    descricao TEXT,
    propriedades_nutricionais JSONB,
    beneficios TEXT[],
    restricoes TEXT[],
    sazonalidade TEXT,
    origem_geografica TEXT,
    metodo_preparo TEXT[],
    conservacao TEXT,
    densidade_nutricional DECIMAL(5,2),
    score_sustentabilidade INTEGER,
    preco_medio DECIMAL(8,2),
    disponibilidade TEXT,
    fonte_dados TEXT,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tracking nutricional
CREATE TABLE IF NOT EXISTS public.nutrition_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('cafe_manha', 'almoco', 'jantar', 'lanche_manha', 'lanche_tarde', 'ceia')),
    food_name TEXT NOT NULL,
    quantity DECIMAL(8,2),
    unit TEXT,
    calories DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbs_g DECIMAL(8,2),
    fat_g DECIMAL(8,2),
    fiber_g DECIMAL(8,2),
    sodium_mg DECIMAL(8,2),
    sugar_g DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela life wheel (roda da vida)
CREATE TABLE IF NOT EXISTS public.life_wheel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 10),
    objetivo TEXT,
    acoes_planejadas TEXT[],
    data_avaliacao DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'em_progresso', 'concluido', 'pausado')),
    meta_score INTEGER CHECK (meta_score >= 0 AND meta_score <= 10),
    prazo_meta DATE,
    progresso_atual INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de componentes de receitas
CREATE TABLE IF NOT EXISTS public.receita_componentes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receita_id UUID NOT NULL,
    alimento_id UUID NOT NULL,
    quantidade DECIMAL(8,2) NOT NULL
);

-- Tabela de atribuições de sessões
CREATE TABLE IF NOT EXISTS public.session_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date DATE,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'started', 'completed', 'overdue'))
);

-- Tabela de princípios ativos
CREATE TABLE IF NOT EXISTS public.principios_ativos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    categoria TEXT,
    subcategoria TEXT,
    descricao TEXT,
    mecanismo_acao TEXT,
    beneficios TEXT[],
    contraindicacoes TEXT[],
    interacoes TEXT[],
    dosagem_recomendada TEXT,
    fontes_alimentares TEXT[],
    referencias_cientificas TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de posts do feed de saúde
CREATE TABLE IF NOT EXISTS public.health_feed_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[],
    post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'achievement', 'recipe', 'workout')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    group_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sugestões de refeições
CREATE TABLE IF NOT EXISTS public.meal_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL,
    recipe_name TEXT NOT NULL,
    ingredients TEXT[],
    preparation_time INTEGER,
    calories_estimate DECIMAL(8,2),
    difficulty_level TEXT DEFAULT 'facil' CHECK (difficulty_level IN ('facil', 'medio', 'dificil')),
    dietary_tags TEXT[],
    suggested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted BOOLEAN,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5)
);

-- Tabela de aliases nutricionais
CREATE TABLE IF NOT EXISTS public.nutrition_aliases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_name TEXT NOT NULL,
    alias_name TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 1.0
);

-- Tabela de pesagens (weighings)
CREATE TABLE IF NOT EXISTS public.weighings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    bone_mass_kg DECIMAL(4,2),
    water_percentage DECIMAL(4,2),
    visceral_fat_level INTEGER,
    metabolic_age INTEGER,
    bmi DECIMAL(4,2),
    measurement_type TEXT DEFAULT 'manual' CHECK (measurement_type IN ('manual', 'smart_scale', 'professional')),
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de memória do Dr. Vital
CREATE TABLE IF NOT EXISTS public.dr_vital_memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    context_type TEXT NOT NULL,
    memory_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.instituto_catalogo_nutricional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_wheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receita_componentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.principios_ativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weighings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dr_vital_memory ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Catalog is viewable by everyone" ON public.instituto_catalogo_nutricional
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own nutrition tracking" ON public.nutrition_tracking
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own life wheel" ON public.life_wheel
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view session assignments" ON public.session_assignments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Principios ativos are viewable by everyone" ON public.principios_ativos
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own feed posts" ON public.health_feed_posts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public feed posts" ON public.health_feed_posts
    FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can manage their meal suggestions" ON public.meal_suggestions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Nutrition aliases are viewable by everyone" ON public.nutrition_aliases
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own weighings" ON public.weighings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own dr vital memory" ON public.dr_vital_memory
    FOR ALL USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_user_date ON public.nutrition_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_life_wheel_user_id ON public.life_wheel(user_id);
CREATE INDEX IF NOT EXISTS idx_session_assignments_user_id ON public.session_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_posts_user_id ON public.health_feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_posts_created_at ON public.health_feed_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_meal_suggestions_user_id ON public.meal_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_weighings_user_id ON public.weighings(user_id);
CREATE INDEX IF NOT EXISTS idx_weighings_created_at ON public.weighings(created_at);
CREATE INDEX IF NOT EXISTS idx_dr_vital_memory_user_id ON public.dr_vital_memory(user_id);