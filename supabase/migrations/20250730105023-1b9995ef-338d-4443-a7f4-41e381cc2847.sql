-- ===================================================================
-- CORREÇÃO COMPLETA - PARTE 1: CRIAR ESTRUTURAS BÁSICAS
-- ===================================================================

-- 1. CRIAR ENUM E TABELA USER_ROLES (que estava faltando)
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- RLS para user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. CRIAR FUNÇÃO SECURITY DEFINER PARA VERIFICAR ROLES
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. CRIAR TABELA GOOGLE_FIT_DATA (que estava faltando)
CREATE TABLE IF NOT EXISTS public.google_fit_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL, -- 'steps', 'calories', 'distance', etc.
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL, -- 'steps', 'kcal', 'km', etc.
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source VARCHAR(100) DEFAULT 'google_fit',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para google_fit_data
ALTER TABLE public.google_fit_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own google fit data" 
ON public.google_fit_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own google fit data" 
ON public.google_fit_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own google fit data" 
ON public.google_fit_data 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_google_fit_data_user_id ON public.google_fit_data(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_recorded_at ON public.google_fit_data(recorded_at);
CREATE INDEX IF NOT EXISTS idx_google_fit_data_type ON public.google_fit_data(data_type);

-- 4. ADICIONAR COLUNA GENDER À TABELA PROFILES (que estava faltando)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('masculino', 'feminino', 'outro', 'nao_informado'));