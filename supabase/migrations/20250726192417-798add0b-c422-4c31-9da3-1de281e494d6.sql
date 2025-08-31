-- Criar trigger para notificações automáticas quando meta for aprovada
CREATE OR REPLACE FUNCTION public.notify_goal_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o status mudou para 'aprovada'
  IF OLD.status != 'aprovada' AND NEW.status = 'aprovada' THEN
    -- Inserir notificação no painel
    INSERT INTO smart_notifications (
      user_id,
      title,
      message,
      type,
      category,
      priority,
      trigger_conditions,
      is_active
    ) VALUES (
      NEW.user_id,
      '🎉 Meta Aprovada!',
      'Sua meta "' || NEW.title || '" foi aprovada! Você ganhou ' || COALESCE(NEW.final_points, 0) || ' pontos.',
      'goal_approval',
      'achievement',
      'high',
      jsonb_build_object('goal_id', NEW.id, 'points', NEW.final_points),
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER goal_approval_notification
  AFTER UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_goal_approval();

-- Adicionar tabela para tracking de convites de metas
CREATE TABLE IF NOT EXISTS public.goal_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL,
  invited_user_id UUID NULL, -- Para usuários da plataforma
  invited_email TEXT NULL,   -- Para emails externos
  invited_whatsapp TEXT NULL, -- Para WhatsApp
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'sent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE NULL
);

-- Habilitar RLS
ALTER TABLE public.goal_invites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view invites for their goals"
  ON public.goal_invites
  FOR SELECT
  USING (
    inviter_id = auth.uid() OR 
    invited_user_id = auth.uid()
  );

CREATE POLICY "Users can create invites for their goals"
  ON public.goal_invites
  FOR INSERT
  WITH CHECK (
    inviter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_goals 
      WHERE id = goal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own invites"
  ON public.goal_invites
  FOR UPDATE
  USING (invited_user_id = auth.uid());