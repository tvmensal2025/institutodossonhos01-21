-- Corrigir warnings de segurança da função criada
CREATE OR REPLACE FUNCTION upsert_assessment(
  p_user_id uuid,
  p_week_start_date date,
  p_goal_achievement_rating integer DEFAULT NULL,
  p_satisfaction_rating integer DEFAULT NULL,
  p_weight_change numeric DEFAULT NULL,
  p_improvements_noted text DEFAULT NULL,
  p_challenges_faced text DEFAULT NULL,
  p_next_week_goals text DEFAULT NULL,
  p_user_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assessment_id uuid;
BEGIN
  -- Verificar se o usuário tem permissão (RLS)
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Acesso negado: usuário não autorizado';
  END IF;

  -- Tentar inserir nova avaliação ou atualizar existente
  INSERT INTO assessments (
    user_id, 
    week_start_date,
    goal_achievement_rating,
    satisfaction_rating,
    weight_change,
    improvements_noted,
    challenges_faced,
    next_week_goals,
    user_name
  ) VALUES (
    p_user_id,
    p_week_start_date,
    p_goal_achievement_rating,
    p_satisfaction_rating,
    p_weight_change,
    p_improvements_noted,
    p_challenges_faced,
    p_next_week_goals,
    p_user_name
  )
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    goal_achievement_rating = EXCLUDED.goal_achievement_rating,
    satisfaction_rating = EXCLUDED.satisfaction_rating,
    weight_change = EXCLUDED.weight_change,
    improvements_noted = EXCLUDED.improvements_noted,
    challenges_faced = EXCLUDED.challenges_faced,
    next_week_goals = EXCLUDED.next_week_goals,
    user_name = EXCLUDED.user_name,
    created_at = now()
  RETURNING id INTO assessment_id;
  
  RETURN assessment_id;
END;
$$;