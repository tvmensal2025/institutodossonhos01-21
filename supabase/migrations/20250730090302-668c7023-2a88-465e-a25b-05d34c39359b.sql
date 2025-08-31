-- Criar tabela company_data
CREATE TABLE IF NOT EXISTS public.company_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'Instituto dos Sonhos',
  description TEXT DEFAULT 'Plataforma de saúde e bem-estar',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir dados padrão da empresa
INSERT INTO public.company_data (company_name, description, primary_color, secondary_color)
VALUES ('Instituto dos Sonhos', 'Plataforma de saúde e bem-estar', '#6366f1', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

-- Criar tabela preventive_health_analyses
CREATE TABLE IF NOT EXISTS public.preventive_health_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  risk_factors JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  vital_signs JSONB DEFAULT '{}',
  lifestyle_factors JSONB DEFAULT '{}',
  analysis_summary TEXT,
  next_checkup_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices
CREATE INDEX IF NOT EXISTS idx_preventive_analyses_user_id ON public.preventive_health_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_preventive_analyses_date ON public.preventive_health_analyses(analysis_date);

-- Criar tabela ai_configurations
CREATE TABLE IF NOT EXISTS public.ai_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  functionality TEXT NOT NULL UNIQUE,
  service TEXT NOT NULL DEFAULT 'openai',
  model TEXT NOT NULL,
  max_tokens INTEGER NOT NULL DEFAULT 1024,
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7,
  preset_level TEXT NOT NULL DEFAULT 'medio' CHECK (preset_level IN ('minimo', 'medio', 'maximo')),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão de IA baseadas na imagem
INSERT INTO public.ai_configurations (functionality, service, model, max_tokens, temperature, preset_level) VALUES
('chat_daily', 'openai', 'gpt-4.1-2025-04-14', 4096, 0.8, 'medio'),
('weekly_report', 'openai', 'o3-2025-04-16', 8192, 0.7, 'maximo'),
('monthly_report', 'openai', 'o3-2025-04-16', 8192, 0.6, 'maximo'),
('medical_analysis', 'openai', 'o3-2025-04-16', 8192, 0.3, 'maximo'),
('preventive_analysis', 'gemini', 'gemini-1.5-pro', 8192, 0.5, 'maximo')
ON CONFLICT (functionality) DO UPDATE SET
  model = EXCLUDED.model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  preset_level = EXCLUDED.preset_level;

-- Adicionar coluna email na tabela profiles se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Trigger para updated_at
CREATE TRIGGER update_company_data_updated_at
    BEFORE UPDATE ON public.company_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preventive_health_analyses_updated_at
    BEFORE UPDATE ON public.preventive_health_analyses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_configurations_updated_at
    BEFORE UPDATE ON public.ai_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();