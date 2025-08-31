-- ===================================================================
-- CORREÇÃO COMPLETA DAS TABELAS E ESTRUTURAS DE DADOS
-- ===================================================================

-- 1. CRIAR TABELA GOOGLE_FIT_DATA (que estava faltando)
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

-- 2. ADICIONAR COLUNA GENDER À TABELA PROFILES (que estava faltando)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('masculino', 'feminino', 'outro', 'nao_informado'));

-- 3. CORRIGIR FOREIGN KEYS ENTRE TABELAS DE CURSOS
-- Adicionar foreign key entre course_lessons e course_modules se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'course_lessons_course_id_fkey' 
        AND table_name = 'course_lessons'
    ) THEN
        ALTER TABLE public.course_lessons 
        ADD CONSTRAINT course_lessons_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'course_lessons_module_id_fkey' 
        AND table_name = 'course_lessons'
    ) THEN
        ALTER TABLE public.course_lessons 
        ADD CONSTRAINT course_lessons_module_id_fkey 
        FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'course_modules_course_id_fkey' 
        AND table_name = 'course_modules'
    ) THEN
        ALTER TABLE public.course_modules 
        ADD CONSTRAINT course_modules_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. CORRIGIR FOREIGN KEYS EM USER_GOALS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_goals_category_id_fkey' 
        AND table_name = 'user_goals'
    ) THEN
        ALTER TABLE public.user_goals 
        ADD CONSTRAINT user_goals_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES public.goal_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_goals_challenge_id_fkey' 
        AND table_name = 'user_goals'
    ) THEN
        ALTER TABLE public.user_goals 
        ADD CONSTRAINT user_goals_challenge_id_fkey 
        FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. CORRIGIR FOREIGN KEYS EM USER_SESSIONS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_sessions_session_id_fkey' 
        AND table_name = 'user_sessions'
    ) THEN
        ALTER TABLE public.user_sessions 
        ADD CONSTRAINT user_sessions_session_id_fkey 
        FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. ADICIONAR CAMPOS FALTANTES EM CHALLENGES (baseado no esquema completo)
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medio',
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS is_group_challenge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rewards JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rules TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) DEFAULT 'once', -- 'daily', 'weekly', 'monthly', 'once'
ADD COLUMN IF NOT EXISTS target_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS target_unit VARCHAR(20),
ADD COLUMN IF NOT EXISTS progress_tracking JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS completion_criteria JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_assign BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}';

-- 7. CRIAR TRIGGER PARA UPDATED_AT EM CHALLENGES
CREATE OR REPLACE FUNCTION update_challenges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_challenges_updated_at_trigger ON public.challenges;
CREATE TRIGGER update_challenges_updated_at_trigger
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_challenges_updated_at();

-- 8. CRIAR TABELAS DE PARTICIPAÇÃO EM DESAFIOS (se não existirem)
CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  progress DECIMAL(5,2) DEFAULT 0, -- Percentual de 0 a 100
  current_value DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'dropped'
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- RLS para challenge_participations
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge participations" 
ON public.challenge_participations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own challenge participations" 
ON public.challenge_participations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge participations" 
ON public.challenge_participations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 9. CRIAR TABELA DE FERRAMENTAS/TOOLS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'assessment', 'tracking', 'analysis', etc.
  tool_type VARCHAR(50) NOT NULL, -- 'form', 'quiz', 'calculator', etc.
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  icon VARCHAR(50),
  color VARCHAR(20) DEFAULT '#6366f1',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para tools
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active tools" 
ON public.tools 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage tools" 
ON public.tools 
FOR ALL 
USING (auth.uid() = created_by OR 
       EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 10. CRIAR TABELA DE RESULTADOS DE FERRAMENTAS
CREATE TABLE IF NOT EXISTS public.tool_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  session_id UUID, -- Opcional, para vincular a uma sessão específica
  results JSONB NOT NULL,
  score DECIMAL(5,2),
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para tool_results
ALTER TABLE public.tool_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tool results" 
ON public.tool_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tool results" 
ON public.tool_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tool results" 
ON public.tool_results 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 11. ADICIONAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_challenge ON public.challenge_participations(user_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_status ON public.challenge_participations(status);
CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);
CREATE INDEX IF NOT EXISTS idx_tool_results_user_tool ON public.tool_results(user_id, tool_id);

-- 12. INSERIR FERRAMENTAS PADRÃO
INSERT INTO public.tools (name, description, category, tool_type, configuration) VALUES
('Anamnese Sistêmica', 'Questionário completo de avaliação inicial de saúde', 'assessment', 'form', '{"sections": ["personal", "medical", "lifestyle", "goals"]}'),
('Teste de Sabotadores', 'Avaliação de padrões comportamentais limitantes', 'assessment', 'quiz', '{"questions": 40, "categories": ["victim", "critic", "perfectionist"]}'),
('Calculadora de IMC', 'Cálculo automático do Índice de Massa Corporal', 'tracking', 'calculator', '{"formula": "weight / (height^2)", "units": "metric"}'),
('Rastreamento de Humor', 'Monitoramento diário do estado emocional', 'tracking', 'form', '{"scale": "1-10", "frequency": "daily"}'),
('Análise de Composição Corporal', 'Interpretação de dados da balança inteligente', 'analysis', 'analyzer', '{"metrics": ["weight", "body_fat", "muscle_mass"]}')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- TRIGGERS E FUNÇÕES PARA MANUTENÇÃO
-- ===================================================================

-- Trigger para updated_at em google_fit_data
CREATE OR REPLACE FUNCTION update_google_fit_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_google_fit_data_updated_at_trigger ON public.google_fit_data;
CREATE TRIGGER update_google_fit_data_updated_at_trigger
  BEFORE UPDATE ON public.google_fit_data
  FOR EACH ROW
  EXECUTE FUNCTION update_google_fit_data_updated_at();

-- Trigger para updated_at em tools
CREATE OR REPLACE FUNCTION update_tools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tools_updated_at_trigger ON public.tools;
CREATE TRIGGER update_tools_updated_at_trigger
  BEFORE UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION update_tools_updated_at();

-- Trigger para updated_at em tool_results
CREATE OR REPLACE FUNCTION update_tool_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tool_results_updated_at_trigger ON public.tool_results;
CREATE TRIGGER update_tool_results_updated_at_trigger
  BEFORE UPDATE ON public.tool_results
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_results_updated_at();