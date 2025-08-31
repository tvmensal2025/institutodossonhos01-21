-- ✅ CORREÇÃO: Tabela user_daily_missions ausente + Coluna final_points + Trigger

-- 1. Criar tabela user_daily_missions com todas as colunas necessárias
CREATE TABLE IF NOT EXISTS public.user_daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  section TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  text_response TEXT,
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, mission_date, question_id)
);

-- 2. Habilitar RLS na tabela user_daily_missions
ALTER TABLE public.user_daily_missions ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS para user_daily_missions
CREATE POLICY "Users can manage their own daily missions" 
ON public.user_daily_missions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all daily missions" 
ON public.user_daily_missions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.admin_level = 'super'
  )
);

-- 4. Corrigir coluna user_goals.final_points para NOT NULL
ALTER TABLE public.user_goals 
ALTER COLUMN final_points SET NOT NULL,
ALTER COLUMN final_points SET DEFAULT 0;

-- 5. Criar trigger updated_at para user_daily_missions
CREATE TRIGGER update_user_daily_missions_updated_at
  BEFORE UPDATE ON public.user_daily_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_daily_missions_user_date 
ON public.user_daily_missions(user_id, mission_date);

CREATE INDEX IF NOT EXISTS idx_user_daily_missions_completed 
ON public.user_daily_missions(user_id, completed_at DESC);