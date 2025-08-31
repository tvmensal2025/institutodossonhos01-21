-- Criar tabelas que faltam e corrigir políticas RLS para missões diárias

-- Primeiro, verificar se weekly_insights existe, senão criar
CREATE TABLE IF NOT EXISTS public.weekly_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start_date date NOT NULL,
  average_mood decimal(3,2),
  average_energy decimal(3,2),
  average_stress decimal(3,2),
  most_common_gratitude text,
  water_consistency decimal(3,2),
  sleep_consistency decimal(3,2),
  exercise_frequency decimal(3,2),
  total_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Habilitar RLS para weekly_insights
ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;

-- Criar políticas para weekly_insights
CREATE POLICY "Users can view their own weekly insights"
ON public.weekly_insights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly insights"
ON public.weekly_insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly insights"
ON public.weekly_insights FOR UPDATE
USING (auth.uid() = user_id);

-- Corrigir políticas do daily_mission_sessions para evitar conflitos
DROP POLICY IF EXISTS "Users can create their own mission sessions" ON public.daily_mission_sessions;
DROP POLICY IF EXISTS "Users can update their own mission sessions" ON public.daily_mission_sessions;
DROP POLICY IF EXISTS "Users can view their own mission sessions" ON public.daily_mission_sessions;

CREATE POLICY "daily_mission_sessions_select_own"
ON public.daily_mission_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "daily_mission_sessions_insert_own"
ON public.daily_mission_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_mission_sessions_update_own"
ON public.daily_mission_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Corrigir políticas do daily_responses para evitar conflitos
DROP POLICY IF EXISTS "Users can create their own responses" ON public.daily_responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON public.daily_responses;
DROP POLICY IF EXISTS "Users can view their own responses" ON public.daily_responses;
DROP POLICY IF EXISTS "Users manage own daily responses" ON public.daily_responses;

CREATE POLICY "daily_responses_select_own"
ON public.daily_responses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "daily_responses_insert_own"
ON public.daily_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_responses_update_own"
ON public.daily_responses FOR UPDATE
USING (auth.uid() = user_id);

-- Corrigir políticas do health_diary
DROP POLICY IF EXISTS "health_diary_insert" ON public.health_diary;
DROP POLICY IF EXISTS "health_diary_select" ON public.health_diary;
DROP POLICY IF EXISTS "health_diary_update" ON public.health_diary;

CREATE POLICY "health_diary_select_own"
ON public.health_diary FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "health_diary_insert_own"
ON public.health_diary FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "health_diary_update_own"
ON public.health_diary FOR UPDATE
USING (auth.uid() = user_id);

-- Adicionar trigger para updated_at no weekly_insights se não existir
CREATE OR REPLACE FUNCTION update_updated_at_weekly_insights()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_weekly_insights_updated_at ON public.weekly_insights;
CREATE TRIGGER trigger_update_weekly_insights_updated_at
  BEFORE UPDATE ON public.weekly_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_weekly_insights();