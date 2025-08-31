-- Criar tabela de configurações da empresa
CREATE TABLE public.company_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT,
  mission TEXT,
  vision TEXT,
  values TEXT,
  about_us TEXT,
  target_audience TEXT,
  main_services TEXT,
  differentials TEXT,
  company_culture TEXT,
  health_philosophy TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.company_configurations ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem as configurações
CREATE POLICY "Admins can manage company configurations" 
ON public.company_configurations 
FOR ALL 
TO authenticated 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Política para usuários visualizarem (para que a IA possa acessar o contexto)
CREATE POLICY "Users can view company configurations" 
ON public.company_configurations 
FOR SELECT 
TO authenticated 
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_company_configurations_updated_at
  BEFORE UPDATE ON public.company_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();