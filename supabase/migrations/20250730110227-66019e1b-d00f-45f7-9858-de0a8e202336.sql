-- Criar tabelas ausentes para sistema de desafios
CREATE TABLE IF NOT EXISTS challenge_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    progress DECIMAL(5,2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS challenge_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participation_id UUID REFERENCES challenge_participations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT false,
    value_logged DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(participation_id, log_date)
);

-- Criar tabela para convites de metas
CREATE TABLE IF NOT EXISTS goal_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES user_goals(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL,
    invitee_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para notificações inteligentes
CREATE TABLE IF NOT EXISTS smart_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para anamnese do usuário
CREATE TABLE IF NOT EXISTS user_anamnesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    medical_history JSONB DEFAULT '{}',
    current_medications JSONB DEFAULT '[]',
    allergies JSONB DEFAULT '[]',
    lifestyle_factors JSONB DEFAULT '{}',
    symptoms JSONB DEFAULT '{}',
    goals JSONB DEFAULT '{}',
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Adicionar campos ausentes
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS tools_data JSONB DEFAULT '{}';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS target_value DECIMAL(10,2);
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'general';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS created_by UUID;

-- Habilitar RLS nas novas tabelas
ALTER TABLE challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_anamnesis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para challenge_participations
CREATE POLICY "Users can view own participations" ON challenge_participations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own participations" ON challenge_participations
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participations" ON challenge_participations
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para challenge_daily_logs
CREATE POLICY "Users can view own logs" ON challenge_daily_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own logs" ON challenge_daily_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON challenge_daily_logs
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para goal_invites
CREATE POLICY "Users can view invites they sent or received" ON goal_invites
FOR SELECT USING (auth.uid() = inviter_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND email = goal_invites.invitee_email));

CREATE POLICY "Users can create invites" ON goal_invites
FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update invite responses" ON goal_invites
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND email = goal_invites.invitee_email));

-- Políticas RLS para smart_notifications
CREATE POLICY "Users can view own notifications" ON smart_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON smart_notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para user_anamnesis
CREATE POLICY "Users can view own anamnesis" ON user_anamnesis
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own anamnesis" ON user_anamnesis
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own anamnesis" ON user_anamnesis
FOR UPDATE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_id ON challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_daily_logs_user_id ON challenge_daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_invites_inviter_id ON goal_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_user_id ON smart_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_anamnesis_user_id ON user_anamnesis(user_id);