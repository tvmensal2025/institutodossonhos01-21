-- Adicionar trigger para criar notificações quando sessões são atribuídas aos usuários
CREATE OR REPLACE FUNCTION public.notify_user_on_session_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir notificação inteligente quando uma sessão é atribuída
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
    'Nova Sessão Disponível! 🎯',
    'Uma nova sessão foi atribuída para você. Clique para começar seu desenvolvimento pessoal.',
    'session_assignment',
    'sessions',
    'high',
    jsonb_build_object('session_id', NEW.session_id),
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para notificar sobre atribuição de sessões
CREATE TRIGGER trigger_notify_session_assignment
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_session_assignment();

-- Função para criar notificação quando sessão é completada
CREATE OR REPLACE FUNCTION public.notify_user_on_session_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o status mudou para completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
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
      'Sessão Completa! 🎉',
      'Parabéns! Você concluiu uma sessão e deu mais um passo no seu desenvolvimento pessoal.',
      'session_completion',
      'achievement',
      'medium',
      jsonb_build_object('session_id', NEW.session_id, 'completion_date', NEW.completed_at),
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para notificar sobre conclusão de sessões
CREATE TRIGGER trigger_notify_session_completion
  AFTER UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_session_completion();