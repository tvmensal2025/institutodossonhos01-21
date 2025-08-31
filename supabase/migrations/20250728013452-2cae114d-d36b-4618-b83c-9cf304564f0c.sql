-- Criar tabela para análises preventivas
CREATE TABLE IF NOT EXISTS public.preventive_health_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('quinzenal', 'mensal')),
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  dr_vital_analysis TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('BAIXO', 'MODERADO', 'ALTO', 'CRÍTICO')),
  health_risks TEXT[] DEFAULT '{}',
  positive_points TEXT[] DEFAULT '{}',
  urgent_warnings TEXT[] DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_preventive_analyses_user_id ON public.preventive_health_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_preventive_analyses_type ON public.preventive_health_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_preventive_analyses_date ON public.preventive_health_analyses(analysis_date);
CREATE INDEX IF NOT EXISTS idx_preventive_analyses_risk ON public.preventive_health_analyses(risk_level);

-- RLS Policies
ALTER TABLE public.preventive_health_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preventive analyses" 
ON public.preventive_health_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert preventive analyses" 
ON public.preventive_health_analyses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all preventive analyses" 
ON public.preventive_health_analyses 
FOR ALL 
USING (is_admin_user());

-- Trigger para updated_at
CREATE TRIGGER update_preventive_analyses_updated_at
BEFORE UPDATE ON public.preventive_health_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para agendar análises preventivas automáticas
CREATE OR REPLACE FUNCTION public.schedule_preventive_analysis()
RETURNS TRIGGER AS $$
DECLARE
  last_quinzenal DATE;
  last_mensal DATE;
  should_run_quinzenal BOOLEAN := FALSE;
  should_run_mensal BOOLEAN := FALSE;
BEGIN
  -- Verificar última análise quinzenal
  SELECT MAX(analysis_date::DATE) INTO last_quinzenal
  FROM preventive_health_analyses
  WHERE user_id = NEW.user_id 
    AND analysis_type = 'quinzenal';
  
  -- Verificar última análise mensal
  SELECT MAX(analysis_date::DATE) INTO last_mensal
  FROM preventive_health_analyses
  WHERE user_id = NEW.user_id 
    AND analysis_type = 'mensal';
  
  -- Agendar quinzenal se passou 15 dias
  IF last_quinzenal IS NULL OR (CURRENT_DATE - last_quinzenal) >= 15 THEN
    should_run_quinzenal := TRUE;
  END IF;
  
  -- Agendar mensal se passou 30 dias
  IF last_mensal IS NULL OR (CURRENT_DATE - last_mensal) >= 30 THEN
    should_run_mensal := TRUE;
  END IF;
  
  -- Executar análises se necessário
  IF should_run_quinzenal THEN
    PERFORM net.http_post(
      url := 'https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/preventive-health-analysis',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI"}'::jsonb,
      body := json_build_object('userId', NEW.user_id, 'analysisType', 'quinzenal')::jsonb
    );
  END IF;
  
  IF should_run_mensal THEN
    PERFORM net.http_post(
      url := 'https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/preventive-health-analysis',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI"}'::jsonb,
      body := json_build_object('userId', NEW.user_id, 'analysisType', 'mensal')::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar análise preventiva quando dados são atualizados
CREATE TRIGGER trigger_schedule_preventive_analysis
AFTER INSERT OR UPDATE ON public.weight_measurements
FOR EACH ROW
EXECUTE FUNCTION public.schedule_preventive_analysis();

-- Trigger para executar análise preventiva quando missões são completadas
CREATE TRIGGER trigger_schedule_preventive_analysis_missions
AFTER INSERT OR UPDATE ON public.daily_mission_sessions
FOR EACH ROW
WHEN (NEW.is_completed = TRUE)
EXECUTE FUNCTION public.schedule_preventive_analysis();