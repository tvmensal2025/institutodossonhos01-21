-- Criar tabelas auxiliares que o código está tentando usar

-- Tabela para convites de metas
CREATE TABLE IF NOT EXISTS public.goal_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.user_goals(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL,
  invited_user_id UUID NULL,
  invited_email TEXT NULL,
  invited_whatsapp TEXT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para histórico de atualizações de metas
CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.user_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para notificações inteligentes (se não existir)
CREATE TABLE IF NOT EXISTS public.smart_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  category TEXT DEFAULT 'info',
  priority TEXT DEFAULT 'normal',
  trigger_conditions JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.goal_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para goal_invites
CREATE POLICY "Users can view invites they sent or received" 
ON public.goal_invites 
FOR SELECT 
USING (
  inviter_id = auth.uid() OR 
  invited_user_id = auth.uid()
);

CREATE POLICY "Users can create goal invites" 
ON public.goal_invites 
FOR INSERT 
WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Users can update invites they received" 
ON public.goal_invites 
FOR UPDATE 
USING (invited_user_id = auth.uid());

-- Políticas RLS para goal_updates
CREATE POLICY "Users can view updates from their goals" 
ON public.goal_updates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_goals 
    WHERE id = goal_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create updates for their goals" 
ON public.goal_updates 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.user_goals 
    WHERE id = goal_id AND user_id = auth.uid()
  )
);

-- Políticas RLS para smart_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.smart_notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON public.smart_notifications 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" 
ON public.smart_notifications 
FOR INSERT 
WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_goal_invites_goal_id ON public.goal_invites(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_invites_inviter ON public.goal_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_goal_invites_invited_user ON public.goal_invites(invited_user_id);

CREATE INDEX IF NOT EXISTS idx_goal_updates_goal_id ON public.goal_updates(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_updates_user_id ON public.goal_updates(user_id);

CREATE INDEX IF NOT EXISTS idx_smart_notifications_user_id ON public.smart_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_created_at ON public.smart_notifications(created_at);