-- Criar tabela de desafios/challenges
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('jejum', 'exercicio', 'hidratacao', 'mindfulness', 'nutricao', 'sono', 'medicao', 'especial')),
  difficulty TEXT CHECK (difficulty IN ('facil', 'medio', 'dificil', 'extremo')) DEFAULT 'medio',
  duration_days INTEGER NOT NULL DEFAULT 7,
  points_reward INTEGER DEFAULT 100,
  badge_icon TEXT DEFAULT '🏆',
  badge_name TEXT,
  instructions TEXT,
  tips TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_group_challenge BOOLEAN DEFAULT false,
  daily_log_type TEXT CHECK (daily_log_type IN ('boolean', 'hours', 'quantity', 'photo', 'text')) DEFAULT 'boolean',
  daily_log_unit TEXT,
  daily_log_target NUMERIC,
  start_date DATE,
  end_date DATE,
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de participação em desafios
CREATE TABLE public.challenge_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  progress NUMERIC DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Criar tabela de logs diários dos desafios
CREATE TABLE public.challenge_daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participation_id UUID NOT NULL REFERENCES public.challenge_participations(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  value_logged TEXT,
  numeric_value NUMERIC,
  notes TEXT,
  photo_url TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(participation_id, log_date)
);

-- Criar tabela de mensagens do grupo (para desafios em grupo)
CREATE TABLE public.challenge_group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_group_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para challenges (todos podem ver desafios ativos)
CREATE POLICY "Everyone can view active challenges" 
ON public.challenges 
FOR SELECT 
USING (is_active = true);

-- Políticas RLS para participações (usuários só veem suas participações)
CREATE POLICY "Users can view own participations" 
ON public.challenge_participations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own participations" 
ON public.challenge_participations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participations" 
ON public.challenge_participations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas RLS para logs diários
CREATE POLICY "Users can view own challenge logs" 
ON public.challenge_daily_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participations 
    WHERE id = challenge_daily_logs.participation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own challenge logs" 
ON public.challenge_daily_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.challenge_participations 
    WHERE id = challenge_daily_logs.participation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own challenge logs" 
ON public.challenge_daily_logs 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participations 
    WHERE id = challenge_daily_logs.participation_id 
    AND user_id = auth.uid()
  )
);

-- Políticas RLS para mensagens do grupo
CREATE POLICY "Users can view group messages for their challenges" 
ON public.challenge_group_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participations 
    WHERE challenge_id = challenge_group_messages.challenge_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create group messages for their challenges" 
ON public.challenge_group_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.challenge_participations 
    WHERE challenge_id = challenge_group_messages.challenge_id 
    AND user_id = auth.uid()
  )
);

-- Inserir desafios de exemplo
INSERT INTO public.challenges (title, description, category, difficulty, duration_days, points_reward, badge_icon, badge_name, instructions, tips, daily_log_type, daily_log_unit, daily_log_target) VALUES
('Jejum 16:8 por 7 dias', '16h de jejum, 8h de alimentação por 7 dias consecutivos', 'jejum', 'medio', 7, 200, '⏰', 'Disciplina do Jejum', 'Mantenha 16 horas de jejum seguidas de 8 horas de alimentação todos os dias', '{"Beba bastante água durante o jejum", "Quebre o jejum com alimentos leves", "Mantenha os horários consistentes"}', 'boolean', 'dia', 1),

('10.000 passos por dia', 'Caminhe 10.000 passos diariamente por 30 dias', 'exercicio', 'medio', 30, 300, '🚶', 'Caminhante Dedicado', 'Registre pelo menos 10.000 passos todos os dias', '{"Use um contador de passos", "Caminhe em diferentes horários", "Convide amigos para caminhar"}', 'quantity', 'passos', 10000),

('2L de água por dia', 'Beba pelo menos 2 litros de água todos os dias por 30 dias', 'hidratacao', 'facil', 30, 150, '💧', 'Hidratação Master', 'Registre o consumo diário de água em litros', '{"Use uma garrafa de 500ml", "Defina lembretes", "Adicione limão para variar"}', 'quantity', 'litros', 2),

('30 dias de meditação', 'Medite por pelo menos 10 minutos todos os dias por 30 dias', 'mindfulness', 'medio', 30, 250, '🧘', 'Mente Zen', 'Pratique meditação diariamente', '{"Comece com 5 minutos", "Use apps de meditação", "Encontre um local silencioso"}', 'hours', 'minutos', 10),

('Pesagem semanal', 'Se pese uma vez por semana por 8 semanas', 'medicao', 'facil', 56, 100, '⚖️', 'Monitoramento Constante', 'Registre seu peso semanalmente', '{"Use sempre a mesma balança", "Pese-se no mesmo horário", "Registre outras medidas também"}', 'boolean', 'pesagem', 1);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();