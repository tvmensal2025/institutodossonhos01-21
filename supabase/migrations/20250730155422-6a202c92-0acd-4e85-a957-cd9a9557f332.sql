-- Criar tabelas faltantes

-- 1. Criar tabela ai_configurations
CREATE TABLE IF NOT EXISTS public.ai_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  functionality TEXT NOT NULL,
  service TEXT NOT NULL,
  model TEXT NOT NULL,
  max_tokens INTEGER DEFAULT 1000,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Criar tabela company_data
CREATE TABLE IF NOT EXISTS public.company_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  website_url TEXT,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Habilitar RLS e criar políticas para ai_configurations
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AI configurations" 
ON public.ai_configurations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 4. Habilitar RLS e criar políticas para company_data
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage company data" 
ON public.company_data 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Public can view company data" 
ON public.company_data 
FOR SELECT 
USING (true);

-- 5. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_ai_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_configurations_updated_at
  BEFORE UPDATE ON public.ai_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_configurations_updated_at();

CREATE OR REPLACE FUNCTION public.update_company_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_data_updated_at
  BEFORE UPDATE ON public.company_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_data_updated_at();