-- Habilitar RLS e criar políticas para company_data
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de todos os dados da empresa
CREATE POLICY "Everyone can view company data"
ON public.company_data FOR SELECT
USING (true);

-- Habilitar RLS e criar políticas para preventive_health_analyses
ALTER TABLE public.preventive_health_analyses ENABLE ROW LEVEL SECURITY;

-- Políticas para preventive_health_analyses
CREATE POLICY "Users can view their own preventive analyses"
ON public.preventive_health_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preventive analyses"
ON public.preventive_health_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preventive analyses"
ON public.preventive_health_analyses FOR UPDATE
USING (auth.uid() = user_id);

-- Habilitar RLS e criar políticas para ai_configurations
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura das configurações de IA
CREATE POLICY "Everyone can view AI configurations"
ON public.ai_configurations FOR SELECT
USING (true);

-- Política para permitir atualizações (apenas usuários autenticados)
CREATE POLICY "Authenticated users can update AI configurations"
ON public.ai_configurations FOR UPDATE
USING (auth.role() = 'authenticated');