-- Tabela para análises avançadas de bioimpedância
CREATE TABLE IF NOT EXISTS public.bioimpedance_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measurement_id UUID NOT NULL,
  
  -- Análises avançadas
  protein_mass_kg DECIMAL(5,2),
  mineral_mass_kg DECIMAL(5,2),
  body_fat_distribution_android DECIMAL(5,2),
  body_fat_distribution_gynoid DECIMAL(5,2),
  metabolic_syndrome_risk TEXT,
  cellular_health_score INTEGER,
  hydration_status TEXT,
  muscle_quality_index DECIMAL(5,2),
  
  -- Comparações temporais
  trends_30_days JSONB,
  trends_90_days JSONB,
  
  -- IA insights
  ai_recommendations TEXT[],
  health_warnings TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para dados do Google Fit
CREATE TABLE IF NOT EXISTS public.google_fit_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Dados de atividade
  steps_count INTEGER,
  distance_meters DECIMAL(10,2),
  calories_burned INTEGER,
  active_minutes INTEGER,
  
  -- Dados de saúde
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  heart_rate_resting INTEGER,
  sleep_duration_minutes INTEGER,
  sleep_quality_score INTEGER,
  
  -- Dados de exercício
  workout_type TEXT,
  workout_duration_minutes INTEGER,
  workout_intensity TEXT,
  
  -- Metadados
  data_date DATE NOT NULL,
  sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para notificações inteligentes
CREATE TABLE IF NOT EXISTS public.smart_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Configuração da notificação
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'weight_reminder', 'exercise_motivation', 'hydration', 'meal_suggestion', 'achievement'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  category TEXT NOT NULL, -- 'health', 'fitness', 'nutrition', 'motivation'
  
  -- Timing inteligente
  trigger_conditions JSONB, -- condições para disparar
  optimal_send_time TIME, -- horário otimizado baseado no comportamento
  frequency_limit INTEGER DEFAULT 1, -- máximo por dia/semana
  
  -- Personalização
  user_preferences JSONB,
  behavioral_data JSONB,
  effectiveness_score DECIMAL(3,2), -- 0-1 baseado em engagement
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  sent_at TIMESTAMP WITH TIME ZONE,
  user_interaction TEXT, -- 'opened', 'dismissed', 'acted_upon'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para preferências de notificação do usuário
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Configurações gerais
  enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  
  -- Tipos de notificação
  weight_reminders BOOLEAN DEFAULT true,
  exercise_motivation BOOLEAN DEFAULT true,
  meal_suggestions BOOLEAN DEFAULT true,
  hydration_reminders BOOLEAN DEFAULT true,
  achievement_alerts BOOLEAN DEFAULT true,
  health_insights BOOLEAN DEFAULT true,
  
  -- Frequência
  max_daily_notifications INTEGER DEFAULT 3,
  preferred_times TIME[],
  
  -- Personalização baseada em comportamento
  learning_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.bioimpedance_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_fit_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policies para bioimpedance_analysis
CREATE POLICY "Users can view own bioimpedance analysis" 
ON public.bioimpedance_analysis FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bioimpedance analysis" 
ON public.bioimpedance_analysis FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies para google_fit_data
CREATE POLICY "Users can view own google fit data" 
ON public.google_fit_data FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own google fit data" 
ON public.google_fit_data FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own google fit data" 
ON public.google_fit_data FOR UPDATE 
USING (auth.uid() = user_id);

-- Policies para smart_notifications
CREATE POLICY "Users can view own notifications" 
ON public.smart_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.smart_notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Policies para notification_preferences
CREATE POLICY "Users can view own notification preferences" 
ON public.notification_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" 
ON public.notification_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" 
ON public.notification_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_bioimpedance_analysis_user_id ON public.bioimpedance_analysis(user_id);
CREATE INDEX idx_google_fit_data_user_date ON public.google_fit_data(user_id, data_date);
CREATE INDEX idx_smart_notifications_user_active ON public.smart_notifications(user_id, is_active);

-- Trigger para updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();