-- CORREÇÃO CRÍTICA: Apenas políticas RLS essenciais
-- Corrigindo problemas de segurança críticos

-- 1. ai_configurations (contém chaves de API sensíveis)
CREATE POLICY "Only admins can manage AI configurations" ON public.ai_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
    );

-- 2. ai_usage_logs (logs de uso de IA)
CREATE POLICY "Users can view their own AI usage logs" ON public.ai_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create AI usage logs" ON public.ai_usage_logs
    FOR INSERT WITH CHECK (true);

-- 3. receita_componentes (componentes de receitas)
CREATE POLICY "Recipe components are viewable by everyone" ON public.receita_componentes
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage recipe components" ON public.receita_componentes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
    );

-- 4. Corrigir search_path das funções existentes
ALTER FUNCTION public.calculate_imc() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;