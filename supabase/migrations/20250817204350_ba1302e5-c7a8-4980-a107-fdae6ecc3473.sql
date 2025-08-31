-- Restaurar todas as tabelas necessárias

-- 1. Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
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
  google_fit_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Criar tabela user_goals
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
    final_points INTEGER,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela goal_updates
CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Criar tabela ai_usage_logs
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_name TEXT NOT NULL,
  characters_used INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10,6) NOT NULL DEFAULT 0,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  test_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela ai_configurations
CREATE TABLE IF NOT EXISTS ai_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  config_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela google_fit_data
CREATE TABLE IF NOT EXISTS public.google_fit_data (
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

-- 7. Criar tabela google_fit_tokens
CREATE TABLE IF NOT EXISTS google_fit_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 8. Criar enum para tipos de roles
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. Criar tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_fit_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS RLS BÁSICAS

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_goals
CREATE POLICY "Users can view their own goals"
ON public.user_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.user_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.user_goals
FOR UPDATE
USING (auth.uid() = user_id);

-- Políticas para goal_updates
CREATE POLICY "Users can create their own goal updates" 
ON public.goal_updates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own goal updates" 
ON public.goal_updates 
FOR SELECT 
USING (auth.uid() = user_id);

-- Políticas para google_fit_data
CREATE POLICY "Users can view own Google Fit data" ON google_fit_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Google Fit data" ON google_fit_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Google Fit data" ON google_fit_data
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para google_fit_tokens
CREATE POLICY "Users can manage their own Google Fit tokens" ON google_fit_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON public.user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_category ON public.user_goals(category);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_date ON ai_usage_logs(date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_date ON google_fit_data(user_id, data_date);
CREATE INDEX IF NOT EXISTS idx_google_fit_tokens_user ON google_fit_tokens(user_id);

-- CRIAR FUNÇÕES E TRIGGERS

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para user_goals
CREATE TRIGGER update_user_goals_updated_at 
    BEFORE UPDATE ON public.user_goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para google_fit_tokens
CREATE TRIGGER update_google_fit_tokens_updated_at
    BEFORE UPDATE ON google_fit_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- CRIAR FUNÇÃO DE SEGURANÇA PARA VERIFICAR ROLES
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
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

-- INSERIR CONFIGURAÇÃO PADRÃO DE VOZ
INSERT INTO ai_configurations (name, config_data) 
VALUES (
  'voice_config',
  '{
    "speakingRate": 0.85,
    "pitch": 1.3,
    "volumeGainDb": 1.2,
    "voiceName": "pt-BR-Neural2-C",
    "isEnabled": true
  }'
) ON CONFLICT (name) DO UPDATE SET 
  config_data = EXCLUDED.config_data,
  updated_at = NOW();