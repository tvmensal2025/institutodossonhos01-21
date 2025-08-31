-- ========================================
-- CRIAR TABELAS E COLUNAS ESSENCIAIS FALTANTES
-- ========================================

-- 1. Verificar e criar tabela user_goals se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_goals') THEN
        CREATE TABLE public.user_goals (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            challenge_id UUID,
            target_value NUMERIC,
            unit TEXT,
            difficulty TEXT DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
            target_date DATE,
            is_group_goal BOOLEAN DEFAULT false,
            evidence_required BOOLEAN DEFAULT true,
            estimated_points INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada', 'em_progresso', 'concluida', 'cancelada')),
            current_value NUMERIC DEFAULT 0,
            final_points INTEGER DEFAULT 0,
            approved_by UUID,
            approved_at TIMESTAMP WITH TIME ZONE,
            rejection_reason TEXT,
            admin_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
        CREATE INDEX idx_user_goals_status ON public.user_goals(status);
        CREATE INDEX idx_user_goals_category ON public.user_goals(category);
        CREATE INDEX idx_user_goals_created_at ON public.user_goals(created_at);
        
        -- Habilitar RLS
        ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
        
        -- Políticas RLS
        CREATE POLICY "Users can view their own goals" ON public.user_goals
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can create their own goals" ON public.user_goals
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own goals" ON public.user_goals
            FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own goals" ON public.user_goals
            FOR DELETE USING (auth.uid() = user_id);
        
        RAISE NOTICE 'Tabela user_goals criada com sucesso';
    ELSE
        -- Verificar e adicionar colunas que possam estar faltando
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_goals' AND column_name = 'final_points') THEN
            ALTER TABLE public.user_goals ADD COLUMN final_points INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_goals' AND column_name = 'approved_by') THEN
            ALTER TABLE public.user_goals ADD COLUMN approved_by UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_goals' AND column_name = 'approved_at') THEN
            ALTER TABLE public.user_goals ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_goals' AND column_name = 'rejection_reason') THEN
            ALTER TABLE public.user_goals ADD COLUMN rejection_reason TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_goals' AND column_name = 'admin_notes') THEN
            ALTER TABLE public.user_goals ADD COLUMN admin_notes TEXT;
        END IF;
        
        RAISE NOTICE 'Colunas da tabela user_goals verificadas e adicionadas se necessário';
    END IF;
END $$;

-- 2. Verificar e criar tabela profiles se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name VARCHAR(255),
            email VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user',
            points INTEGER DEFAULT 0,
            avatar_url TEXT,
            phone VARCHAR(20),
            birth_date DATE,
            city VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
        
        -- Habilitar RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Políticas RLS
        CREATE POLICY "Users can view their own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can update their own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        RAISE NOTICE 'Tabela profiles criada com sucesso';
    END IF;
END $$;

-- 3. Criar tabela google_fit_data se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'google_fit_data') THEN
        CREATE TABLE public.google_fit_data (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            data_date DATE NOT NULL,
            steps_count INTEGER DEFAULT 0,
            calories_burned INTEGER DEFAULT 0,
            distance_meters INTEGER DEFAULT 0,
            heart_rate_avg INTEGER DEFAULT 0,
            active_minutes INTEGER DEFAULT 0,
            sleep_duration_hours DECIMAL(4,2) DEFAULT 0,
            weight_kg DECIMAL(5,2),
            height_cm DECIMAL(5,2),
            heart_rate_resting INTEGER,
            heart_rate_max INTEGER,
            raw_data JSONB,
            sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, data_date)
        );
        
        -- Criar índices para performance
        CREATE INDEX idx_google_fit_data_user_date ON google_fit_data(user_id, data_date);
        CREATE INDEX idx_google_fit_data_sync_timestamp ON google_fit_data(sync_timestamp);
        
        -- Habilitar RLS
        ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;
        
        -- Políticas RLS
        CREATE POLICY "Users can view own Google Fit data" ON google_fit_data
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own Google Fit data" ON google_fit_data
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own Google Fit data" ON google_fit_data
            FOR UPDATE USING (auth.uid() = user_id);
        
        RAISE NOTICE 'Tabela google_fit_data criada com sucesso';
    END IF;
END $$;

-- 4. Criar tabela google_fit_tokens se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'google_fit_tokens') THEN
        CREATE TABLE public.google_fit_tokens (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            access_token TEXT NOT NULL,
            refresh_token TEXT,
            expires_at TIMESTAMP WITH TIME ZONE,
            token_type TEXT DEFAULT 'Bearer',
            scope TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
        
        -- Habilitar RLS
        ALTER TABLE google_fit_tokens ENABLE ROW LEVEL SECURITY;
        
        -- Políticas RLS
        CREATE POLICY "Users can manage their own tokens" ON google_fit_tokens
            FOR ALL USING (auth.uid() = user_id);
        
        RAISE NOTICE 'Tabela google_fit_tokens criada com sucesso';
    END IF;
END $$;

-- 5. Criar função para atualizar updated_at se não existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar triggers para updated_at
DO $$
BEGIN
    -- Trigger para user_goals
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_goals_updated_at') THEN
        CREATE TRIGGER update_user_goals_updated_at 
            BEFORE UPDATE ON public.user_goals 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para profiles
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON public.profiles 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para google_fit_tokens
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_google_fit_tokens_updated_at') THEN
        CREATE TRIGGER update_google_fit_tokens_updated_at 
            BEFORE UPDATE ON public.google_fit_tokens 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 7. Verificar resultado final
SELECT 
    'RESULTADO FINAL' as info,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tabelas_publicas,
    (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_goals')) as user_goals_existe,
    (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')) as profiles_existe,
    (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'google_fit_data')) as google_fit_data_existe,
    (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'google_fit_tokens')) as google_fit_tokens_existe;