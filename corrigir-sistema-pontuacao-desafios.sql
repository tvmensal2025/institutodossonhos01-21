-- Corrigir sistema de pontuação dos desafios
-- Garantir que progresso e pontuação sejam salvos corretamente

-- 1. Verificar estrutura atual das tabelas
SELECT 'Estrutura atual:' as info,
       table_name,
       column_name,
       data_type
FROM information_schema.columns 
WHERE table_name IN ('challenge_participations', 'challenges', 'user_goals')
ORDER BY table_name, column_name;

-- 2. Adicionar colunas necessárias se não existirem
ALTER TABLE public.challenge_participations 
ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT 100,
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 3. Criar função para atualizar progresso do desafio
CREATE OR REPLACE FUNCTION public.update_challenge_progress(
  participation_id UUID,
  new_progress NUMERIC,
  notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  participation_record RECORD;
  challenge_record RECORD;
  points_to_award INTEGER;
  result JSON;
BEGIN
  -- Buscar participação
  SELECT * INTO participation_record 
  FROM public.challenge_participations 
  WHERE id = participation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Participação não encontrada';
  END IF;
  
  -- Buscar desafio
  SELECT * INTO challenge_record 
  FROM public.challenges 
  WHERE id = participation_record.challenge_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Desafio não encontrado';
  END IF;
  
  -- Atualizar progresso
  UPDATE public.challenge_participations 
  SET 
    progress = new_progress,
    last_updated = NOW(),
    is_completed = (new_progress >= challenge_record.daily_log_target)
  WHERE id = participation_id;
  
  -- Calcular pontos se completou
  IF new_progress >= challenge_record.daily_log_target AND NOT participation_record.is_completed THEN
    points_to_award := challenge_record.points_reward;
    
    -- Atualizar pontos ganhos
    UPDATE public.challenge_participations 
    SET points_earned = points_to_award
    WHERE id = participation_id;
    
    -- Adicionar pontos ao perfil do usuário
    UPDATE public.profiles 
    SET 
      points = COALESCE(points, 0) + points_to_award,
      updated_at = NOW()
    WHERE user_id = participation_record.user_id;
  END IF;
  
  -- Registrar log diário se fornecido
  IF notes IS NOT NULL THEN
    INSERT INTO public.challenge_daily_logs (
      participation_id,
      log_date,
      value_logged,
      numeric_value,
      notes
    ) VALUES (
      participation_id,
      CURRENT_DATE,
      notes,
      new_progress,
      notes
    );
  END IF;
  
  -- Retornar resultado
  result := JSON_BUILD_OBJECT(
    'participation_id', participation_id,
    'new_progress', new_progress,
    'is_completed', (new_progress >= challenge_record.daily_log_target),
    'points_awarded', COALESCE(points_to_award, 0),
    'message', 'Progresso atualizado com sucesso'
  );
  
  RETURN result;
END;
$$;

-- 4. Criar função para participar de desafio
CREATE OR REPLACE FUNCTION public.join_challenge(
  user_uuid UUID,
  challenge_uuid UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  challenge_record RECORD;
  participation_id UUID;
  result JSON;
BEGIN
  -- Buscar desafio
  SELECT * INTO challenge_record 
  FROM public.challenges 
  WHERE id = challenge_uuid AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Desafio não encontrado ou inativo';
  END IF;
  
  -- Verificar se já participa
  IF EXISTS (
    SELECT 1 FROM public.challenge_participations 
    WHERE user_id = user_uuid AND challenge_id = challenge_uuid
  ) THEN
    RAISE EXCEPTION 'Usuário já participa deste desafio';
  END IF;
  
  -- Criar participação
  INSERT INTO public.challenge_participations (
    user_id,
    challenge_id,
    target_value,
    progress,
    started_at
  ) VALUES (
    user_uuid,
    challenge_uuid,
    challenge_record.daily_log_target,
    0,
    NOW()
  ) RETURNING id INTO participation_id;
  
  -- Retornar resultado
  result := JSON_BUILD_OBJECT(
    'participation_id', participation_id,
    'challenge_id', challenge_uuid,
    'user_id', user_uuid,
    'message', 'Participação criada com sucesso'
  );
  
  RETURN result;
END;
$$;

-- 5. Verificar se as funções foram criadas
SELECT 'Funções criadas:' as info,
       routine_name,
       routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('update_challenge_progress', 'join_challenge');

-- 6. Resultado final
SELECT 'SISTEMA DE PONTUAÇÃO CORRIGIDO!' as status,
       'Progresso e pontuação serão salvos corretamente' as resultado; 