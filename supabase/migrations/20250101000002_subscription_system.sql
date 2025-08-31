-- Migration: Sistema de Assinaturas Mensais
-- Criação das tabelas para gerenciar assinaturas e pagamentos

-- Tabela de planos de assinatura
CREATE TABLE subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  interval_type VARCHAR(20) DEFAULT 'monthly',
  interval_count INTEGER DEFAULT 1,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de assinaturas dos usuários
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
  asaas_customer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(user_id, plan_id)
);

-- Tabela de pagamentos/faturas
CREATE TABLE subscription_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  asaas_payment_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  invoice_url TEXT,
  bank_slip_url TEXT,
  pix_qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de controle de acesso a conteúdo
CREATE TABLE content_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type VARCHAR(100) NOT NULL, -- 'course', 'lesson', 'module', etc.
  content_id VARCHAR(255) NOT NULL,
  access_granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(user_id, content_type, content_id)
);

-- Índices para performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_subscription_invoices_subscription_id ON subscription_invoices(subscription_id);
CREATE INDEX idx_subscription_invoices_status ON subscription_invoices(status);
CREATE INDEX idx_content_access_user_content ON content_access(user_id, content_type, content_id);

-- Inserir plano padrão de R$ 29,90
INSERT INTO subscription_plans (name, description, price, features) VALUES 
(
  'Plataforma dos Sonhos Premium',
  'Acesso completo a todos os cursos e conteúdos da plataforma',
  29.90,
  '["Acesso a todos os cursos", "Conteúdo premium desbloqueado", "Suporte prioritário", "Downloads de materiais", "Certificados de conclusão"]'
);

-- Funções para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_invoices_updated_at BEFORE UPDATE ON subscription_invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar se usuário tem acesso ativo
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_subscriptions 
    WHERE user_id = user_uuid 
      AND status = 'active' 
      AND current_period_end > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar acesso a conteúdo específico
CREATE OR REPLACE FUNCTION user_has_content_access(user_uuid UUID, content_type_param VARCHAR, content_id_param VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica se tem assinatura ativa
  IF user_has_active_subscription(user_uuid) THEN
    RETURN TRUE;
  END IF;
  
  -- Verifica acesso específico ao conteúdo
  RETURN EXISTS (
    SELECT 1 
    FROM content_access 
    WHERE user_id = user_uuid 
      AND content_type = content_type_param 
      AND content_id = content_id_param 
      AND access_granted = true
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS (Row Level Security)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_access ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_plans (todos podem ler)
CREATE POLICY "subscription_plans_select_all" ON subscription_plans
  FOR SELECT USING (true);

-- Políticas para user_subscriptions (usuários só veem suas próprias)
CREATE POLICY "user_subscriptions_select_own" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_insert_own" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_update_own" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para subscription_invoices (via subscription)
CREATE POLICY "subscription_invoices_select_own" ON subscription_invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions us 
      WHERE us.id = subscription_invoices.subscription_id 
        AND us.user_id = auth.uid()
    )
  );

-- Políticas para content_access (usuários só veem seus próprios acessos)
CREATE POLICY "content_access_select_own" ON content_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "content_access_insert_own" ON content_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "content_access_update_own" ON content_access
  FOR UPDATE USING (auth.uid() = user_id); 

-- 1. CRIAR TABELA PROFILES SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. EXPANDIR TABELA PROFILES COM NOVOS CAMPOS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. CRIAR TABELA DE INTEGRAÇÕES DE SAÚDE
CREATE TABLE IF NOT EXISTS public.health_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  api_key TEXT,
  client_id TEXT,
  client_secret TEXT,
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA DE DADOS CARDÍACOS E ATIVIDADES
CREATE TABLE IF NOT EXISTS public.heart_rate_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  heart_rate_bpm INTEGER NOT NULL,
  heart_rate_variability DECIMAL(6,2),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  recovery_time INTEGER, -- em segundos
  device_type VARCHAR(50) DEFAULT 'manual',
  device_model VARCHAR(100),
  activity_type VARCHAR(50), -- 'rest', 'exercise', 'sleep', 'activity'
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA DE SESSÕES DE EXERCÍCIO
CREATE TABLE IF NOT EXISTS public.exercise_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_type VARCHAR(50) NOT NULL, -- 'cardio', 'strength', 'yoga', 'walking', etc
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  min_heart_rate INTEGER,
  distance_km DECIMAL(6,2),
  steps INTEGER,
  zones JSONB, -- zonas de frequência cardíaca
  device_type VARCHAR(50) DEFAULT 'manual',
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR TABELA DE SINCRONIZAÇÃO COM DISPOSITIVOS
CREATE TABLE IF NOT EXISTS public.device_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_name VARCHAR(50) NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  sync_type VARCHAR(30) NOT NULL, -- 'heart_rate', 'weight', 'exercise', 'sleep'
  records_synced INTEGER DEFAULT 0,
  sync_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'error'
  error_message TEXT,
  last_sync_date DATE,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INSERIR INTEGRAÇÕES PADRÃO
