-- Análise das tabelas existentes vs script fornecido
-- Aplicando apenas elementos faltantes para evitar duplicações

-- ===== 1. ATUALIZAR TABELA PROFILES (adicionar colunas faltantes) =====
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Adicionar constraint de gênero se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_gender_check'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_gender_check 
        CHECK (gender IN ('masculino', 'feminino', 'outro'));
    END IF;
END $$;

-- ===== 2. CRIAR TABELA USER_PROFILES (NOVA) =====
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro')),
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  language TEXT DEFAULT 'pt-BR',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS para user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own user profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ===== 3. ATUALIZAR TABELA CHALLENGES (adicionar colunas faltantes) =====
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Atualizar constraint de difficulty se necessário
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'challenges_difficulty_check'
    ) THEN
        ALTER TABLE public.challenges 
        ADD CONSTRAINT challenges_difficulty_check 
        CHECK (difficulty IN ('facil', 'medio', 'dificil'));
    END IF;
END $$;

-- ===== 4. CRIAR TABELA REACTIONS (NOVA) =====
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.health_feed_posts(id) ON DELETE CASCADE,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'love', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id, reaction_type)
);

-- RLS para reactions
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reactions" ON public.reactions
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own reactions" ON public.reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.reactions
    FOR DELETE USING (auth.uid() = user_id);

-- ===== 5. CRIAR TABELA COMMENTS (NOVA) =====
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.health_feed_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments" ON public.comments
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- ===== 6. CRIAR TABELA USER_SESSIONS (NOVA) =====
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('consultation', 'assessment', 'life_wheel_assessment', 'health_wheel_assessment')),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  results_display TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  session_date DATE DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- ===== 7. ATUALIZAR EARLY_RELEASE_REQUESTS (adicionar colunas faltantes) =====
ALTER TABLE public.early_release_requests 
ADD COLUMN IF NOT EXISTS request_type TEXT CHECK (request_type IN ('goal_completion', 'special_achievement', 'medical_reason')),
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS evidence_url TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar políticas RLS para early_release_requests
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.early_release_requests;
CREATE POLICY "Admins can manage all requests" ON public.early_release_requests
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ===== 8. CRIAR TABELA SMART_NOTIFICATIONS (NOVA) =====
CREATE TABLE IF NOT EXISTS public.smart_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT CHECK (category IN ('reminder', 'achievement', 'challenge', 'health_alert', 'motivation')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para smart_notifications
ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.smart_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.smart_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ===== 9. CRIAR TABELA USER_SCORES (NOVA) =====
CREATE TABLE IF NOT EXISTS public.user_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score_type TEXT NOT NULL CHECK (score_type IN ('health', 'fitness', 'nutrition', 'mental', 'overall')),
  score_value INTEGER CHECK (score_value >= 0 AND score_value <= 100),
  score_date DATE DEFAULT CURRENT_DATE,
  factors JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, score_type, score_date)
);

-- RLS para user_scores
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scores" ON public.user_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores" ON public.user_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== 10. ATUALIZAR LIFE_WHEEL (adicionar colunas faltantes) =====
ALTER TABLE public.life_wheel 
ADD COLUMN IF NOT EXISTS assessment_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS areas JSONB,
ADD COLUMN IF NOT EXISTS overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
ADD COLUMN IF NOT EXISTS insights TEXT,
ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]';

-- ===== ÍNDICES PARA PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post_user ON public.reactions(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_user ON public.comments(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_date ON public.user_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_user_read ON public.smart_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_scores_user_type_date ON public.user_scores(user_id, score_type, score_date DESC);

-- ===== TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers nas tabelas com updated_at
CREATE TRIGGER IF NOT EXISTS trigger_update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_update_early_release_requests_updated_at
  BEFORE UPDATE ON public.early_release_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();