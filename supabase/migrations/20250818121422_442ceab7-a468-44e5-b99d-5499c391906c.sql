-- Create user_subscriptions table for managing subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL,
  asaas_subscription_id TEXT,
  asaas_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create subscription_plans table for plan definitions
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for plans (read-only for everyone)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by everyone" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- Insert the three plans
INSERT INTO public.subscription_plans (id, name, description, price, features) VALUES
('basic', 'Plano Básico', 'Funcionalidades essenciais para começar sua jornada', 9.90, 
 ARRAY['2 cardápios por mês (a cada 15 dias)', '1 exame médico por ano', 'Relatório mensal completo', 'Sofia: 25 análises de refeições/mês', 'Dr. Vital: 5 consultas/mês', 'Dr. Vital: 1 relatório por mês', 'Histórico de 3 meses']),
('premium', 'Plano Premium', 'Tudo do básico + recursos avançados', 29.90, 
 ARRAY['4 cardápios por mês (1 por semana)', '1 exame médico a cada 6 meses', 'Relatório semanal completo', 'Acompanhamento personalizado mensal (30 min)', 'Sofia ilimitada - aprende com cada refeição', 'Dr. Vital: Consultas ilimitadas', 'Dr. Vital: Relatório a cada 7 dias', 'Análises preditivas de saúde']),
('professional', 'Plano Professional', 'Para profissionais da saúde e coaches', 49.90, 
 ARRAY['Cardápios ilimitados', 'Exames médicos ilimitados', 'Relatórios ilimitados + automático 1/semana', 'Acompanhamento personalizado semanal', 'Sofia + Dr. Vital: Consultas ilimitadas', 'Dr. Vital: Relatórios ilimitados + automático', 'Suporte prioritário'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  features = EXCLUDED.features;

-- Create trigger for updating timestamps
CREATE OR REPLACE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();