INSERT INTO public.health_integrations (name, display_name, config) VALUES
('google_fit', 'Google Fit', '{"scopes": ["fitness.activity.read", "fitness.body.read", "fitness.heart_rate.read"]}'),
('polar_h10', 'Polar H10', '{"bluetooth": true, "real_time": true}'),
('apple_health', 'Apple Health', '{"healthkit": true}'),
('fitbit', 'Fitbit', '{"oauth2": true}'),
('samsung_health', 'Samsung Health', '{"partner_api": true}'),
('garmin_connect', 'Garmin Connect IQ', '{"oauth1": true}'),
('withings', 'Withings (Nokia)', '{"oauth2": true}'),
('oura_ring', 'Oura Ring', '{"oauth2": true, "sleep_tracking": true}'),
('whoop', 'WHOOP', '{"oauth2": true, "recovery_tracking": true}'),
('xiaomi_mi_fit', 'Xiaomi Mi Fit', '{"bluetooth": true}')
ON CONFLICT (name) DO NOTHING;

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_heart_rate_user_date ON public.heart_rate_data(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user_date ON public.exercise_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_sync_user_integration ON public.device_sync_log(user_id, integration_name, synced_at DESC);

-- 8. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.health_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heart_rate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sync_log ENABLE ROW LEVEL SECURITY;

-- Políticas para health_integrations (apenas admins podem ver/editar)
CREATE POLICY "Admins can manage integrations" ON public.health_integrations
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para heart_rate_data
CREATE POLICY "Users can view own heart rate data" ON public.heart_rate_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own heart rate data" ON public.heart_rate_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own heart rate data" ON public.heart_rate_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para exercise_sessions
CREATE POLICY "Users can view own exercise sessions" ON public.exercise_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise sessions" ON public.exercise_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise sessions" ON public.exercise_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para device_sync_log
CREATE POLICY "Users can view own sync logs" ON public.device_sync_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs" ON public.device_sync_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. FUNÇÃO PARA CALCULAR ZONAS DE FREQUÊNCIA CARDÍACA
CREATE OR REPLACE FUNCTION calculate_heart_rate_zones(age INTEGER, resting_hr INTEGER DEFAULT 60)
RETURNS JSONB AS $$
DECLARE
  max_hr INTEGER;
  zone1_min INTEGER;
  zone1_max INTEGER;
  zone2_min INTEGER;
  zone2_max INTEGER;
  zone3_min INTEGER;
  zone3_max INTEGER;
  zone4_min INTEGER;
  zone4_max INTEGER;
  zone5_min INTEGER;
  zone5_max INTEGER;
BEGIN
  -- Calcular frequência cardíaca máxima
  max_hr := 220 - age;
  
  -- Calcular zonas usando método de Karvonen
  zone1_min := resting_hr + ((max_hr - resting_hr) * 0.50)::INTEGER; -- 50-60% - Recuperação
  zone1_max := resting_hr + ((max_hr - resting_hr) * 0.60)::INTEGER;
  
  zone2_min := resting_hr + ((max_hr - resting_hr) * 0.60)::INTEGER; -- 60-70% - Base aeróbica
  zone2_max := resting_hr + ((max_hr - resting_hr) * 0.70)::INTEGER;
  
  zone3_min := resting_hr + ((max_hr - resting_hr) * 0.70)::INTEGER; -- 70-80% - Aeróbico
  zone3_max := resting_hr + ((max_hr - resting_hr) * 0.80)::INTEGER;
  
  zone4_min := resting_hr + ((max_hr - resting_hr) * 0.80)::INTEGER; -- 80-90% - Limiar
  zone4_max := resting_hr + ((max_hr - resting_hr) * 0.90)::INTEGER;
  
  zone5_min := resting_hr + ((max_hr - resting_hr) * 0.90)::INTEGER; -- 90-100% - Neuromuscular
  zone5_max := max_hr;
  
  RETURN jsonb_build_object(
    'max_hr', max_hr,
    'resting_hr', resting_hr,
    'zone1', jsonb_build_object('name', 'Recuperação', 'min', zone1_min, 'max', zone1_max, 'color', '#4CAF50'),
    'zone2', jsonb_build_object('name', 'Base Aeróbica', 'min', zone2_min, 'max', zone2_max, 'color', '#2196F3'),
    'zone3', jsonb_build_object('name', 'Aeróbico', 'min', zone3_min, 'max', zone3_max, 'color', '#FF9800'),
    'zone4', jsonb_build_object('name', 'Limiar', 'min', zone4_min, 'max', zone4_max, 'color', '#FF5722'),
    'zone5', jsonb_build_object('name', 'Neuromuscular', 'min', zone5_min, 'max', zone5_max, 'color', '#F44336')
  );
END;
$$ LANGUAGE plpgsql;

-- 10. TRIGGER PARA CALCULAR ZONAS DE FC AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION auto_calculate_heart_zones()
RETURNS TRIGGER AS $$
DECLARE
  user_age INTEGER;
  avg_resting_hr INTEGER;
  zones JSONB;
BEGIN
  -- Buscar idade do usuário
  SELECT age INTO user_age FROM public.profiles WHERE user_id = NEW.user_id;
  
  -- Calcular FC de repouso média dos últimos dados
  SELECT AVG(heart_rate_bpm)::INTEGER INTO avg_resting_hr
  FROM public.heart_rate_data 
  WHERE user_id = NEW.user_id 
    AND activity_type = 'rest' 
    AND recorded_at >= NOW() - INTERVAL '30 days';
  
  -- Se não tem dados de repouso, usar padrão
  IF avg_resting_hr IS NULL THEN
    avg_resting_hr := 60;
  END IF;
  
  -- Calcular zonas
  IF user_age IS NOT NULL THEN
    zones := calculate_heart_rate_zones(user_age, avg_resting_hr);
    NEW.zones := zones;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_heart_zones
  BEFORE INSERT ON public.exercise_sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_heart_zones();

-- 11. FUNÇÃO PARA SINCRONIZAR DADOS DE DISPOSITIVOS
CREATE OR REPLACE FUNCTION sync_device_data(
  p_user_id UUID,
  p_integration_name VARCHAR(50),
  p_device_type VARCHAR(50),
  p_data JSONB
)
RETURNS INTEGER AS $$
DECLARE
  records_inserted INTEGER := 0;
  data_record JSONB;
BEGIN
  -- Log início da sincronização
  INSERT INTO public.device_sync_log (user_id, integration_name, device_type, sync_type, sync_status)
  VALUES (p_user_id, p_integration_name, p_device_type, 'heart_rate', 'pending');
  
  -- Processar dados de frequência cardíaca
  IF p_data ? 'heart_rate_data' THEN
    FOR data_record IN SELECT * FROM jsonb_array_elements(p_data->'heart_rate_data')
    LOOP
      INSERT INTO public.heart_rate_data (
        user_id, heart_rate_bpm, device_type, device_model, activity_type, recorded_at
      ) VALUES (
        p_user_id,
        (data_record->>'heart_rate')::INTEGER,
        p_device_type,
        data_record->>'device_model',
        COALESCE(data_record->>'activity_type', 'activity'),
        (data_record->>'timestamp')::TIMESTAMP WITH TIME ZONE
      )
      ON CONFLICT DO NOTHING;
      
      records_inserted := records_inserted + 1;
    END LOOP;
  END IF;
  
  -- Atualizar log de sincronização
  UPDATE public.device_sync_log 
  SET records_synced = records_inserted, sync_status = 'success'
  WHERE user_id = p_user_id 
    AND integration_name = p_integration_name 
    AND synced_at = (SELECT MAX(synced_at) FROM public.device_sync_log WHERE user_id = p_user_id);
  
  RETURN records_inserted;
END;
$$ LANGUAGE plpgsql;

-- 12. TRIGGERS PARA UPDATED_AT
CREATE TRIGGER update_health_integrations_updated_at
  BEFORE UPDATE ON public.health_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column(); 