-- ========================================
-- CRIAR TABELAS BÁSICAS DE DESAFIOS
-- ========================================

-- 1. CRIAR TABELA CHALLENGES
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'exercicio',
  difficulty VARCHAR(20) DEFAULT 'medio',
  duration_days INTEGER DEFAULT 7,
  points_reward INTEGER DEFAULT 100,
  badge_icon VARCHAR(10) DEFAULT '🏆',
  badge_name VARCHAR(100),
  instructions TEXT,
  tips TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_group_challenge BOOLEAN DEFAULT false,
  daily_log_target DECIMAL(10,2) DEFAULT 1,
  daily_log_unit VARCHAR(20) DEFAULT 'vez',
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA CHALLENGE_PARTICIPATIONS
CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  progress DECIMAL(10,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  target_value DECIMAL(10,2),
  points_earned INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  daily_logs JSONB DEFAULT '[]',
  notes TEXT,
  UNIQUE(challenge_id, user_id)
);

-- 3. CRIAR TABELA CHALLENGE_DAILY_LOGS
CREATE TABLE IF NOT EXISTS public.challenge_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_id UUID REFERENCES public.challenge_participations(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  value_logged TEXT,
  numeric_value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HABILITAR RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS RLS PARA CHALLENGES
CREATE POLICY "Users can view active challenges" ON public.challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage challenges" ON public.challenges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 6. CRIAR POLÍTICAS RLS PARA CHALLENGE_PARTICIPATIONS
CREATE POLICY "Users can view their own participations" ON public.challenge_participations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own participations" ON public.challenge_participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participations" ON public.challenge_participations
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. CRIAR POLÍTICAS RLS PARA CHALLENGE_DAILY_LOGS
CREATE POLICY "Users can view their own logs" ON public.challenge_daily_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.challenge_participations cp
      WHERE cp.id = challenge_daily_logs.participation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own logs" ON public.challenge_daily_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.challenge_participations cp
      WHERE cp.id = challenge_daily_logs.participation_id
      AND cp.user_id = auth.uid()
    )
  );

-- 8. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_group ON public.challenges(is_group_challenge);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user ON public.challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_challenge ON public.challenge_participations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_daily_logs_participation ON public.challenge_daily_logs(participation_id);

-- 9. INSERIR DESAFIOS DE EXEMPLO
INSERT INTO public.challenges (
  title, description, category, difficulty, duration_days, 
  points_reward, badge_icon, badge_name, daily_log_target, 
  daily_log_unit, is_group_challenge
) VALUES 
-- Desafios Individuais
('Exercício Diário', 'Pratique exercício físico por pelo menos 30 minutos todos os dias', 'exercicio', 'medio', 7, 100, '💪', 'Atleta Diário', 30, 'minutos', false),
('Hidratação Perfeita', 'Beba pelo menos 2 litros de água por dia', 'saude', 'facil', 7, 50, '💧', 'Hidratado', 2, 'litros', false),

-- Desafios Públicos
('Corrida em Grupo', 'Corra 5km em grupo com outros participantes', 'exercicio', 'dificil', 7, 200, '🏃‍♀️', 'Corredor Social', 5, 'km', true),
('Hidratação Comunitária', 'Mantenha-se hidratado junto com a comunidade', 'saude', 'facil', 7, 75, '🚰', 'Hidratado Social', 2, 'litros', true),
('Yoga em Grupo', 'Pratique yoga em grupo por 20 minutos', 'bemestar', 'medio', 7, 150, '🧘‍♀️', 'Yogi Social', 20, 'minutos', true);

-- 10. VERIFICAÇÃO FINAL
SELECT '✅ TABELAS CRIADAS COM SUCESSO!' as status;
SELECT COUNT(*) as total_challenges FROM public.challenges;
SELECT COUNT(*) as total_participations FROM public.challenge_participations; 